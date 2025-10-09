
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

allergies_bp = Blueprint("allergies", __name__)

# CREATE
@allergies_bp.route("/allergy", methods=["POST"])
def create_allergy():
    data = request.get_json()
    user_id = data.get("utilisateur_id")
    name = data.get("nom")

    if not user_id or not name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO allergies (utilisateur_id, nom, debut, gravite, symptomes, commentaires)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                name,
                data.get("debut"),
                data.get("gravite"),
                data.get("symptomes"),
                data.get("commentaires")
            ))
            conn.commit()
            allergy_id = cursor.lastrowid
        return jsonify({"message": "Allergy added successfully", "id": allergy_id}), 201
    finally:
        conn.close()


# GET ALL (by user)
@allergies_bp.route("/allergy/<int:user_id>", methods=["GET"])
def get_all_allergies(user_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM allergies WHERE utilisateur_id=%s", (user_id,))
            allergies = cursor.fetchall()
        return jsonify(allergies), 200
    finally:
        conn.close()


# GET ONE
@allergies_bp.route("/allergy/entry/<int:allergy_id>", methods=["GET"])
def get_allergy(allergy_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM allergies WHERE id=%s", (allergy_id,))
            allergy = cursor.fetchone()
        if not allergy:
            return jsonify({"error": "Allergy not found"}), 404
        return jsonify(allergy), 200
    finally:
        conn.close()


# UPDATE
@allergies_bp.route("/allergy/entry/<int:allergy_id>", methods=["PUT"])
def update_allergy(allergy_id):
    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE allergies
                SET nom=%s, debut=%s, gravite=%s, symptomes=%s, commentaires=%s
                WHERE id=%s
            """, (
                data.get("nom"),
                data.get("debut"),
                data.get("gravite"),
                data.get("symptomes"),
                data.get("commentaires"),
                allergy_id
            ))
            conn.commit()
        return jsonify({"message": "Allergy updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@allergies_bp.route("/allergy/entry/<int:allergy_id>", methods=["DELETE"])
def delete_allergy(allergy_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM allergies WHERE id=%s", (allergy_id,))
            conn.commit()
        return jsonify({"message": "Allergy deleted successfully"}), 200
    finally:
        conn.close()
