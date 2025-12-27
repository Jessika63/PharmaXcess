
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
from routes.profile.profile_access import get_current_user_id, profile_access_condition, profile_target_access_condition


from routes.qr_code.gen_qrcode_fct import (
    get_unique_code,
    qr_response,
    generate_prescription_qr_internal,
)

# Blueprint for QR code generation
generate_qr_bp = Blueprint('generate_qr', __name__)


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
    data = request.get_json() or {}
    utilisateur_id = data.get('utilisateur_id')
    ordonnance_id = data.get('ordonnance_id')

    if request.headers.get("X-Internal-Call") != "1":
        current_user_id, error_response, status = get_current_user_id()
        if error_response:
            return error_response, status

        condition = profile_target_access_condition("id")
        conn = get_app_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    f"SELECT id FROM utilisateurs WHERE {condition}",
                    (utilisateur_id, current_user_id, current_user_id)
                )
                if not cursor.fetchone():
                    return jsonify({"error": "No permission for this user"}), 403
        finally:
            conn.close()

    result = generate_prescription_qr_internal(utilisateur_id, ordonnance_id)

    return jsonify(result), (200 if "error" not in result else 400)

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

    # Check access to the user/profile (target check)
    condition = profile_target_access_condition('id')
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute(f"""
                SELECT id FROM utilisateurs
                WHERE {condition}
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
