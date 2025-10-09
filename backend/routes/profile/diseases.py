
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

diseases_bp = Blueprint("diseases", __name__)

# CREATE
@diseases_bp.route("/diseases", methods=["POST"])
def create_disease():
    data = request.get_json()
    user_id = data.get("utilisateur_id")
    name = data.get("nom")
    description = data.get("description")
    symptoms = data.get("symptomes")
    start_date = data.get("date_debut")

    if not user_id or not name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO maladies (utilisateur_id, nom, description, symptomes, date_debut)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, name, description, symptoms, start_date))
            conn.commit()
            disease_id = cursor.lastrowid
        return jsonify({"message": "Disease added successfully", "id": disease_id}), 201
    finally:
        conn.close()


# GET ALL
@diseases_bp.route("/diseases/<int:user_id>", methods=["GET"])
def get_all_diseases(user_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM maladies WHERE utilisateur_id=%s", (user_id,))
            diseases = cursor.fetchall()
        return jsonify(diseases), 200
    finally:
        conn.close()


# GET UNIQUE
@diseases_bp.route("/disease/entry/<int:disease_id>", methods=["GET"])
def get_disease(disease_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM maladies WHERE id=%s", (disease_id,))
            disease = cursor.fetchone()
        if not disease:
            return jsonify({"error": "Disease not found"}), 404
        return jsonify(disease), 200
    finally:
        conn.close()


# UPDATE
@diseases_bp.route("/disease/entry/<int:disease_id>", methods=["PUT"])
def update_disease(disease_id):
    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE maladies
                SET nom=%s, description=%s, symptomes=%s, date_debut=%s
                WHERE id=%s
            """, (
                data.get("nom"),
                data.get("description"),
                data.get("symptomes"),
                data.get("date_debut"),
                disease_id
            ))
            conn.commit()
        return jsonify({"message": "Disease updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@diseases_bp.route("/disease/entry/<int:disease_id>", methods=["DELETE"])
def delete_disease(disease_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM maladies WHERE id=%s", (disease_id,))
            conn.commit()
        return jsonify({"message": "Disease deleted successfully"}), 200
    finally:
        conn.close()
