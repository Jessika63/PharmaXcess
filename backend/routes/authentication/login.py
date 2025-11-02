# routes/auth/login.py
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from db_app import get_app_connection

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM utilisateurs WHERE email=%s", (email,))
            user = cursor.fetchone()

        if user and check_password_hash(user["mot_de_passe"], password):
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE utilisateurs
                    SET reset_token = NULL, reset_token_expiration = NULL
                    WHERE id = %s
                """, (user["id"],))
            conn.commit()

            session["user_id"] = user["id"]
            # Optionally return some basic user info (avoid sensitive data)
            return jsonify({"message": "Connexion réussie", "user_id": user["id"]}), 200
        else:
            # Friendly French message for wrong credentials
            return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    finally:
        if conn:
            conn.close()
