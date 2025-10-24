
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from .profile_access import (
    get_current_user_id,
    profile_access_condition,
    profile_target_access_condition,
    is_target_accessible,
)

doctors_bp = Blueprint("doctors", __name__)

# CREATE
@doctors_bp.route("/doctors", methods=["POST"])
def create_doctor():
    """
    Objective:
    Create a new doctor record in the database associated with a user.

    Endpoint: POST /doctors

    Request Body (JSON):
    - utilisateur_id (int, required): ID of the user to whom the doctor belongs.
    - nom (str, required): Name of the doctor.
    - specialite (str, optional): Doctor's specialty.
    - hopital (str, optional): Hospital where the doctor works.
    - telephone (str, optional): Doctor's phone number.
    - email (str, optional): Doctor's email address.
    - adresse (str, optional): Doctor's physical address.

    Response:
    - 201 Created: Returns a message confirming creation and the new doctor's ID.
    - 400 Bad Request: If required fields are missing.
    - 500 Internal Server Error: If a database error occurs during insertion.
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    utilisateur_id = data.get("utilisateur_id")
    nom = data.get("nom")

    if not utilisateur_id or not nom:
        return jsonify({"error": "Missing required fields"}), 400

    # Verify access to the target utilisateur (create doctor for this user)
    condition = profile_target_access_condition('id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Verify the target utilisateur is accessible by current user
            if not is_target_accessible(cursor, utilisateur_id, 'id'):
                return jsonify({"error": "You don't have permission to add a doctor for this user"}), 403

            cursor.execute("""
                INSERT INTO medecins (utilisateur_id, nom, specialite, hopital, telephone, email, adresse)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                utilisateur_id,
                nom,
                data.get("specialite"),
                data.get("hopital"),
                data.get("telephone"),
                data.get("email"),
                data.get("adresse")
            ))
            conn.commit()
            doctor_id = cursor.lastrowid
        return jsonify({"message": "Doctor added successfully", "id": doctor_id}), 201
    finally:
        conn.close()


# GET ALL
@doctors_bp.route("/doctors", methods=["GET"])
def get_all_doctors():
    """
    Objective:
    Retrieve all doctor records associated with a specific user.

    Endpoint: GET /doctors/<user_id>

    Path Parameters:
    - user_id (int, required): ID of the user whose doctors are being retrieved.

    Response:
    - 200 OK: Returns a JSON list of all doctors for the specified user.
    - 404 Not Found: If no doctors are found (optional depending on implementation).
    - 500 Internal Server Error: If a database error occurs during retrieval.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    # For listing doctors, filter by owner column
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT m.*
                FROM medecins m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE {condition}
            """
            cursor.execute(query, (current_user_id, current_user_id))
            doctors = cursor.fetchall()
        return jsonify(doctors), 200
    finally:
        conn.close()


# GET UNIQUE
@doctors_bp.route("/doctor/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    """
    Objective:
    Retrieve a single doctor's record by its unique ID.

    Endpoint: GET /doctor/<doctor_id>

    Path Parameters:
    - doctor_id (int, required): The unique ID of the doctor to retrieve.

    Response:
    - 200 OK: Returns a JSON object containing the doctor's information.
    - 404 Not Found: If no doctor exists with the given ID.
    - 500 Internal Server Error: If a database error occurs during retrieval.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    # For retrieving a doctor record, ensure owner matches
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                SELECT m.*
                FROM medecins m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE m.id = %s AND {condition}
            """
            cursor.execute(query, (doctor_id, current_user_id, current_user_id))
            doctor = cursor.fetchone()

        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        return jsonify(doctor), 200
    finally:
        conn.close()


# UPDATE
@doctors_bp.route("/doctor/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):
    """
    Objective:
    Update an existing doctor's information in the database.

    Endpoint: PUT /doctor/<doctor_id>

    Path Parameters:
    - doctor_id (int, required): The unique ID of the doctor to update.

    Request Body (JSON):
    - nom (string, optional): Doctor's name.
    - specialite (string, optional): Doctor's specialty.
    - hopital (string, optional): Hospital or clinic name.
    - telephone (string, optional): Phone number.
    - email (string, optional): Email address.
    - adresse (string, optional): Physical address.

    Response:
    - 200 OK: If the doctor was successfully updated.
    - 400 Bad Request: If required fields are missing or invalid.
    - 500 Internal Server Error: If a database error occurs during the update.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                UPDATE medecins m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                SET m.nom=%s, m.specialite=%s, m.hopital=%s, m.telephone=%s, m.email=%s, m.adresse=%s
                WHERE m.id=%s AND {condition}
            """
            cursor.execute(query, (
                data.get("nom"),
                data.get("specialite"),
                data.get("hopital"),
                data.get("telephone"),
                data.get("email"),
                data.get("adresse"),
                doctor_id,
                current_user_id,
                current_user_id
            ))

            if cursor.rowcount == 0:
                return jsonify({"error": "Doctor not found or no permission"}), 404

            conn.commit()
        return jsonify({"message": "Doctor updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@doctors_bp.route("/doctor/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    """
    Objective:
    Delete a doctor record from the database by its unique ID.

    Endpoint: DELETE /doctor/<doctor_id>

    Path Parameters:
    - doctor_id (int, required): The unique ID of the doctor to delete.

    Response:
    - 200 OK: If the doctor was successfully deleted.
    - 404 Not Found: If no doctor exists with the given ID.
    - 500 Internal Server Error: If a database error occurs during deletion.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            query = f"""
                DELETE m FROM medecins m
                JOIN utilisateurs u ON m.utilisateur_id = u.id
                WHERE m.id = %s AND {condition}
            """
            cursor.execute(query, (doctor_id, current_user_id, current_user_id))

            if cursor.rowcount == 0:
                return jsonify({"error": "Doctor not found or no permission"}), 404

            conn.commit()
        return jsonify({"message": "Doctor deleted successfully"}), 200
    finally:
        conn.close()
