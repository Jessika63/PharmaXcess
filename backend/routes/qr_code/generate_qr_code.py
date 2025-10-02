
from flask import Blueprint, request, send_file, jsonify
import random
import string
import sys
import os
from db_app import get_app_connection

# Ajouter le chemin des scripts pour pouvoir les importer
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from scripts.qrcode.qrCodeGen import generate_rounded_qr_code

# Blueprint pour générer un QR code
generate_qr_bp = Blueprint('generate_qr', __name__)

# Fonction utilitaire pour générer un code unique de 10 caractères
def generate_random_code(length=10):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

# Fonction pour obtenir un code vraiment unique dans une table donnée
def get_unique_code(cursor, table_name, column_name="code_unique", length=10):
    while True:
        code = generate_random_code(length)
        cursor.execute(f"SELECT 1 FROM {table_name} WHERE {column_name} = %s", (code,))
        if cursor.fetchone() is None:
            return code

@generate_qr_bp.route('/generate_prescription_qr', methods=['POST'])
def generate_prescription_qr():
    """
    Objective: Generates a QR code for a prescription by creating a unique entry in the database.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - utilisateur_id: ID of the user (Integer, Required)
        - ordonnance_id: ID of the prescription (Integer, Required)

    Process:
        - Validates the required fields in the request body
        - Creates a new entry in the `qrcodes_ordonnances` database table with a unique code
        - Generates a QR code containing the generated record ID

    Return Value:
        - 200: PNG image file of the generated QR code
        - 400: JSON error response if required fields are missing
        - 500: JSON error response in case of database or generation error
    """

    data = request.get_json()
    if not data.get('utilisateur_id') or not data.get('ordonnance_id'):
        return jsonify({"error": "utilisateur_id et ordonnance_id requis"}), 400

    qr_data = {"id": None}
    conn = None

    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            code_unique = get_unique_code(cursor, "qrcodes_ordonnances")
            cursor.execute(
                "INSERT INTO qrcodes_ordonnances (utilisateur_id, ordonnance_id, code_unique) VALUES (%s,%s,%s)",
                (data['utilisateur_id'], data['ordonnance_id'], code_unique)
            )
            qr_id = cursor.lastrowid
            conn.commit()

        qr_data['id'] = qr_id
        buffer = generate_rounded_qr_code(qr_data, base_filename="prescription", return_buffer=True)
        return send_file(buffer, mimetype='image/png', as_attachment=True, download_name='prescription_qr.png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@generate_qr_bp.route('/generate_direction_qr', methods=['POST'])
def generate_direction_qr():
    """
    Objective: Generates a QR code for navigation/direction data by creating a unique entry in the database.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - data: Custom data payload to be stored and encoded into the QR code (String or Object, Optional)

    Process:
        - Creates a new entry in the `qrcodes_maps` database table with a unique code and associated data
        - Generates a QR code containing the generated record ID

    Return Value:
        - 200: PNG image file of the generated QR code
        - 500: JSON error response in case of database or generation error
    """
    data = request.get_json()
    qr_data = {"id": None}
    conn = None

    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            code_unique = get_unique_code(cursor, "qrcodes_maps")
            cursor.execute(
                "INSERT INTO qrcodes_maps (code_unique, data) VALUES (%s, %s)",
                (code_unique, data.get('data', ''))
            )
            qr_id = cursor.lastrowid
            conn.commit()

        qr_data['id'] = qr_id
        buffer = generate_rounded_qr_code(qr_data, base_filename="direction", return_buffer=True)
        return send_file(buffer, mimetype='image/png', as_attachment=True, download_name='direction_qr.png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@generate_qr_bp.route('/generate_profile_qr', methods=['POST'])
def generate_profile_qr():
    """
    Objective: Generates a QR code for a user profile by creating a unique entry in the database.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - utilisateur_id: ID of the user for whom the QR code is generated (Integer, Required)

    Process:
        - Validates that `utilisateur_id` is provided
        - Creates a new entry in the `qrcodes_profiles` table with a unique code
        - Generates a QR code containing the generated record ID

    Return Value:
        - 200: PNG image file of the generated QR code
        - 400: JSON error response if `utilisateur_id` is missing
        - 500: JSON error response in case of database or generation error
    """

    data = request.get_json()
    utilisateur_id = data.get('utilisateur_id')

    if not utilisateur_id:
        return jsonify({"error": "utilisateur_id requis"}), 400

    qr_data = {"id": None}
    conn = None

    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            code_unique = get_unique_code(cursor, "qrcodes_profiles")
            cursor.execute(
                "INSERT INTO qrcodes_profiles (utilisateur_id, code_unique) VALUES (%s, %s)",
                (utilisateur_id, code_unique)
            )
            qr_id = cursor.lastrowid
            conn.commit()

        qr_data['id'] = qr_id
        buffer = generate_rounded_qr_code(qr_data, base_filename="profile", return_buffer=True)
        return send_file(buffer, mimetype='image/png', as_attachment=True, download_name='profile_qr.png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
