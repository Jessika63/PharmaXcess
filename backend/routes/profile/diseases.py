
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from .profile_access import get_current_user_id, profile_access_condition

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

    if not utilisateur_id or not nom:
        return jsonify({"error": "Missing required fields"}), 400

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Vérifie que l’utilisateur_id ciblé est accessible par le profil courant
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE id = %s AND {condition}
            """, (utilisateur_id, current_user_id, current_user_id))
            accessible = cursor.fetchone()

            if not accessible:
                return jsonify({"error": "You don't have permission to add disease for this user"}), 403

            cursor.execute("""
                INSERT INTO maladies (utilisateur_id, nom, description, symptomes, date_debut)
                VALUES (%s, %s, %s, %s, %s)
            """, (utilisateur_id, nom, description, symptomes, date_debut))
            conn.commit()
            disease_id = cursor.lastrowid

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

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT m.*
                FROM maladies m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE {condition}
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

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT m.*
                FROM maladies m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE m.id = %s AND {condition}
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
    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                UPDATE maladies m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                SET m.nom=%s, m.description=%s, m.symptomes=%s, m.date_debut=%s
                WHERE m.id=%s AND {condition}
            """
            cursor.execute(query, (
                data.get("nom"),
                data.get("description"),
                data.get("symptomes"),
                data.get("date_debut"),
                disease_id,
                current_user_id,
                current_user_id
            ))

            if cursor.rowcount == 0:
                return jsonify({"error": "Disease not found or no permission"}), 404

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

    condition = profile_access_condition()

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
