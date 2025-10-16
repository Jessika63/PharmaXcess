
from flask import Blueprint, request, jsonify
import random
import string
import sys
import os
import json
import base64
from io import BytesIO
from db_app import get_app_connection

# Add scripts path to import QR code generation
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from scripts.qrcode.qrCodeGen import generate_rounded_qr_code
from routes.profile.profile_access import get_current_user_id, profile_access_condition


# Blueprint for QR code generation
generate_qr_bp = Blueprint('generate_qr', __name__)

# ----------------------------
# Utility functions
# ----------------------------
def generate_random_code(length=10):
    """
    Generate a random alphanumeric string of a given length.
    Useful for unique identifiers, codes, or tokens.

    Args:
        length (int): The length of the generated string. Default = 10.

    Returns:
        str: Random alphanumeric string (A-Z, 0-9).
    """
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))


def get_unique_code(cursor, table_name, column_name="code_unique", length=10):
    """
    Generate a truly unique code for a given table by checking the database.

    Args:
        cursor: Database cursor
        table_name (str): Table name where uniqueness is enforced
        column_name (str): Column where uniqueness is checked
        length (int): Length of the generated code

    Returns:
        str: Unique alphanumeric code
    """
    while True:
        code = generate_random_code(length)
        cursor.execute(f"SELECT 1 FROM {table_name} WHERE {column_name} = %s", (code,))
        if cursor.fetchone() is None:
            return code


def qr_response(qr_data, base_filename="qr"):
    """
    Generate QR code image and return metadata + base64-encoded image.

    Args:
        qr_data (dict): Dictionary containing 'id' and 'code_unique'
        base_filename (str): Prefix for the QR code file

    Returns:
        dict: {
            "id": int,
            "code_unique": str,
            "image": str (base64 PNG)
        }
    """
    buffer = generate_rounded_qr_code(qr_data, base_filename=base_filename, return_buffer=True)
    buffer.seek(0)
    img_bytes = buffer.read()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    return {"id": qr_data['id'], "code_unique": qr_data['code_unique'], "image": img_base64}


# ----------------------------
# Generate Prescription QR
# ----------------------------
@generate_qr_bp.route('/generate_prescription_qr', methods=['POST'])
def generate_prescription_qr():
    """
    Generate a QR code for a prescription.

    Request Body (JSON):
        - utilisateur_id (int, required): User ID
        - ordonnance_id (int, required): Prescription ID

    Process:
        - Validate required fields
        - Insert record in `qrcodes_ordonnances`
        - Generate unique code + QR image

    Returns:
        - 200: JSON {id, code_unique, image}
        - 400: Missing required fields
        - 500: Internal error
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json() or {}
    utilisateur_id = data.get('utilisateur_id')
    ordonnance_id = data.get('ordonnance_id')

    if not utilisateur_id or not ordonnance_id:
        return jsonify({"error": "utilisateur_id and ordonnance_id are required"}), 400

    # Check access to the user/profile
    condition = profile_access_condition()
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE id=%s AND {condition}
            """, (utilisateur_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({"error": "No permission for this user"}), 403

            code_unique = get_unique_code(cursor, "qrcodes_ordonnances")
            cursor.execute(
                "INSERT INTO qrcodes_ordonnances (utilisateur_id, ordonnance_id, code_unique) VALUES (%s,%s,%s)",
                (utilisateur_id, ordonnance_id, code_unique)
            )
            qr_id = cursor.lastrowid
            conn.commit()

        qr_data = {"id": qr_id, "code_unique": code_unique}
        return jsonify(qr_response(qr_data, base_filename="prescription"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


# ----------------------------
# Generate Direction QR
# ----------------------------
@generate_qr_bp.route('/generate_direction_qr', methods=['POST'])
def generate_direction_qr():
    """
    Generate a QR code for navigation/direction.

    Request Body (JSON):
        - data (str|dict, optional): Custom payload to embed in the QR

    Process:
        - Serialize payload if dict
        - Insert record in `qrcodes_maps`
        - Generate unique code + QR image

    Returns:
        - 200: JSON {id, code_unique, image}
        - 500: Internal error
    """
    data = request.get_json() or {}
    qr_data = {"id": None, "code_unique": None}
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            code_unique = get_unique_code(cursor, "qrcodes_maps")

            payload = data.get('data', '')
            if isinstance(payload, dict):
                payload = json.dumps(payload)

            cursor.execute(
                "INSERT INTO qrcodes_maps (code_unique, data) VALUES (%s, %s)",
                (code_unique, payload)
            )
            qr_id = cursor.lastrowid
            conn.commit()

        qr_data['id'] = qr_id
        qr_data['code_unique'] = code_unique
        return jsonify(qr_response(qr_data, base_filename="direction"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


# ----------------------------
# Generate Profile QR
# ----------------------------
@generate_qr_bp.route('/generate_profile_qr', methods=['POST'])
def generate_profile_qr():
    """
    Generate a QR code for a user profile.

    Request Body (JSON):
        - utilisateur_id (int, required): User ID

    Process:
        - Validate utilisateur_id
        - Insert record in `qrcodes_profiles`
        - Generate unique code + QR image

    Returns:
        - 200: JSON {id, code_unique, image}
        - 400: Missing utilisateur_id
        - 500: Internal error
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json() or {}
    utilisateur_id = data.get('utilisateur_id')
    if not utilisateur_id:
        return jsonify({"error": "utilisateur_id is required"}), 400

    # Check access to the user/profile
    condition = profile_access_condition()
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE id=%s AND {condition}
            """, (utilisateur_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({"error": "No permission for this user"}), 403

            code_unique = get_unique_code(cursor, "qrcodes_profiles")
            cursor.execute(
                "INSERT INTO qrcodes_profiles (utilisateur_id, code_unique) VALUES (%s, %s)",
                (utilisateur_id, code_unique)
            )
            qr_id = cursor.lastrowid
            conn.commit()

        qr_data = {"id": qr_id, "code_unique": code_unique}
        return jsonify(qr_response(qr_data, base_filename="profile"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
