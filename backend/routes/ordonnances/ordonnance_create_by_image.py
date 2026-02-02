from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql
from datetime import datetime
import sys
import os
import tempfile
import base64
import cv2
import numpy as np
import json

import re
from typing import Optional

def parse_ocr_date(raw_date: Optional[str]) -> Optional[str]:
    """
    Parse a date extracted from OCR output and normalize it to ISO format (YYYY-MM-DD).

    This function is designed to be tolerant of noisy OCR outputs and supports:
    - Numeric date formats:
        - YYYY-MM-DD
        - DD-MM-YYYY
        - DD-MM-YY
        - DD-MM (current year is assumed)
    - Dates with month names (French):
        - 12 January 2024
        - 12 Janv 24
        - 12-janvier
        - 12-jan (current year is assumed)
    - Various separators: "/", ".", "_", "|", spaces, ":" (normalized to "-")

    Rules:
    - Two-digit years are interpreted as 2000 + YY
    - If the year is missing, the current year is used
    - If the date is invalid or cannot be parsed, the function returns None

    Args:
        raw_date (Optional[str]): Raw date string extracted from OCR

    Returns:
        Optional[str]: Normalized date string in "YYYY-MM-DD" format, or None if parsing fails
    """


    if not raw_date or not isinstance(raw_date, str):
        return None

    raw_date = raw_date.strip().lower()

    # Map French month names to numbers
    month_map = {
        "jan": 1, "janv": 1, "janvier": 1,
        "fév": 2, "fev": 2, "février": 2, "fevrier": 2,
        "mar": 3, "mars": 3,
        "avr": 4, "avril": 4,
        "mai": 5,
        "jun": 6, "juin": 6,
        "jul": 7, "juil": 7, "juillet": 7,
        "aoû": 8, "aou": 8, "août": 8, "aout": 8,
        "sep": 9, "sept": 9, "septembre": 9,
        "oct": 10, "octobre": 10,
        "nov": 11, "novembre": 11,
        "déc": 12, "dec": 12, "décembre": 12, "decembre": 12
    }

    # Normalize separators to '-'
    normalized = re.sub(r"[\/\._\|\s:]+", "-", raw_date)
    current_year = datetime.now().year

    # Patterns to match different date formats
    patterns = [
        (r"(\d{4})-(\d{1,2})-(\d{1,2})", lambda m: (int(m.group(1)), int(m.group(2)), int(m.group(3)))),
        (r"(\d{1,2})-(\d{1,2})-(\d{2,4})", lambda m: (int(m.group(3)), int(m.group(2)), int(m.group(1)))), 
        (r"(\d{4})-([a-zéû]+)-(\d{1,2})", lambda m: (int(m.group(1)), month_map.get(m.group(2)), int(m.group(3)))),
        (r"(\d{1,2})-([a-zéû]+)-(\d{2,4})", lambda m: (int(m.group(3)), month_map.get(m.group(2)), int(m.group(1)))),
        (r"(\d{1,2})-([a-zéû]+)", lambda m: (current_year, month_map.get(m.group(2)), int(m.group(1)))),
        (r"(\d{1,2})-(\d{1,2})", lambda m: (current_year, int(m.group(2)), int(m.group(1)))),
    ]

    for pattern, extractor in patterns:
        m = re.search(pattern, normalized)
        if m:
            y, mo, d = extractor(m)
            if not mo:
                continue
            if y < 100:
                y += 2000
                
            try:
                dt = datetime(y, mo, d)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

    return None

# Add OCR script path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../scripts/scanner'))
from extractAll import main as ocr_main

# Import user access helpers
from routes.profile.profile_access import get_current_user_id, profile_target_access_condition

ordonnance_create_by_image_bp = Blueprint("ordonnance_create_by_image", __name__)

