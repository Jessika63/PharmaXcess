from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
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
    
    # If token is the placeholder token (account didn't exist), return error
    if token == "token_non_existant":
        return jsonify({"error": "Invalid or expired token"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            # First, find the user by token and ensure token not expired
            cursor.execute(
                """SELECT mot_de_passe FROM utilisateurs
                   WHERE reset_token=%s AND reset_token_expiration > %s""",
                (token, datetime.datetime.now())
            )
            row = cursor.fetchone()

            if not row:
                return jsonify({"error": "Invalid or expired token"}), 400

            # row is a dict (DictCursor) with key 'mot_de_passe'
            current_hashed = row.get('mot_de_passe') if isinstance(row, dict) else (row[0] if row else None)

            # Disallow reusing the same password
            if current_hashed and check_password_hash(current_hashed, new_password):
                return jsonify({"error": "New password must be different"}), 400

            # Update to the new hashed password and clear the token
            hashed_password = generate_password_hash(new_password)
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
    finally:
        if conn:
            conn.close()
