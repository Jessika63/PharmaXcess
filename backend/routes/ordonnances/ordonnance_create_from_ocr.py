from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql
import json
from datetime import datetime

from routes.profile.profile_access import (
    get_current_user_id,
    profile_target_access_condition
)

ordonnance_ocr_create_bp = Blueprint(
    "ordonnance_ocr_create",
    __name__
)

@ordonnance_ocr_create_bp.route("/ordonnances/create_from_ocr", methods=["POST"])
def create_ordonnance_from_ocr():
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    user_id = data.get("user_id")
    infos_ocr = data.get("infos_ocr")

    if not user_id or not infos_ocr:
        return jsonify({"error": "Missing user_id or infos_ocr"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            condition = profile_target_access_condition("id")
            cursor.execute(
                f"SELECT id FROM utilisateurs WHERE {condition}",
                (user_id, current_user_id, current_user_id)
            )
            if not cursor.fetchone():
                return jsonify({"error": "User not accessible"}), 403
    finally:
        conn.close()

    medecin = infos_ocr.get("medecin", {})
    medicaments = infos_ocr.get("medicaments", [])

    if not medicaments:
        return jsonify({"error": "No medications provided"}), 422

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO ordonnances (
                    utilisateur_id,
                    description,
                    medecin_nom,
                    date_prescription,
                    medicaments,
                    statut,
                    date_ajout
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                "Ordonnance créée via OCR",
                medecin.get("nom"),
                infos_ocr.get("date_prescription"),
                json.dumps(medicaments),
                "non_verifiee",
                datetime.now()
            ))
            ordonnance_id = cursor.lastrowid
            conn.commit()
    finally:
        conn.close()

    return jsonify({
        "message": "Ordonnance OCR créée",
        "ordonnance_id": ordonnance_id,
        "statut": "non_verifiee"
    }), 201