@ordonnance_create_by_image_bp.route("/ordonnances/create_by_image", methods=["POST"])
def create_ordonnance_by_image():
    """
    Objective: Create a new prescription (ordonnance) for a user by extracting data from an uploaded image using OCR.

    Endpoint: POST /ordonnances/create_by_image

    Request Body (JSON or multipart/form-data):
        - user_id (int, required): ID of the user for whom the prescription is created.
        - temp_image_id (int, optional): ID of a previously uploaded temporary image.
        - file (file, optional): Image file containing the prescription.
        - image_base64 (str, optional): Base64-encoded image of the prescription.

    Response:
        - 201 Created: Prescription successfully created and extracted data returned.
        - 400 Bad Request: Missing or invalid input data.
        - 403 Forbidden: Target user not accessible.
        - 404 Not Found: Temporary image not found.
        - 422 Unprocessable Entity: No medications could be extracted from the image.
        - 500 Internal Server Error: OCR or database error.
    """

    # Get current logged-in user
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    # Parse incoming request data
    if request.files:
        data = request.form.to_dict() or {}
        file = request.files.get("file")
    else:
        data = request.get_json() or {}
        file = None

    user_id = data.get("user_id")
    temp_image_id = data.get("temp_image_id")
    image_base64 = data.get("image_base64")

    if not user_id:
        return jsonify({"error": "Missing 'user_id'"}), 400

    # Check if the user is accessible by current user
    conn_check = get_app_connection()
    try:
        with conn_check.cursor() as cursor:
            condition = profile_target_access_condition("id")
            cursor.execute(f"SELECT id FROM utilisateurs WHERE {condition}", (user_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Target user not found or not accessible"}), 403
    finally:
        conn_check.close()

    # Read image bytes from temp image, uploaded file, or base64
    img_bytes = None
    stored_filename = None
    try:
        if temp_image_id:
            conn_temp = get_app_connection()
            with conn_temp.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT * FROM ordonnance_images_temp WHERE id=%s AND utilisateur_id=%s", (temp_image_id, user_id))
                temp_img = cursor.fetchone()
                if not temp_img:
                    return jsonify({"error": "Temporary image not found or unauthorized"}), 404
                stored_filename = temp_img["filename"]
                if temp_img.get("image_data"):
                    img_bytes = temp_img["image_data"]
            conn_temp.close()
        elif file:
            img_bytes = file.read()
            stored_filename = file.filename
        elif image_base64:
            try:
                img_bytes = base64.b64decode(image_base64)
            except Exception:
                return jsonify({"error": "Invalid base64 image"}), 400
        else:
            return jsonify({"error": "No image provided"}), 400
    except Exception as e:
        return jsonify({"error": f"Error reading image: {str(e)}"}), 500

    # Convert image bytes to OpenCV image and save temporarily
    tmp_path = None
    try:
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Decoded image is None"}), 415
    
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name
            cv2.imwrite(tmp_path, img)
        img_bytes = None
        img = None
    except Exception as e:
        return jsonify({"error": f"Error preparing image for OCR: {str(e)}"}), 500

    # Run OCR on the temporary image
    try:
        ocr_result = ocr_main(tmp_path, "P", from_base64=False, flip_horizontal=False)
        if not ocr_result.get("success"):
            return jsonify({"error": "OCR completed but produced no usable data", "detail": ocr_result}), 422
    except Exception as e:
        return jsonify({"error": f"OCR execution failed: {str(e)}"}), 502
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    # Extract OCR info
    infos_ocr = ocr_result.get("infos", {})
    medicaments = infos_ocr.get("medicaments", [])
    medecin = infos_ocr.get("medecin", {})
    patient = infos_ocr.get("patient", {})
    description = "Ordonnance créée via OCR"

    # Parse prescription date
    raw_date_prescription = infos_ocr.get("date_prescription")
    date_prescription = parse_ocr_date(raw_date_prescription)

    try:
        medicaments_json = json.dumps(medicaments)
    except Exception:
        medicaments_json = None

    if not medicaments:
        return jsonify({"error": "OCR did not extract any medications"}), 422

    # Insert the ordonnance into the database
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO ordonnances (
                    utilisateur_id,
                    description,
                    fichier,
                    medecin_nom,
                    date_prescription,
                    medicaments,
                    date_ajout
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                description,
                stored_filename,
                medecin.get("nom"),
                date_prescription,
                medicaments_json,
                datetime.now()
            ))
            ordonnance_id = cursor.lastrowid

        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({
            "error": "Database error while creating ordonnance",
            "detail": str(e)
        }), 500
    finally:
        conn.close()

    # Build response for medecin and patient
    medecin_data = {
        "nom": medecin.get("nom"),
        "prenom": medecin.get("prenom"),
        "specialite": medecin.get("specialite"),
        "adresse": medecin.get("adresse"),
        "code_postal": medecin.get("code_postal"),
        "ville": medecin.get("ville"),
    }
    
    patient_data = {
        "nom": patient.get("nom"),
        "prenom": patient.get("prenom"),
        "poids": patient.get("poids"),
        "taille": patient.get("taille"),
    }

    # Return response JSON
    return jsonify({
        "message": "Ordonnance créée via OCR",
        "ordonnance_id": ordonnance_id,
        "date_prescription": date_prescription,
        "medicaments": medicaments,
        "medecin": medecin_data,
        "patient": patient_data
    }), 201
