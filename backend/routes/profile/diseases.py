
from flask import Blueprint, request, jsonify
import re
from db_app import get_app_connection
from .profile_access import (
    get_current_user_id,
    profile_access_condition,
    profile_target_access_condition,
    is_target_accessible,
)

diseases_bp = Blueprint("diseases", __name__)

# CREATE
@diseases_bp.route("/diseases", methods=["POST"])
def create_disease():
    """
    Objective:
    Create a new disease record for a user in the system.

    Endpoint: POST /diseases

    Request Body (JSON):
    - utilisateur_id (int, required): The ID of the user to associate with the disease.
    - nom (str, required): Name of the disease.
    - description (str, optional): Detailed description of the disease.
    - symptomes (str, optional): Symptoms associated with the disease.
    - date_debut (str, optional): Start date of the disease (e.g., YYYY-MM-DD).

    Response:
    - 201 Created: Returns a success message and the ID of the newly created disease.
    - 400 Bad Request: If required fields are missing.
    - 500 Internal Server Error: If there is a database error during insertion.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    utilisateur_id = data.get("utilisateur_id")
    nom = data.get("nom")
    description = data.get("description")
    symptomes = data.get("symptomes")
    date_debut = data.get("date_debut")
    examens = data.get("examens")
    traitements = data.get("traitements") or data.get("treatments")

    if not utilisateur_id or not nom:
        return jsonify({"error": "Missing required fields"}), 400

    # Verify the target utilisateur is accessible by current user
    condition = profile_target_access_condition('id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Vérifie que l’utilisateur_id ciblé est accessible par le profil courant
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE {condition}
            """, (utilisateur_id, current_user_id, current_user_id))
            accessible = cursor.fetchone()

            if not accessible:
                return jsonify({"error": "You don't have permission to add disease for this user"}), 403

            cursor.execute("""
                INSERT INTO maladies (utilisateur_id, nom, description, symptomes, date_debut, examens)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (utilisateur_id, nom, description, symptomes, date_debut, examens))
            conn.commit()
            disease_id = cursor.lastrowid

            # If traitements provided as a string, create a traitement entry linked to this maladie
            if traitements:
                # Allow multiple treatments separated by newlines or semicolons
                if isinstance(traitements, str):
                    parts = [t.strip() for t in re.split(r"[\n;]+", traitements) if t.strip()]
                elif isinstance(traitements, list):
                    parts = [str(t).strip() for t in traitements if str(t).strip()]
                else:
                    parts = [str(traitements)]

                for t in parts:
                    cursor.execute("""
                        INSERT INTO traitements (maladie_id, nom)
                        VALUES (%s, %s)
                    """, (disease_id, t))
                conn.commit()

        return jsonify({"message": "Disease added successfully", "id": disease_id}), 201
    finally:
        conn.close()


# GET ALL
@diseases_bp.route("/diseases", methods=["GET"])
def get_all_diseases():
    """
    Objective:
    Retrieve all disease records associated with a specific user.

    Endpoint: GET /diseases/<user_id>

    Path Parameters:
    - user_id (int, required): The ID of the user whose diseases are to be retrieved.

    Response:
    - 200 OK: Returns a JSON array of disease records for the specified user.
    - 404 Not Found: If no diseases exist for the user (optional behavior, depending on implementation).
    - 500 Internal Server Error: If there is a database error during retrieval.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    # For listing maladies, filter by owner column
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Aggregate traitements (t.nom) into a single string separated by '||'
            query = f"""
                SELECT m.*, GROUP_CONCAT(t.nom SEPARATOR '||') AS traitements
                FROM maladies m
                LEFT JOIN traitements t ON t.maladie_id = m.id
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE {condition}
                GROUP BY m.id
            """
            cursor.execute(query, (current_user_id, current_user_id))
            diseases = cursor.fetchall()

        return jsonify(diseases), 200
    finally:
        conn.close()


# GET UNIQUE
@diseases_bp.route("/disease/entry/<int:disease_id>", methods=["GET"])
def get_disease(disease_id):
    """
    Objective:
    Retrieve a single disease record by its unique ID.

    Endpoint: GET /disease/entry/<disease_id>

    Path Parameters:
    - disease_id (int, required): The ID of the disease to retrieve.

    Response:
    - 200 OK: Returns a JSON object representing the disease.
    - 404 Not Found: If no disease exists with the specified ID.
    - 500 Internal Server Error: If there is a database error during retrieval.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Include traitements aggregated for the single disease
            query = f"""
                SELECT m.*, GROUP_CONCAT(t.nom SEPARATOR '||') AS traitements
                FROM maladies m
                LEFT JOIN traitements t ON t.maladie_id = m.id
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE m.id = %s AND {condition}
                GROUP BY m.id
            """
            cursor.execute(query, (disease_id, current_user_id, current_user_id))
            disease = cursor.fetchone()

        if not disease:
            return jsonify({"error": "Disease not found"}), 404
        return jsonify(disease), 200
    finally:
        conn.close()


# UPDATE
@diseases_bp.route("/disease/entry/<int:disease_id>", methods=["PUT"])
def update_disease(disease_id):
    """
    Objective:
    Update an existing disease record in the database by its unique ID.

    Endpoint: PUT /disease/entry/<disease_id>

    Path Parameters:
    - disease_id (int, required): The ID of the disease to update.

    Request Body (JSON):
    - nom (string, optional): The name of the disease.
    - description (string, optional): Description of the disease.
    - symptomes (string, optional): Symptoms associated with the disease.
    - date_debut (string, optional): Start date of the disease.

    Response:
    - 200 OK: Returns a message confirming the update.
    - 400 Bad Request: If required fields are missing.
    - 500 Internal Server Error: If there is a database error during the update.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    examens = data.get("examens")
    traitements = data.get("traitements") or data.get("treatments")
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Fetch owner and verify permission: main can access subprofiles, sub only self
            cursor.execute("SELECT utilisateur_id FROM maladies WHERE id = %s", (disease_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": "Disease not found"}), 404

            owner_id = row['utilisateur_id']
            if not is_target_accessible(cursor, owner_id, 'id'):
                return jsonify({"error": "No permission to update this disease"}), 403

            # Perform update now that permission is confirmed
            query = """
                UPDATE maladies
                SET nom=%s, description=%s, symptomes=%s, date_debut=%s, examens=%s
                WHERE id=%s
            """
            cursor.execute(query, (
                data.get("nom"),
                data.get("description"),
                data.get("symptomes"),
                data.get("date_debut"),
                examens,
                disease_id,
            ))

            if cursor.rowcount == 0:
                return jsonify({"error": "Disease not found or not updated"}), 404

            # If traitements provided, replace existing traitements for this maladie
            if traitements is not None:
                cursor.execute("DELETE FROM traitements WHERE maladie_id = %s", (disease_id,))
                # Insert new traitements; accept string or list
                if isinstance(traitements, str):
                    parts = [t.strip() for t in re.split(r"[\n;]+", traitements) if t.strip()]
                elif isinstance(traitements, list):
                    parts = [str(t).strip() for t in traitements if str(t).strip()]
                else:
                    parts = [str(traitements)]

                for t in parts:
                    cursor.execute("""
                        INSERT INTO traitements (maladie_id, nom)
                        VALUES (%s, %s)
                    """, (disease_id, t))

            conn.commit()

        return jsonify({"message": "Disease updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@diseases_bp.route("/disease/entry/<int:disease_id>", methods=["DELETE"])
def delete_disease(disease_id):
    """
    Objective:
    Delete a disease record from the database by its unique ID.

    Endpoint: DELETE /disease/entry/<disease_id>

    Path Parameters:
    - disease_id (int, required): The ID of the disease to delete.

    Response:
    - 200 OK: Returns a message confirming the deletion.
    - 404 Not Found: If the disease with the given ID does not exist.
    - 500 Internal Server Error: If there is a database error during deletion.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                DELETE m FROM maladies m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE m.id = %s AND {condition}
            """
            cursor.execute(query, (disease_id, current_user_id, current_user_id))

            if cursor.rowcount == 0:
                return jsonify({"error": "Disease not found or no permission"}), 404

            conn.commit()

        return jsonify({"message": "Disease deleted successfully"}), 200
    finally:
        conn.close()
