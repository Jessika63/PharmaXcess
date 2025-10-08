
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

hospitalizations_bp = Blueprint("hospitalizations", __name__)

# CREATE
@hospitalizations_bp.route("/hospitalizations", methods=["POST"])
def create_hospitalization():
    data = request.get_json()
    user_id = data.get("utilisateur_id")
    hospitalization_type = data.get("type")
    description = data.get("description")

    if not user_id or not hospitalization_type:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO hospitalisations (utilisateur_id, type, description, dates, service, hopital, medecin)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            hospitalization_type,
            description,
            data.get("dates"),
            data.get("service"),
            data.get("hopital"),
            data.get("medecin")
        ))
        conn.commit()
        hospitalization_id = cursor.lastrowid

    return jsonify({"message": "Hospitalization added successfully", "id": hospitalization_id}), 201


# GET ALL (by user)
@hospitalizations_bp.route("/hospitalizations/<int:user_id>", methods=["GET"])
def get_all_hospitalizations(user_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM hospitalisations WHERE utilisateur_id=%s", (user_id,))
        hospitalizations = cursor.fetchall()
    return jsonify(hospitalizations), 200


# GET UNIQUE
@hospitalizations_bp.route("/hospitalization/<int:hospitalization_id>", methods=["GET"])
def get_hospitalization(hospitalization_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM hospitalisations WHERE id=%s", (hospitalization_id,))
        hospitalization = cursor.fetchone()
    if not hospitalization:
        return jsonify({"error": "Hospitalization not found"}), 404
    return jsonify(hospitalization), 200


# UPDATE
@hospitalizations_bp.route("/hospitalization/<int:hospitalization_id>", methods=["PUT"])
def update_hospitalization(hospitalization_id):
    data = request.get_json()
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE hospitalisations
            SET type=%s, description=%s, dates=%s, service=%s, hopital=%s, medecin=%s
            WHERE id=%s
        """, (
            data.get("type"),
            data.get("description"),
            data.get("dates"),
            data.get("service"),
            data.get("hopital"),
            data.get("medecin"),
            hospitalization_id
        ))
        conn.commit()
    return jsonify({"message": "Hospitalization updated successfully"}), 200


# DELETE
@hospitalizations_bp.route("/hospitalization/<int:hospitalization_id>", methods=["DELETE"])
def delete_hospitalization(hospitalization_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM hospitalisations WHERE id=%s", (hospitalization_id,))
        conn.commit()
    return jsonify({"message": "Hospitalization deleted successfully"}), 200
