# routes/auth/register.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from db_app import get_app_connection

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
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

register_subprofile_bp = Blueprint('register_subprofile', __name__)

@register_subprofile_bp.route('/register/subprofile', methods=['POST'])
def register_subprofile():
    data = request.get_json()

    # Champs requis
    nom = data.get("nom")
    prenom = data.get("prenom")
    profile_type = data.get("profile_type")
    main_profile_id = data.get("main_profile_id")

    # ✅ Validation basique
    if not nom or not prenom or not profile_type or not main_profile_id:
        return jsonify({"error": "Missing required fields"}), 400

    if profile_type not in ("parent", "enfant", "epoux", "autre"):
        return jsonify({"error": "Invalid profile_type"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            # 🔹 Vérifier que le profil principal existe et récupérer son email
            cursor.execute(
                "SELECT id, email FROM utilisateurs WHERE id = %s", 
                (main_profile_id,)
            )
            main_profile = cursor.fetchone()

            if not main_profile:
                return jsonify({"error": "Main profile not found"}), 404

            main_email = main_profile["email"] if isinstance(main_profile, dict) else main_profile[1]

            # 🔹 Insérer le sous-profil avec l’email du principal (mot_de_passe vide)
            cursor.execute(
                """
                INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, profile_type)
                VALUES (%s, %s, %s, '', %s)
                """,
                (nom, prenom, main_email, profile_type)
            )
            sub_profile_id = cursor.lastrowid

            # 🔹 Créer la relation dans profile_relations
            cursor.execute(
                """
                INSERT INTO profile_relations (main_profile_id, sub_profile_id)
                VALUES (%s, %s)
                """,
                (main_profile_id, sub_profile_id)
            )

        conn.commit()

        return jsonify({
            "message": "Sub-profile registered successfully",
            "sub_profile_id": sub_profile_id,
            "profile_type": profile_type,
            "main_profile_id": main_profile_id,
            "email_used": main_email
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()
