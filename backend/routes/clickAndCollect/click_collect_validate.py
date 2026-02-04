from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from datetime import datetime
import pymysql, uuid, json

from routes.qr_code.gen_qrcode_fct import generate_prescription_qr_internal

clickcollect_validate_bp = Blueprint('clickcollect_validate', __name__)

@clickcollect_validate_bp.route("/clickcollect/validate", methods=["POST"])
def validate_order():
    data = request.get_json()
    order_id = data.get("order_id")

    if not order_id:
        return jsonify({"error": "Missing order_id"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT utilisateur_id, ordonnance_id FROM commandes WHERE id=%s", (order_id,))
            order = cursor.fetchone()
            if not order:
                return jsonify({"error": "Order not found"}), 404

            user_id = order["utilisateur_id"]
            ordonnance_id = order.get("ordonnance_id")

            # Générer le QR code avec image
            prescription_qr = generate_prescription_qr_internal(user_id, ordonnance_id)

            cursor.execute("""
                UPDATE commandes
                SET statut='valide', date_validation=%s, contenu_qr=%s
                WHERE id=%s
            """, (datetime.now(), json.dumps(prescription_qr), order_id))

            cursor.execute("DELETE FROM ordonnance_images_temp WHERE utilisateur_id=%s", (user_id,))

        conn.commit()

        return jsonify({
            "message": "Order validated successfully",
            "order_id": order_id,
            "utilisateur_id": user_id,
            "ordonnance_id": ordonnance_id,
            "prescription_qr": prescription_qr
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()
