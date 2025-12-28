# routes/auth/login.py
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from db_app import get_app_connection
import pymysql

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    """
    Login route
    Expects JSON: { "email": "...", "password": "..." }
    Returns user_id if successful, 401 if credentials invalid.
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id, mot_de_passe FROM utilisateurs WHERE email=%s", (email,))
            user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        # Verify password first
        if not check_password_hash(user["mot_de_passe"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        # If there is already a session with a different user, refuse unless client requests force
        if "user_id" in session and session.get("user_id") != user["id"] and not data.get("force", False):
            return jsonify({
                "error": "A user is already logged in",
                "user_id": session.get("user_id"),
                "hint": "Provide {\"force\": true} in request body to override the existing session"
            }), 403

        # Clear reset tokens and set session to this user
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE utilisateurs
                SET reset_token = NULL, reset_token_expiration = NULL
                WHERE id = %s
            """, (user["id"],))
        conn.commit()

        # If there was a different user in session, clear session to avoid mixing state
        if "user_id" in session and session.get("user_id") != user["id"]:
            session.clear()

        session["user_id"] = user["id"]

        return jsonify({
            "message": "Login successful",
            "user_id": user["id"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()
