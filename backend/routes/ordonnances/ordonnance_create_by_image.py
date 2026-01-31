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
    import re
    from datetime import datetime
    from typing import Optional

    print("DEBUG: raw_date =", raw_date, flush=True)

    if not raw_date or not isinstance(raw_date, str):
        print("DEBUG: raw_date invalide", flush=True)
        return None

    raw_date = raw_date.strip().lower()
    print("DEBUG: normalized raw_date =", raw_date, flush=True)

    month_map = {
        "jan": 1, "janv": 1, "janvier": 1,
        "fév": 2, "fev": 2, "février": 2,
        "mar": 3, "mars": 3,
        "avr": 4, "avril": 4,
        "mai": 5,
        "jun": 6, "juin": 6,
        "jul": 7, "juil": 7, "juillet": 7,
        "aoû": 8, "aou": 8, "août": 8,
        "sep": 9, "sept": 9, "septembre": 9,
        "oct": 10, "octobre": 10,
        "nov": 11, "novembre": 11,
        "déc": 12, "dec": 12, "décembre": 12
    }

    normalized = re.sub(r"[\/\._\|\s]+", "-", raw_date)
    print("DEBUG: normalized =", normalized, flush=True)

    patterns = [
        # Numeric
        (r"(\d{4})-(\d{1,2})-(\d{1,2})", lambda m: (int(m.group(1)), int(m.group(2)), int(m.group(3)))),  # YYYY-MM-DD
        (r"(\d{1,2})-(\d{1,2})-(\d{4})", lambda m: (int(m.group(3)), int(m.group(2)), int(m.group(1)))),  # DD-MM-YYYY
        # Month names
        (r"(\d{4})-([a-zéû]+)-(\d{1,2})", lambda m: (int(m.group(1)), month_map.get(m.group(2)), int(m.group(3)))),  # YYYY-MONTH-DD
        (r"(\d{1,2})-([a-zéû]+)-(\d{4})", lambda m: (int(m.group(3)), month_map.get(m.group(2)), int(m.group(1)))),  # DD-MONTH-YYYY
    ]

    for pattern, extractor in patterns:
        m = re.match(pattern, normalized)
        if m:
            y, mo, d = extractor(m)
            print(f"DEBUG: matched pattern '{pattern}' -> y={y}, mo={mo}, d={d}", flush=True)
            if not mo:
                print("DEBUG: mois invalide, skipping", flush=True)
                continue
            try:
                dt = datetime(y, mo, d)
                formatted = dt.strftime("%Y-%m-%d")
                print("DEBUG: formatted date =", formatted, flush=True)
                return formatted
            except ValueError as e:
                print("DEBUG: ValueError:", e, flush=True)
                continue

    print("DEBUG: fallback, returning None", flush=True)
    return None


sys.path.append(os.path.join(os.path.dirname(__file__), '../../scripts/scanner'))
from extractAll import main as ocr_main

from routes.profile.profile_access import get_current_user_id, profile_target_access_condition

ordonnance_create_by_image_bp = Blueprint("ordonnance_create_by_image", __name__)

@ordonnance_create_by_image_bp.route("/ordonnances/create_by_image", methods=["POST"])
def create_ordonnance_by_image():
    """
    Crée une ordonnance à partir d'une image envoyée.
    Processus :
      1. Vérifie l'accès à l'utilisateur cible
      2. Récupère l'image temporaire ou le fichier uploadé
      3. Appelle l'OCR (doc_type='P', flip_horizontal=False)
      4. Insère l'ordonnance avec statut 'pending'
    Request JSON ou form-data :
      - user_id (int, obligatoire)
      - temp_image_id (int, optionnel) ou file (image multipart, optionnel)
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    if request.files:
        data = request.form.to_dict() or {}
        file = request.files.get("file")
    else:
        data = request.get_json() or {}
        file = None

    user_id = data.get("user_id")
    temp_image_id = data.get("temp_image_id")
    filename = data.get("filename")
    image_base64 = data.get("image_base64")

    if not user_id:
        return jsonify({"error": "Missing 'user_id'"}), 400

    conn_check = get_app_connection()
    try:
        with conn_check.cursor() as cursor:
            condition = profile_target_access_condition("id")
            cursor.execute(f"SELECT id FROM utilisateurs WHERE {condition}", (user_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Target user not found or not accessible"}), 403
    finally:
        conn_check.close()

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

    try:
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Decoded image is None"}), 400

        tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        cv2.imwrite(tmp_file.name, img)
    except Exception as e:
        return jsonify({"error": f"Error preparing image for OCR: {str(e)}"}), 500

    try:
        ocr_result = ocr_main(tmp_file.name, "P", from_base64=False, flip_horizontal=False)
        if not ocr_result.get("success"):
            return jsonify({"error": "OCR failed", "detail": ocr_result}), 400
    except Exception as e:
        return jsonify({"error": f"OCR execution failed: {str(e)}"}), 500

    infos_ocr = ocr_result.get("infos", {})
    medicaments = infos_ocr.get("medicaments", [])
    medecin = infos_ocr.get("medecin", {})
    patient = infos_ocr.get("patient", {})
    description = "Ordonnance créée via OCR"

    raw_date_prescription = infos_ocr.get("date_prescription")
    date_prescription = parse_ocr_date(raw_date_prescription)

    try:
        medicaments_json = json.dumps(medicaments)
    except Exception:
        medicaments_json = None

    if not medicaments:
        return jsonify({"error": "OCR did not extract any medications"}), 422

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
    finally:
        conn.close()
    
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

    return jsonify({
        "message": "Ordonnance créée via OCR",
        "ordonnance_id": ordonnance_id,
        "date_prescription": date_prescription,
        "medicaments": medicaments,
        "medecin": medecin_data,
        "patient": patient_data
    }), 201
