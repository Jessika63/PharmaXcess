
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

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

    data = request.get_json()
    user_id = data.get("utilisateur_id")
    name = data.get("nom")
    description = data.get("description")
    symptoms = data.get("symptomes")
    start_date = data.get("date_debut")

    if not user_id or not name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO maladies (utilisateur_id, nom, description, symptomes, date_debut)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, name, description, symptoms, start_date))
            conn.commit()
            disease_id = cursor.lastrowid
        return jsonify({"message": "Disease added successfully", "id": disease_id}), 201
    finally:
        conn.close()


# GET ALL
@diseases_bp.route("/diseases/<int:user_id>", methods=["GET"])
def get_all_diseases(user_id):
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM maladies WHERE utilisateur_id=%s", (user_id,))
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM maladies WHERE id=%s", (disease_id,))
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

    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE maladies
                SET nom=%s, description=%s, symptomes=%s, date_debut=%s
                WHERE id=%s
            """, (
                data.get("nom"),
                data.get("description"),
                data.get("symptomes"),
                data.get("date_debut"),
                disease_id
            ))
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM maladies WHERE id=%s", (disease_id,))
            conn.commit()
        return jsonify({"message": "Disease deleted successfully"}), 200
    finally:
        conn.close()
