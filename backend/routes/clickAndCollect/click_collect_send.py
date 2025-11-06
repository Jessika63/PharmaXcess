from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from datetime import datetime
import pymysql

clickcollect_send_bp = Blueprint('clickcollect_send', __name__)

@clickcollect_send_bp.route("/clickcollect/send", methods=["POST"])
def send_order():
    data = request.get_json()
    user_id = data.get("user_id")
    ordonnance_id = data.get("ordonnance_id")

    if not user_id or not ordonnance_id:
        return jsonify({"error": "Missing 'user_id' or 'ordonnance_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT id FROM commandes
                WHERE utilisateur_id = %s AND ordonnance_id = %s
                """,
                (user_id, ordonnance_id)
            )
            existing = cursor.fetchone()

            if existing:
                return jsonify({
                    "error": "A pending request already exists for this prescription and user"
                }), 409

            cursor.execute(
                """
                INSERT INTO commandes (utilisateur_id, ordonnance_id, statut, date_demande)
                VALUES (%s, %s, 'en_attente', %s)
                """,
                (user_id, ordonnance_id, datetime.now())
            )
            conn.commit()

        return jsonify({"message": "Order sent successfully"}), 201

    except Exception as e:
        print(f"[ERROR] send_order: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()
