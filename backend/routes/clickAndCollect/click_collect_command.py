from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql

clickcollect_command_bp = Blueprint('clickcollect_command', __name__)

@clickcollect_command_bp.route("/clickcollect/commands", methods=["GET"])
def get_user_commands():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT id, ordonnance_id, statut, raison_refus, contenu_qr, date_demande, date_validation
                FROM commandes
                WHERE utilisateur_id=%s
                ORDER BY date_demande DESC
            """, (user_id,))
            commandes = cursor.fetchall()

        if not commandes:
            return jsonify({"message": "No orders found for this user"}), 404

        data = [
            {
                "order_id": c["id"],
                "ordonnance_id": c["ordonnance_id"],
                "status": c["statut"],
                "refusal_reason": c["raison_refus"],
                "contenu_qr": c["contenu_qr"],
                "date_demande": c["date_demande"].isoformat() if c["date_demande"] else None,
                "date_validation": c["date_validation"].isoformat() if c["date_validation"] else None
            }
            for c in commandes
        ]
        return jsonify({"orders": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
