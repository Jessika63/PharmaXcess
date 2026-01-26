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
            # Pour chaque patient, aller chercher ses données médicales
            for patient in patients:
                patient_id = patient['id']

                # Maladies
                cursor.execute("SELECT * FROM maladies WHERE utilisateur_id = %s", (patient_id,))
                patient['maladies'] = cursor.fetchall()

                # Traitements (tous traitements liés à une maladie de ce patient)
                cursor.execute("SELECT t.* FROM traitements t JOIN maladies m ON t.maladie_id = m.id WHERE m.utilisateur_id = %s", (patient_id,))
                patient['traitements'] = cursor.fetchall()

                # Hospitalisations
                cursor.execute("SELECT * FROM hospitalisations WHERE utilisateur_id = %s", (patient_id,))
                patient['hospitalisations'] = cursor.fetchall()

                # Allergies
                cursor.execute("SELECT * FROM allergies WHERE utilisateur_id = %s", (patient_id,))
                patient['allergies'] = cursor.fetchall()

                # Antécédents familiaux
                cursor.execute("SELECT * FROM antecedents WHERE utilisateur_id = %s", (patient_id,))
                patient['antecedents'] = cursor.fetchall()

                # Médecins
                cursor.execute("SELECT * FROM medecins WHERE utilisateur_id = %s", (patient_id,))
                patient['medecins'] = cursor.fetchall()

                # Documents
                cursor.execute("SELECT id, title, filename, size, date_ajout, status FROM documents WHERE utilisateur_id = %s ORDER BY date_ajout DESC", (patient_id,))
                patient['documents'] = cursor.fetchall()

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
