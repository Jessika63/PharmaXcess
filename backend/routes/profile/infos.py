
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

profile_bp = Blueprint("profile", __name__)

# CREATE (profile creation — usually done during registration)
@profile_bp.route("/profile", methods=["POST"])
def create_profile():
    data = request.get_json()
    last_name = data.get("nom")
    first_name = data.get("prenom")
    email = data.get("email")
    password = data.get("mot_de_passe")

    if not last_name or not first_name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe)
            VALUES (%s, %s, %s, %s)
        """, (last_name, first_name, email, password))
        conn.commit()
        user_id = cursor.lastrowid

    return jsonify({"message": "Profile created successfully", "id": user_id}), 201


# GET ALL
@profile_bp.route("/profiles", methods=["GET"])
def get_all_profiles():
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM utilisateurs")
        users = cursor.fetchall()
    return jsonify(users), 200


# GET UNIQUE
@profile_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM utilisateurs WHERE id=%s", (user_id,))
        user = cursor.fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200


# UPDATE
@profile_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    data = request.get_json()
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE utilisateurs SET
                nom=%s, prenom=%s, email=%s, date_naissance=%s,
                poids=%s, taille=%s, groupe_sanguin=%s, telephone=%s,
                numero_securite_sociale=%s, adresse=%s,
                contact_urgence_nom=%s, contact_urgence_tel=%s,
                profile_type=%s
            WHERE id=%s
        """, (
            data.get("nom"),
            data.get("prenom"),
            data.get("email"),
            data.get("date_naissance"),
            data.get("poids"),
            data.get("taille"),
            data.get("groupe_sanguin"),
            data.get("telephone"),
            data.get("numero_securite_sociale"),
            data.get("adresse"),
            data.get("contact_urgence_nom"),
            data.get("contact_urgence_tel"),
            data.get("profile_type"),
            user_id
        ))
        conn.commit()

    return jsonify({"message": "Profile updated successfully"}), 200


# DELETE
@profile_bp.route("/profile/<int:user_id>", methods=["DELETE"])
def delete_profile(user_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM utilisateurs WHERE id=%s", (user_id,))
        conn.commit()
    return jsonify({"message": "Profile deleted successfully"}), 200
