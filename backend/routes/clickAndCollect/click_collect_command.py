from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql

clickcollect_command_bp = Blueprint('clickcollect_command', __name__)

@clickcollect_command_bp.route("/clickcollect/commands", methods=["GET"])
def get_user_commands():
    """
    Retrieve all Click & Collect orders for a specific user.

    Query Parameters:
        - user_id (int, required)

    Returns:
        - 200: { "orders": [...] }
        - 400: Missing parameters
        - 404: User not found or no orders
        - 500: Internal server error
    """
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing required parameter: 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id, nom, prenom FROM utilisateurs WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": f"No user found with id={user_id}"}), 404

            cursor.execute("""
                SELECT id, ordonnance_id, statut, raison_refus, contenu_qr, date_demande, date_validation
                FROM commandes
                WHERE utilisateur_id = %s
                ORDER BY date_demande DESC
            """, (user_id,))
            commandes = cursor.fetchall()

        if not commandes:
            return jsonify({
                "message": f"No orders found for user '{user['prenom']} {user['nom']}' (id={user_id})"
            }), 404

        orders_data = []
        for c in commandes:
            order_info = {
                "order_id": c["id"],
                "ordonnance_id": c["ordonnance_id"],
                "status": c["statut"],
                "refusal_reason": c["raison_refus"] if c["raison_refus"] else None,
                "contenu_qr": c["contenu_qr"],
                "date_demande": (
                    c["date_demande"].isoformat()
                    if c["date_demande"] else None
                ),
                "date_validation": (
                    c["date_validation"].isoformat()
                    if c["date_validation"] else None
                )
            }
            orders_data.append(order_info)

        return jsonify({
            "user": {
                "id": user["id"],
                "prenom": user["prenom"],
                "nom": user["nom"]
            },
            "orders": orders_data
        }), 200

    except pymysql.MySQLError as e:
        return jsonify({
            "error": f"MySQL error {e.args[0]}: {e.args[1]}"
        }), 500

    except Exception as e:
        return jsonify({
            "error": f"Unexpected error: {str(e)}"
        }), 500

    finally:
        if conn:
            conn.close()
