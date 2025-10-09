
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

infos_bp = Blueprint("infos", __name__)

# GET ALL
@infos_bp.route("/all_infos", methods=["GET"])
def get_all_infos():
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM utilisateurs")
            users = cursor.fetchall()
        return jsonify(users), 200
    finally:
        conn.close()


# GET UNIQUE
@infos_bp.route("/infos/<int:user_id>", methods=["GET"])
def get_infos(user_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM utilisateurs WHERE id=%s", (user_id,))
            user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    finally:
        conn.close()


# UPDATE
@infos_bp.route("/infos/<int:user_id>", methods=["PUT"])
def update_infos(user_id):
    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE utilisateurs SET
                    date_naissance=%s,
                    poids=%s,
                    taille=%s,
                    groupe_sanguin=%s,
                    telephone=%s,
                    numero_securite_sociale=%s,
                    adresse=%s,
                    contact_urgence_nom=%s,
                    contact_urgence_tel=%s
                WHERE id=%s
            """, (
                data.get("date_naissance"),
                data.get("poids"),
                data.get("taille"),
                data.get("groupe_sanguin"),
                data.get("telephone"),
                data.get("numero_securite_sociale"),
                data.get("adresse"),
                data.get("contact_urgence_nom"),
                data.get("contact_urgence_tel"),
                user_id
            ))
            conn.commit()
        return jsonify({"message": "Infos updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@infos_bp.route("/infos/<int:user_id>", methods=["DELETE"])
def delete_infos(user_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM utilisateurs WHERE id=%s", (user_id,))
            conn.commit()
        return jsonify({"message": "Infos deleted successfully"}), 200
    finally:
        conn.close()
