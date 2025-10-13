
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

hospitalizations_bp = Blueprint("hospitalizations", __name__)

# CREATE
@hospitalizations_bp.route("/hospitalizations", methods=["POST"])
def create_hospitalization():
    """
    Objective:
    Create a new hospitalization record for a user.

    Endpoint: POST /hospitalizations

    Request Body (JSON):
    - utilisateur_id (int, required): ID of the user.
    - type (str, required): Type of hospitalization.
    - description (str, optional): Description of the hospitalization.
    - dates (str, optional): Dates of hospitalization.
    - service (str, optional): Hospital service or department.
    - hopital (str, optional): Name of the hospital.
    - medecin (str, optional): Name of the attending doctor.

    Response:
    - 201 Created: Returns a message indicating successful creation and the new record ID.
    - 400 Bad Request: If required fields are missing.
    - 500 Internal Server Error: If a database error occurs during insertion.
    """

    data = request.get_json()
    user_id = data.get("utilisateur_id")
    hospitalization_type = data.get("type")
    description = data.get("description")

    if not user_id or not hospitalization_type:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO hospitalisations (utilisateur_id, type, description, dates, service, hopital, medecin)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                hospitalization_type,
                description,
                data.get("dates"),
                data.get("service"),
                data.get("hopital"),
                data.get("medecin")
            ))
            conn.commit()
            hospitalization_id = cursor.lastrowid
        return jsonify({"message": "Hospitalization added successfully", "id": hospitalization_id}), 201
    finally:
        conn.close()


# GET ALL (by user)
@hospitalizations_bp.route("/hospitalizations/<int:user_id>", methods=["GET"])
def get_all_hospitalizations(user_id):
    """
    Objective:
    Retrieve all hospitalization records for a specific user.

    Endpoint: GET /hospitalizations/<user_id>

    Parameters:
    - user_id (int, required): ID of the user whose hospitalizations are being queried.

    Response:
    - 200 OK: Returns a JSON array of all hospitalization records for the user.
    - 404 Not Found: If the user has no hospitalizations (optional handling).
    - 500 Internal Server Error: If a database error occurs during the query.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM hospitalisations WHERE utilisateur_id=%s", (user_id,))
            hospitalizations = cursor.fetchall()
        return jsonify(hospitalizations), 200
    finally:
        conn.close()


# GET UNIQUE
@hospitalizations_bp.route("/hospitalization/entry/<int:hospitalization_id>", methods=["GET"])
def get_hospitalization(hospitalization_id):
    """
    Objective:
    Retrieve a specific hospitalization record by its ID.

    Endpoint: GET /hospitalization/entry/<hospitalization_id>

    Parameters:
    - hospitalization_id (int, required): ID of the hospitalization record to retrieve.

    Response:
    - 200 OK: Returns a JSON object representing the hospitalization record.
    - 404 Not Found: If no hospitalization with the given ID exists.
    - 500 Internal Server Error: If a database error occurs during the query.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM hospitalisations WHERE id=%s", (hospitalization_id,))
            hospitalization = cursor.fetchone()
        if not hospitalization:
            return jsonify({"error": "Hospitalization not found"}), 404
        return jsonify(hospitalization), 200
    finally:
        conn.close()


# UPDATE
@hospitalizations_bp.route("/hospitalization/entry/<int:hospitalization_id>", methods=["PUT"])
def update_hospitalization(hospitalization_id):
    """
    Objective:
    Update an existing hospitalization record by its ID with new details.

    Endpoint: PUT /hospitalization/entry/<hospitalization_id>

    Parameters:
    - hospitalization_id (int, required): ID of the hospitalization record to update.
    - JSON body (required): Contains fields to update:
        - type (str): Type of hospitalization.
        - description (str): Description of the hospitalization.
        - dates (str): Dates of hospitalization.
        - service (str): Hospital service or department.
        - hopital (str): Name of the hospital.
        - medecin (str): Name of the attending doctor.

    Response:
    - 200 OK: Hospitalization record updated successfully.
    - 400 Bad Request: If required fields are missing or invalid.
    - 500 Internal Server Error: If a database error occurs during the update.
    """

    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE hospitalisations
                SET type=%s, description=%s, dates=%s, service=%s, hopital=%s, medecin=%s
                WHERE id=%s
            """, (
                data.get("type"),
                data.get("description"),
                data.get("dates"),
                data.get("service"),
                data.get("hopital"),
                data.get("medecin"),
                hospitalization_id
            ))
            conn.commit()
        return jsonify({"message": "Hospitalization updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@hospitalizations_bp.route("/hospitalization/entry/<int:hospitalization_id>", methods=["DELETE"])
def delete_hospitalization(hospitalization_id):
    """
    Objective:
    Delete an existing hospitalization record by its ID from the database.

    Endpoint: DELETE /hospitalization/entry/<hospitalization_id>

    Parameters:
    - hospitalization_id (int, required): ID of the hospitalization record to delete.

    Response:
    - 200 OK: Hospitalization record deleted successfully.
    - 404 Not Found: If no record exists with the given ID.
    - 500 Internal Server Error: If a database error occurs during deletion.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM hospitalisations WHERE id=%s", (hospitalization_id,))
            conn.commit()
        return jsonify({"message": "Hospitalization deleted successfully"}), 200
    finally:
        conn.close()
