from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql

clickcollect_status_bp = Blueprint('clickcollect_status', __name__)

@clickcollect_status_bp.route("/clickcollect/status", methods=["GET"])
def get_order_status():
    order_id = request.args.get("order_id")
    if not order_id:
        return jsonify({"error": "Missing order_id"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT id, utilisateur_id, ordonnance_id, statut, raison_refus, contenu_qr, date_demande, date_validation
                FROM commandes
                WHERE id=%s
            """, (order_id,))
            c = cursor.fetchone()

        if not c:
            return jsonify({"error": "Order not found"}), 404

        data = {
            "order_id": c["id"],
            "user_id": c["utilisateur_id"],
            "ordonnance_id": c["ordonnance_id"],
            "status": c["statut"],
            "refusal_reason": c["raison_refus"],
            "contenu_qr": c["contenu_qr"],
            "date_demande": c["date_demande"].isoformat() if c["date_demande"] else None,
            "date_validation": c["date_validation"].isoformat() if c["date_validation"] else None
        }
        return jsonify({"order": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
