from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql
from datetime import datetime
import base64
import sys, json, cv2, re
import os
import numpy as np
import tempfile
from dateutil.parser import parse

sys.path.append(os.path.join(os.path.dirname(__file__), '../../scripts/scanner'))
from extractAll import main

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from routes.profile.profile_access import get_current_user_id, profile_access_condition, profile_target_access_condition

ordonnances_bp = Blueprint('ordonnances', __name__)

# -------------------------------
# 🟢 CREATE Ordonnance
# -------------------------------
@ordonnances_bp.route("/ordonnances/create", methods=["POST"])
def create_ordonnance():
    """
    Crée une ordonnance à partir d'une image temporaire (ordonnance_images_temp)
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    user_id = data.get("user_id")
    description = data.get("description")
    medecin_nom = data.get("medecin_nom")
    date_prescription = data.get("date_prescription")
    date_expiration = data.get("date_expiration")
    medicaments = data.get("medicaments")
    temp_image_id = data.get("temp_image_id")

    if not user_id:
        return jsonify({"error": "Missing 'user_id'"}), 400

    # Ensure the target user_id is accessible by the current session user
    conn_check = get_app_connection()
    try:
        with conn_check.cursor() as cursor:
            condition = profile_target_access_condition('id')
            cursor.execute(f"SELECT id FROM utilisateurs WHERE {condition}", (user_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Target user not found or not accessible"}), 403
    finally:
        conn_check.close()

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:

            fichier = None

            if temp_image_id:
                cursor.execute(
                    "SELECT * FROM ordonnance_images_temp WHERE id = %s AND utilisateur_id = %s",
                    (temp_image_id, user_id)
                )
                temp_img = cursor.fetchone()
                if not temp_img:
                    return jsonify({"error": "Temporary image not found or unauthorized"}), 404
                fichier = temp_img["filename"]

            cursor.execute("""
                INSERT INTO ordonnances (
                    utilisateur_id, description, fichier, medecin_nom, 
                    date_prescription, date_expiration, medicaments, date_ajout
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                description,
                fichier,
                medecin_nom,
                date_prescription,
                date_expiration,
                medicaments,
                datetime.now()
            ))
            ordonnance_id = cursor.lastrowid

            if temp_image_id:
                cursor.execute("""
                    UPDATE ordonnance_images_temp
                    SET ordonnance_id = %s
                    WHERE id = %s
                """, (ordonnance_id, temp_image_id))

            conn.commit()

        return jsonify({
            "message": "Ordonnance créée avec succès",
            "ordonnance_id": ordonnance_id
        }), 201

    except Exception as e:
        print(f"[ERROR] create_ordonnance: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


# -------------------------------
# 🟡 GET Ordonnances d'un utilisateur
# -------------------------------
@ordonnances_bp.route("/ordonnances", methods=["GET"])
def get_ordonnances():
    # Use current session and profile access rules instead of arbitrary user_id query param
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    include_images = request.args.get("include_images", "0")

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            # Fetch metadata only by default to keep payload small and fast for clients.
            # If client explicitly requests images (include_images=1) we will include base64 blobs.
            condition = profile_access_condition('o.utilisateur_id')
            if include_images == '1':
                cursor.execute(f"""
                    SELECT o.*, t.id AS temp_image_id, t.mime_type, t.image_data
                    FROM ordonnances o
                    LEFT JOIN ordonnance_images_temp t 
                        ON o.id = t.ordonnance_id
                    WHERE {condition}
                    ORDER BY o.date_ajout DESC
                """, (current_user_id, current_user_id))
                ordonnances = cursor.fetchall()
                for o in ordonnances:
                    if o.get("image_data"):
                        o["image_base64"] = base64.b64encode(o["image_data"]).decode("utf-8")
                    else:
                        o["image_base64"] = None
                    o.pop("image_data", None)
            else:
                cursor.execute(f"""
                    SELECT o.*, t.id AS temp_image_id, t.mime_type, t.filename, t.date_upload
                    FROM ordonnances o
                    LEFT JOIN ordonnance_images_temp t 
                        ON o.id = t.ordonnance_id
                    WHERE {condition}
                    ORDER BY o.date_ajout DESC
                """, (current_user_id, current_user_id))
                ordonnances = cursor.fetchall()

        return jsonify({"ordonnances": ordonnances}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()



# -------------------------------
# 🔴 DELETE Ordonnance
# -------------------------------
@ordonnances_bp.route("/ordonnances/delete", methods=["DELETE"])
def delete_ordonnance():
    data = request.get_json()
    ordonnance_id = data.get("ordonnance_id")
    # delete must be performed by a session user with access to the ordonnance owner
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    user_id = data.get("user_id")

    if not ordonnance_id or not user_id:
        return jsonify({"error": "Missing 'ordonnance_id' or 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            # ensure provided user_id is accessible by session user
            condition = profile_access_condition('o.utilisateur_id')
            cursor.execute(f"SELECT id FROM ordonnances o WHERE o.id=%s AND {condition}",
                           (ordonnance_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Ordonnance not found or unauthorized"}), 404

            cursor.execute(
                "DELETE FROM ordonnance_images_temp WHERE ordonnance_id=%s",
                (ordonnance_id,)
            )

            cursor.execute(
                "DELETE FROM ordonnances WHERE id=%s",
                (ordonnance_id,)
            )
            conn.commit()

        return jsonify({"message": "Ordonnance supprimée avec succès"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()



# -------------------------------
# 🔴 CREATE Ordonnance by image
# -------------------------------
@ordonnances_bp.route("/ordonnances/create_by_image", methods=["POST"])
def create_ordonnance_by_image():
    try:
        data = request.get_json() or {}

        user_id = data.get("user_id")
        image_base64 = data.get("image_base64")

        if not user_id or not image_base64:
            return jsonify({"error": "Missing user_id or image_base64"}), 400

        DOC_TYPE = "P"

        # ---- Decode base64 image ----
        try:
            _, encoded = image_base64.split(",", 1)
        except ValueError:
            encoded = image_base64

        image_bytes = base64.b64decode(encoded)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        # ---- Save temp image ----
        tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        cv2.imwrite(tmp_file.name, img)

        # ---- OCR ----
        ocr_result = main(tmp_file.name, DOC_TYPE, from_base64=False)
        if not ocr_result.get("success"):
            return jsonify({"error": "OCR failed", "details": ocr_result}), 400

        infos = ocr_result.get("infos", {})
        raw_text = ocr_result.get("raw_text", "")

        # ---- Date tolérante ----
        raw_date = infos.get("date_prescription")
        date_prescription = None
        if raw_date:
            try:
                mois_fr = {
                    'janv': 'Jan', 'janvier': 'Jan',
                    'févr': 'Feb', 'fev': 'Feb', 'février': 'Feb',
                    'mars': 'Mar',
                    'avr': 'Apr', 'avril': 'Apr',
                    'mai': 'May',
                    'juin': 'Jun',
                    'juil': 'Jul', 'juill': 'Jul',
                    'août': 'Aug', 'aout': 'Aug',
                    'sept': 'Sep', 'septembre': 'Sep',
                    'oct': 'Oct', 'octobre': 'Oct',
                    'nov': 'Nov', 'novembre': 'Nov',
                    'déc': 'Dec', 'dec': 'Dec', 'décembre': 'Dec'
                }
                date_str = raw_date.lower()
                for fr, en in mois_fr.items():
                    date_str = re.sub(fr, en, date_str)
                date_str = date_str.replace('é', 'e').replace('è', 'e').replace('û', 'u')
                dt = parse(date_str, dayfirst=True, fuzzy=True)
                date_prescription = dt.strftime("%Y-%m-%d")
            except Exception as e:
                print(f"[WARNING] Failed to parse date '{raw_date}': {e}")
                date_prescription = None

        # ---- Médecin ----
        med = infos.get("medecin", {}) or {}
        medecin_nom = " ".join(filter(None, [med.get("prenom"), med.get("nom")])) or None

        # ---- Extraction médicaments ----
        medicaments_final = []
        structured_meds = infos.get("medicaments", [])

        # on se fie d'abord aux données structurées
        for med in structured_meds:
            nom = (med.get("nom") or "").strip()
            poso = (med.get("posologie") or "").strip()
            if nom:  # on ne prend que les vrais noms
                medicaments_final.append({"nom": nom, "posologie": poso or None})

        # fallback: uniquement si aucune donnée structurée
        if not medicaments_final and raw_text:
            lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
            current_med = None
            for line in lines:
                is_candidate = (
                    line.isupper() and len(line) > 6
                    and not any(x in line.lower() for x in [
                        "urgence", "honoraires", "contact", "tel", "mail",
                        "règlement", "carte", "chèque", "doctolib", "médecin", "dr"
                    ])
                )
                if is_candidate:
                    if current_med:
                        medicaments_final.append(current_med)
                    current_med = {"nom": line, "posologie": None}
                elif current_med and len(line) < 120:
                    if any(k in line.lower() for k in ["fois", "jour", "mg", "ml", "comprim", "goutte"]):
                        current_med["posologie"] = line
            if current_med:
                medicaments_final.append(current_med)

        # ---- Déduplication ----
        seen = set()
        medicaments_final_unique = []
        for m in medicaments_final:
            key = m["nom"]
            if key not in seen:
                seen.add(key)
                medicaments_final_unique.append(m)

        # ---- Insert DB ----
        conn = get_app_connection()
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
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                "Ordonnance créée automatiquement via OCR",
                None,
                medecin_nom,
                date_prescription,
                json.dumps(medicaments_final_unique, ensure_ascii=False),
                datetime.now()
            ))
            ordonnance_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "ordonnance_id": ordonnance_id,
            "medecin": medecin_nom,
            "date_prescription": date_prescription,
            "medicaments": medicaments_final_unique,
            "raw_text": raw_text
        }), 201

    except Exception as e:
        print("[ERROR] create_by_image:", e)
        return jsonify({"error": str(e)}), 500
