
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from profile_access import get_current_user_id, profile_access_condition

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
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    utilisateur_id = data.get("utilisateur_id")
    hospitalization_type = data.get("type")

    if not utilisateur_id or not hospitalization_type:
        return jsonify({"error": "Missing required fields"}), 400

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Check access
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE id=%s AND {condition}
            """, (utilisateur_id, current_user_id, current_user_id))
            accessible = cursor.fetchone()
            if not accessible:
                return jsonify({"error": "You don't have permission to add a hospitalization for this user"}), 403

            cursor.execute("""
                INSERT INTO hospitalisations (utilisateur_id, type, description, dates, service, hopital, medecin)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                utilisateur_id,
                hospitalization_type,
                data.get("description"),
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


# GET ALL
@hospitalizations_bp.route("/hospitalizations", methods=["GET"])
def get_all_hospitalizations():
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
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT h.*
                FROM hospitalisations h
                JOIN utilisateurs u ON h.utilisateur_id = u.id
                WHERE {condition}
            """
            cursor.execute(query, (current_user_id, current_user_id))
            hospitalizations = cursor.fetchall()
        return jsonify(hospitalizations), 200
    finally:
        conn.close()


# GET ONE
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
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT h.*
                FROM hospitalisations h
                JOIN utilisateurs u ON h.utilisateur_id = u.id
                WHERE h.id=%s AND {condition}
            """
            cursor.execute(query, (hospitalization_id, current_user_id, current_user_id))
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
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                UPDATE hospitalisations h
                JOIN utilisateurs u ON h.utilisateur_id = u.id
                SET h.type=%s, h.description=%s, h.dates=%s, h.service=%s, h.hopital=%s, h.medecin=%s
                WHERE h.id=%s AND {condition}
            """
            cursor.execute(query, (
                data.get("type"),
                data.get("description"),
                data.get("dates"),
                data.get("service"),
                data.get("hopital"),
                data.get("medecin"),
                hospitalization_id,
                current_user_id,
                current_user_id
            ))

            if cursor.rowcount == 0:
                return jsonify({"error": "Hospitalization not found or no permission"}), 404

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
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                DELETE h FROM hospitalisations h
                JOIN utilisateurs u ON h.utilisateur_id = u.id
                WHERE h.id=%s AND {condition}
            """
            cursor.execute(query, (hospitalization_id, current_user_id, current_user_id))

            if cursor.rowcount == 0:
                return jsonify({"error": "Hospitalization not found or no permission"}), 404

            conn.commit()
        return jsonify({"message": "Hospitalization deleted successfully"}), 200
    finally:
        conn.close()
