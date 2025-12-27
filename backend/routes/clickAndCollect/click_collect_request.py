# routes/clickcollect_request.py
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql

clickcollect_request_bp = Blueprint('clickcollect_request', __name__)

@clickcollect_request_bp.route("/clickcollect/requests", methods=["GET"])
def request_pending_orders():
    user_id = request.args.get("user_id")

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT id, utilisateur_id, ordonnance_id, statut, contenu_qr, date_demande FROM commandes WHERE statut='en_attente'"
            params = []
            if user_id:
                sql += " AND utilisateur_id=%s"
                params.append(user_id)

            cursor.execute(sql, params)
            commandes = cursor.fetchall()

        if not commandes:
            return jsonify({"message": "No pending prescriptions"}), 404

        data = [
            {
                "id": c["id"],
                "user_id": c["utilisateur_id"],
                "prescription_id": c["ordonnance_id"],
                "status": c["statut"],
                "contenu_qr": c["contenu_qr"],
                "date_demande": c["date_demande"].isoformat() if c["date_demande"] else None
            }
            for c in commandes
        ]
        return jsonify({"orders": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
