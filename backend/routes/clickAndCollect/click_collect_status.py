from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql

clickcollect_status_bp = Blueprint('clickcollect_status', __name__)

@clickcollect_status_bp.route("/clickcollect/status", methods=["GET"])
def get_order_status():
    order_id = request.args.get("order_id")

    if not order_id:
        return jsonify({"error": "Missing parameter: 'order_id' is required"}), 400

    if not order_id.isdigit():
        return jsonify({"error": "Invalid parameter: 'order_id' must be a number"}), 400

    conn = None
    try:
        conn = get_app_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT id, utilisateur_id, ordonnance_id, statut, raison_refus, contenu_qr, date_demande, date_validation
                FROM commandes
                WHERE id=%s
            """, (order_id,))
            order = cursor.fetchone()

        if not order:
            return jsonify({"error": f"No order found with ID {order_id}"}), 404

        response = {
            "order_id": order["id"],
            "user_id": order["utilisateur_id"],
            "ordonnance_id": order["ordonnance_id"],
            "status": order["statut"],
            "refusal_reason": order["raison_refus"],
            "contenu_qr": order["contenu_qr"],
            "date_demande": order["date_demande"].isoformat() if order["date_demande"] else None,
            "date_validation": order["date_validation"].isoformat() if order["date_validation"] else None
        }

        return jsonify({
            "message": "Order status retrieved successfully",
            "order": response
        }), 200

    except pymysql.MySQLError as e:
        return jsonify({"error": f"MySQL error: {e.args[1] if len(e.args) > 1 else str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()
