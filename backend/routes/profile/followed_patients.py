from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from .profile_access import get_current_user_id

followed_bp = Blueprint("followed_patients", __name__)

@followed_bp.route("/followed_patients", methods=["GET"])
def get_followed_patients():
    """
    Récupère la liste des patients suivis par le professionnel connecté.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT u.* FROM patients_suivis ps
                JOIN utilisateurs u ON ps.patient_id = u.id
                WHERE ps.professionnel_id = %s
            """, (current_user_id,))
            patients = cursor.fetchall()
        return jsonify(patients), 200
    finally:
        conn.close()

@followed_bp.route("/followed_patients", methods=["POST"])
def add_followed_patient():
    """
    Ajoute un patient à la liste suivie du professionnel connecté.
    Body: { patient_id: int }
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status
    data = request.get_json()
    patient_id = data.get("patient_id")
    if not patient_id:
        return jsonify({"error": "patient_id requis"}), 400
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT IGNORE INTO patients_suivis (professionnel_id, patient_id) VALUES (%s, %s)",
                (current_user_id, patient_id)
            )
            conn.commit()
        return jsonify({"message": "Patient ajouté à la liste suivie"}), 201
    finally:
        conn.close()
