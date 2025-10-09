
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

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

    data = request.get_json()
    user_id = data.get("utilisateur_id")
    name = data.get("nom")

    if not user_id or not name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO medecins (utilisateur_id, nom, specialite, hopital, telephone, email, adresse)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                name,
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
@doctors_bp.route("/doctors/<int:user_id>", methods=["GET"])
def get_all_doctors(user_id):
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM medecins WHERE utilisateur_id=%s", (user_id,))
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM medecins WHERE id=%s", (doctor_id,))
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

    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE medecins
                SET nom=%s, specialite=%s, hopital=%s, telephone=%s, email=%s, adresse=%s
                WHERE id=%s
            """, (
                data.get("nom"),
                data.get("specialite"),
                data.get("hopital"),
                data.get("telephone"),
                data.get("email"),
                data.get("adresse"),
                doctor_id
            ))
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

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM medecins WHERE id=%s", (doctor_id,))
            conn.commit()
        return jsonify({"message": "Doctor deleted successfully"}), 200
    finally:
        conn.close()
