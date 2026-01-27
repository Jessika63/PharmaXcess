from flask import Blueprint, request, jsonify
from db_app import get_app_connection

from routes.profile.profile_access import get_current_user_id

verify_ordonnance_bp = Blueprint(
    "verify_ordonnance",
    __name__
)

@verify_ordonnance_bp.route("/ordonnances/verify", methods=["POST"])
def verify_ordonnance():
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    ordonnance_id = data.get("ordonnance_id")
    action = data.get("action")

    if action not in ["validate", "refuse"]:
        return jsonify({"error": "Invalid action"}), 400

    new_status = "active" if action == "validate" else "expiree"

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE ordonnances
                SET statut = %s
                WHERE id = %s AND statut = 'non_verifiee'
            """, (new_status, ordonnance_id))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"error": "Ordonnance not found or already processed"}), 404
    finally:
        conn.close()

    return jsonify({
        "message": "Ordonnance traitée",
        "ordonnance_id": ordonnance_id,
        "statut": new_status
    }), 200
