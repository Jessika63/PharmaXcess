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
            return jsonify({"message": "Login successful", "user_id": user["id"]}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    finally:
        if conn:
            conn.close()

switch_profile_bp = Blueprint('switch_profile', __name__)

@switch_profile_bp.route('/switch_profile', methods=['POST'])
def switch_profile():
    data = request.get_json()
    new_profile_id = data.get("new_profile_id")

    if not new_profile_id:
        return jsonify({"error": "Missing new_profile_id"}), 400

    # Vérifier qu’un utilisateur est bien connecté
    current_user_id = session.get("user_id")
    if not current_user_id:
        return jsonify({"error": "No active session"}), 401

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            # 🔹 Vérifier que la relation entre le profil principal et le sous-profil existe
            cursor.execute("""
                SELECT pr.id
                FROM profile_relations pr
                JOIN utilisateurs main_u ON main_u.id = pr.main_profile_id
                JOIN utilisateurs sub_u ON sub_u.id = pr.sub_profile_id
                WHERE pr.main_profile_id = %s AND pr.sub_profile_id = %s
            """, (current_user_id, new_profile_id))
            relation = cursor.fetchone()

            if not relation:
                return jsonify({"error": "You don't have permission to access this profile"}), 403

            # 🔹 Vérifier que le sous-profil existe
            cursor.execute("SELECT * FROM utilisateurs WHERE id = %s", (new_profile_id,))
            sub_profile = cursor.fetchone()

            if not sub_profile:
                return jsonify({"error": "Sub-profile not found"}), 404

        # 🔹 Fermer l’ancienne session et ouvrir la nouvelle
        session.pop("user_id", None)
        session["user_id"] = sub_profile["id"]

        return jsonify({
            "message": "Profile switched successfully",
            "new_profile_id": sub_profile["id"],
            "new_profile_type": sub_profile["profile_type"],
            "nom": sub_profile["nom"],
            "prenom": sub_profile["prenom"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
