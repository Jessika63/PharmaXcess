from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from db_app import get_app_connection
import datetime

reset_password_bp = Blueprint('reset_password', __name__)

@reset_password_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"error": "Missing token or new password"}), 400

    hashed_password = generate_password_hash(new_password)

    conn = get_app_connection()
    with conn.cursor() as cursor:
        # Met à jour le mot de passe uniquement si le token est encore valide
        cursor.execute(
            """UPDATE utilisateurs 
               SET mot_de_passe=%s, 
                   reset_token=NULL, 
                   reset_token_expiration=NULL
               WHERE reset_token=%s AND reset_token_expiration > %s""",
            (hashed_password, token, datetime.datetime.now())
        )
        updated = cursor.rowcount
    conn.commit()

    if updated:
        return jsonify({"message": "Password reset successful. Token has been cleared."}), 200
    else:
        return jsonify({"error": "Invalid or expired token"}), 400
