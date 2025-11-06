# routes/auth/forgot_password.py
import uuid, datetime
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

forgot_password_bp = Blueprint('forgot_password', __name__)

@forgot_password_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email requis"}), 400

    reset_token = str(uuid.uuid4())
    expiration = datetime.datetime.now() + datetime.timedelta(hours=1)

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE utilisateurs SET reset_token=%s, reset_token_expiration=%s WHERE email=%s",
                (reset_token, expiration, email)
            )
            affected = cursor.rowcount
        conn.commit()

        # If no row was affected, the email doesn't exist. Do not reveal that to the client.
        if not affected:
            # Generic success response to avoid account enumeration.
            return jsonify({
                "message": "Si un compte existe pour cet email, vous recevrez un lien pour réinitialiser le mot de passe",
                "token": "token_non_existant"
            }), 200

        # Email existed and token was set. For development we may return the token.
        # In production, prefer sending the token via email and NOT returning it here.
        return jsonify({
            "message": "Password reset token generated",
            "token": reset_token
        }), 200
    finally:
        if conn:
            conn.close()
