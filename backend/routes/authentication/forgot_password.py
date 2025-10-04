# routes/auth/forgot_password.py
import uuid, datetime
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

forgot_password_bp = Blueprint('forgot_password', __name__)

@forgot_password_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    reset_token = str(uuid.uuid4())
    expiration = datetime.datetime.now() + datetime.timedelta(hours=1)

    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE utilisateurs SET reset_token=%s, reset_token_expiration=%s WHERE email=%s",
            (reset_token, expiration, email)
        )
    conn.commit()

    return jsonify({
        "message": "Password reset token generated",
        "token": reset_token
    }), 200
