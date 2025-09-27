# routes/auth/login.py
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from db_app import get_app_connection

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM utilisateurs WHERE email=%s", (email,))
        user = cursor.fetchone()

    if user and check_password_hash(user["mot_de_passe"], password):
        session["user_id"] = user["id"]
        return jsonify({"message": "Login successful", "user_id": user["id"]}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
