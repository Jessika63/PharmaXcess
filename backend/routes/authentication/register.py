# routes/auth/register.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from db_app import get_app_connection
import pymysql

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nom = data.get("nom")
    prenom = data.get("prenom")
    email = data.get("email")
    password = data.get("password")

    if not nom or not prenom or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    hashed_password = generate_password_hash(password)

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe)
                   VALUES (%s, %s, %s, %s)""",
                (nom, prenom, email, hashed_password)
            )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except pymysql.IntegrityError as ie:
        # 1062 is MySQL duplicate entry error code
        try:
            errno = ie.args[0]
        except Exception:
            errno = None

        if errno == 1062:
            # Return a friendly message for duplicate email
            return jsonify({"error": "Un compte existe déjà avec cet email"}), 409
        # fallback to generic integrity error
        return jsonify({"error": "Erreur de contrainte en base de données"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
