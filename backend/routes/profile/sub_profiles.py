
from flask import Blueprint, request, jsonify, session
from db_app import get_app_connection
from profile_access import get_current_user_id, profile_access_condition

sub_profile_bp = Blueprint('sub_profile', __name__)

# ------------------------------------------
# 🔹 Créer un sous-profil lié à un profil principal
# ------------------------------------------
@sub_profile_bp.route('/register/subprofile', methods=['POST'])
def register_subprofile():
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    nom = data.get("nom")
    prenom = data.get("prenom")
    profile_type = data.get("profile_type")
    main_profile_id = data.get("main_profile_id")

    # ✅ Validation
    if not nom or not prenom or not profile_type or not main_profile_id:
        return jsonify({"error": "Missing required fields"}), 400
    if profile_type not in ("parent", "enfant", "epoux", "autre"):
        return jsonify({"error": "Invalid profile_type"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor(dictionary=True) as cursor:
            # ✅ Vérifie que l'utilisateur courant a bien accès au profil principal
            condition = profile_access_condition()
            cursor.execute(
                f"SELECT id, email FROM utilisateurs WHERE id = %s AND {condition}",
                (main_profile_id, current_user_id, current_user_id)
            )
            main_profile = cursor.fetchone()
            if not main_profile:
                return jsonify({"error": "You are not allowed to create a sub-profile for this user"}), 403

            # 🔹 Crée le sous-profil
            cursor.execute("""
                INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, profile_type)
                VALUES (%s, %s, %s, '', %s)
            """, (nom, prenom, main_profile["email"], profile_type))
            sub_profile_id = cursor.lastrowid

            # 🔹 Enregistre la relation
            cursor.execute("""
                INSERT INTO profile_relations (main_profile_id, sub_profile_id)
                VALUES (%s, %s)
            """, (main_profile_id, sub_profile_id))

        conn.commit()
        return jsonify({
            "message": "Sub-profile registered successfully",
            "sub_profile_id": sub_profile_id,
            "profile_type": profile_type,
            "main_profile_id": main_profile_id,
            "email_used": main_profile["email"]
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


# ------------------------------------------
# 🔹 Changer de profil (switch principal ↔ secondaire)
# ------------------------------------------
@sub_profile_bp.route('/switch_profile', methods=['POST'])
def switch_profile():
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    new_profile_id = data.get("new_profile_id")
    if not new_profile_id:
        return jsonify({"error": "Missing new_profile_id"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor(dictionary=True) as cursor:
            # ✅ Vérifie que le profil cible est accessible
            condition = profile_access_condition()
            cursor.execute(
                f"SELECT * FROM utilisateurs WHERE id = %s AND {condition}",
                (new_profile_id, current_user_id, current_user_id)
            )
            target_profile = cursor.fetchone()
            if not target_profile:
                return jsonify({"error": "You don't have permission to access this profile"}), 403

        # 🔹 Met à jour la session
        session["user_id"] = target_profile["id"]

        return jsonify({
            "message": "Profile switched successfully",
            "new_profile_id": target_profile["id"],
            "new_profile_type": target_profile["profile_type"],
            "nom": target_profile["nom"],
            "prenom": target_profile["prenom"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


# ------------------------------------------
# 🔹 Récupérer tous les profils accessibles depuis le compte actuel
# ------------------------------------------
@sub_profile_bp.route('/accessible_profiles', methods=['GET'])
def get_accessible_profiles():
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    conn = get_app_connection()
    try:
        with conn.cursor(dictionary=True) as cursor:
            # ✅ Récupère tous les utilisateurs accessibles
            condition = profile_access_condition()
            cursor.execute(f"""
                SELECT u.id, u.nom, u.prenom, u.profile_type, u.role
                FROM utilisateurs u
                WHERE {condition}
            """, (current_user_id, current_user_id))
            profiles = cursor.fetchall()

        return jsonify({
            "accessible_profiles": profiles,
            "count": len(profiles)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()
