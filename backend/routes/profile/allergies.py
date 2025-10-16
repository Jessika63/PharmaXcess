
from flask import Blueprint, request, jsonify, session
from db_app import get_app_connection
from .profile_access import get_current_user_id, profile_access_condition

allergies_bp = Blueprint("allergies", __name__)

# CREATE
@allergies_bp.route("/allergy", methods=["POST"])
def create_allergy():
    """
    Objective:
    Create a new allergy record for a user in the database.

    Endpoint: POST /allergy

    Request JSON:
    - utilisateur_id (int, required): ID of the user to whom the allergy belongs.
    - nom (str, required): Name of the allergy.
    - debut (str, optional): Start date of the allergy.
    - gravite (str, optional): Severity of the allergy.
    - symptomes (str, optional): Symptoms of the allergy.
    - commentaires (str, optional): Additional comments.

    Response:
    - 201 Created: Returns a success message and the ID of the newly created allergy.
    - 400 Bad Request: Returned if required fields are missing.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    utilisateur_id = data.get("utilisateur_id")
    nom = data.get("nom")

    if not utilisateur_id or not nom:
        return jsonify({"error": "Missing required fields"}), 400

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Vérifie que l’utilisateur_id ciblé est bien accessible
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE id = %s AND {condition}
            """, (utilisateur_id, current_user_id, current_user_id))
            accessible = cursor.fetchone()

            if not accessible:
                return jsonify({"error": "You don't have permission to add allergy for this user"}), 403

            cursor.execute("""
                INSERT INTO allergies (utilisateur_id, nom, debut, gravite, symptomes, commentaires)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                utilisateur_id,
                nom,
                data.get("debut"),
                data.get("gravite"),
                data.get("symptomes"),
                data.get("commentaires"),
            ))
            conn.commit()
            allergy_id = cursor.lastrowid

        return jsonify({"message": "Allergy added successfully", "id": allergy_id}), 201
    finally:
        conn.close()


# GET ALL (by user)
@allergies_bp.route("/allergy", methods=["GET"])
def get_all_allergies():
    """
    Objective:
    Retrieve all allergy records associated with a specific user.

    Endpoint: GET /allergy/<user_id>

    Path Parameters:
    - user_id (int, required): ID of the user whose allergies are being requested.

    Response:
    - 200 OK: Returns a JSON list of allergy records for the specified user.
    - Each record contains fields: id, utilisateur_id, nom, debut, gravite, symptomes, commentaires, created_at, updated_at.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT a.*
                FROM allergies a
                JOIN utilisateurs u ON a.utilisateur_id = u.id
                WHERE {condition}
            """
            cursor.execute(query, (current_user_id, current_user_id))
            allergies = cursor.fetchall()

        return jsonify(allergies), 200
    finally:
        conn.close()


# GET ONE
@allergies_bp.route("/allergy/entry/<int:allergy_id>", methods=["GET"])
def get_allergy(allergy_id):
    """
    Objective:
    Retrieve a single allergy record by its unique ID.

    Endpoint: GET /allergy/entry/<allergy_id>

    Path Parameters:
    - allergy_id (int, required): The unique ID of the allergy entry to retrieve.

    Response:
    - 200 OK: Returns a JSON object representing the allergy record.
    - 404 Not Found: Returns an error message if no allergy with the given ID exists.
    - The allergy record contains fields: id, utilisateur_id, nom, debut, gravite, symptomes, commentaires, created_at, updated_at.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT a.*
                FROM allergies a
                JOIN utilisateurs u ON a.utilisateur_id = u.id
                WHERE a.id = %s AND {condition}
            """
            cursor.execute(query, (allergy_id, current_user_id, current_user_id))
            allergy = cursor.fetchone()

        if not allergy:
            return jsonify({"error": "Allergy not found"}), 404
        return jsonify(allergy), 200
    finally:
        conn.close()


# UPDATE
@allergies_bp.route("/allergy/entry/<int:allergy_id>", methods=["PUT"])
def update_allergy(allergy_id):
    """
    Objective:
    Update an existing allergy record identified by its unique ID.

    Endpoint: PUT /allergy/entry/<allergy_id>

    Path Parameters:
    - allergy_id (int, required): The unique ID of the allergy entry to update.

    Request Body (JSON):
    - nom (string, optional): Name of the allergy.
    - debut (string, optional): Start date of the allergy.
    - gravite (string, optional): Severity of the allergy.
    - symptomes (string, optional): Symptoms associated with the allergy.
    - commentaires (string, optional): Additional comments.

    Response:
    - 200 OK: Returns a success message if the allergy was updated.
    - 400 Bad Request: If required fields are missing or invalid.
    - 404 Not Found: If the allergy with the given ID does not exist.
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
                UPDATE allergies a
                JOIN utilisateurs u ON a.utilisateur_id = u.id
                SET a.nom=%s, a.debut=%s, a.gravite=%s, a.symptomes=%s, a.commentaires=%s
                WHERE a.id=%s AND {condition}
            """
            cursor.execute(query, (
                data.get("nom"),
                data.get("debut"),
                data.get("gravite"),
                data.get("symptomes"),
                data.get("commentaires"),
                allergy_id,
                current_user_id,
                current_user_id
            ))

            if cursor.rowcount == 0:
                return jsonify({"error": "Allergy not found or no permission"}), 404

            conn.commit()

        return jsonify({"message": "Allergy updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@allergies_bp.route("/allergy/entry/<int:allergy_id>", methods=["DELETE"])
def delete_allergy(allergy_id):
    """
    Objective:
    Delete an existing allergy record identified by its unique ID.

    Endpoint: DELETE /allergy/entry/<allergy_id>

    Path Parameters:
    - allergy_id (int, required): The unique ID of the allergy entry to delete.

    Response:
    - 200 OK: Returns a success message if the allergy was deleted.
    - 404 Not Found: If the allergy with the given ID does not exist.
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
                DELETE a FROM allergies a
                JOIN utilisateurs u ON a.utilisateur_id = u.id
                WHERE a.id=%s AND {condition}
            """
            cursor.execute(query, (allergy_id, current_user_id, current_user_id))

            if cursor.rowcount == 0:
                return jsonify({"error": "Allergy not found or no permission"}), 404

            conn.commit()

        return jsonify({"message": "Allergy deleted successfully"}), 200
    finally:
        conn.close()
