
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

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

    data = request.get_json()
    user_id = data.get("utilisateur_id")
    name = data.get("nom")

    if not user_id or not name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO allergies (utilisateur_id, nom, debut, gravite, symptomes, commentaires)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                name,
                data.get("debut"),
                data.get("gravite"),
                data.get("symptomes"),
                data.get("commentaires")
            ))
            conn.commit()
            allergy_id = cursor.lastrowid
        return jsonify({"message": "Allergy added successfully", "id": allergy_id}), 201
    finally:
        conn.close()


# GET ALL (by user)
@allergies_bp.route("/allergy/<int:user_id>", methods=["GET"])
def get_all_allergies(user_id):
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM allergies WHERE utilisateur_id=%s", (user_id,))
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM allergies WHERE id=%s", (allergy_id,))
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

    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE allergies
                SET nom=%s, debut=%s, gravite=%s, symptomes=%s, commentaires=%s
                WHERE id=%s
            """, (
                data.get("nom"),
                data.get("debut"),
                data.get("gravite"),
                data.get("symptomes"),
                data.get("commentaires"),
                allergy_id
            ))
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM allergies WHERE id=%s", (allergy_id,))
            conn.commit()
        return jsonify({"message": "Allergy deleted successfully"}), 200
    finally:
        conn.close()
