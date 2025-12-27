from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from datetime import datetime
import pymysql

clickcollect_refuse_bp = Blueprint('clickcollect_refuse', __name__)

@clickcollect_refuse_bp.route("/clickcollect/refuse", methods=["POST"])
def refuse_order():
    data = request.get_json()
    order_id = data.get("order_id")
    reason = data.get("reason", "Refused")

    if not order_id:
        return jsonify({"error": "Missing order_id"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT utilisateur_id FROM commandes WHERE id=%s", (order_id,))
            order = cursor.fetchone()
            if not order:
                return jsonify({"error": "Order not found"}), 404

            user_id = order["utilisateur_id"]

            cursor.execute("""
                UPDATE commandes
                SET statut='refuse', raison_refus=%s, date_validation=%s
                WHERE id=%s
            """, (reason, datetime.now(), order_id))

            cursor.execute("DELETE FROM ordonnance_images_temp WHERE utilisateur_id=%s", (user_id,))

        conn.commit()
        return jsonify({"message": "Order refused successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
