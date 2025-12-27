from flask import Blueprint, request, jsonify
import random
import string
import sys
import os
import json
import base64
from io import BytesIO
from db_app import get_app_connection

from scripts.qrcode.qrCodeGen import generate_rounded_qr_code
from routes.profile.profile_access import profile_target_access_condition


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



def generate_prescription_qr_internal(utilisateur_id, ordonnance_id):
    """
    Generate a prescription QR code WITHOUT HTTP request.
    Returns:
        - dict: success → {"id", "code_unique", "image"}
        - dict: error → {"error": "..."}
    """

    if not utilisateur_id or not ordonnance_id:
        return {"error": "utilisateur_id and ordonnance_id are required"}

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:

            # Permission check
            condition = profile_target_access_condition('id')
            cursor.execute(
                f"SELECT id FROM utilisateurs WHERE {condition}",
                (utilisateur_id, utilisateur_id, utilisateur_id)
            )
            if not cursor.fetchone():
                return {"error": "No permission for this user"}

            # Unique code
            code_unique = get_unique_code(cursor, "qrcodes_ordonnances")

            # Insert
            cursor.execute("""
                INSERT INTO qrcodes_ordonnances (utilisateur_id, ordonnance_id, code_unique)
                VALUES (%s, %s, %s)
            """, (utilisateur_id, ordonnance_id, code_unique))

            qr_id = cursor.lastrowid
            conn.commit()

            qr_data = {"id": qr_id, "code_unique": code_unique}

            # Generate QR image/response
            return qr_response(qr_data, base_filename="prescription")

    except Exception as e:
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()
