from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from datetime import datetime
import pymysql

clickcollect_send_bp = Blueprint('clickcollect_send', __name__)

@clickcollect_send_bp.route("/clickcollect/send", methods=["POST"])
def send_order():
    """
    Send a new Click & Collect order.

    Expects JSON body:
        {
            "user_id": <int>,
            "ordonnance_id": <int>
        }

    Returns:
        - 201 with { message, order_id, user_id, ordonnance_id } if successful
        - 400 for missing fields
        - 404 if user or prescription not found
        - 409 if an order already exists for the same user/prescription
        - 500 for internal server errors
    """
    data = request.get_json() or {}
    user_id = data.get("user_id")
    ordonnance_id = data.get("ordonnance_id")

    if not user_id or not ordonnance_id:
        return jsonify({
            "error": "Missing required fields: 'user_id' and 'ordonnance_id' are both required"
        }), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id FROM utilisateurs WHERE id=%s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": f"User with id={user_id} does not exist"}), 404

            cursor.execute("SELECT id FROM ordonnances WHERE id=%s", (ordonnance_id,))
            if not cursor.fetchone():
                return jsonify({"error": f"Ordonnance with id={ordonnance_id} does not exist"}), 404

            cursor.execute(
                """
                SELECT id, statut FROM commandes
                WHERE utilisateur_id = %s AND ordonnance_id = %s AND statut IN ('en_attente', 'valide')
                """,
                (user_id, ordonnance_id)
            )
            existing = cursor.fetchone()
            if existing:
                return jsonify({
                    "error": (
                        f"An existing order (ID {existing['id']}) already exists "
                        f"for this user and prescription with status '{existing['statut']}'"
                    )
                }), 409

            cursor.execute(
                """
                INSERT INTO commandes (utilisateur_id, ordonnance_id, statut, date_demande)
                VALUES (%s, %s, 'en_attente', %s)
                """,
                (user_id, ordonnance_id, datetime.now())
            )
            order_id = cursor.lastrowid
            conn.commit()

        return jsonify({
            "message": "Order sent successfully",
            "order_id": order_id,
            "user_id": user_id,
            "ordonnance_id": ordonnance_id
        }), 201

    except pymysql.MySQLError as e:
        return jsonify({
            "error": f"MySQL error: {e.args[1]} (code {e.args[0]})"
        }), 500

    except Exception as e:
        return jsonify({
            "error": f"Unexpected error: {str(e)}"
        }), 500

    finally:
        if conn:
            conn.close()
