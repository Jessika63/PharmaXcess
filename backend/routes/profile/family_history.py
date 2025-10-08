
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

family_history_bp = Blueprint("family_history", __name__)

# CREATE
@family_history_bp.route("/family-history", methods=["POST"])
def create_family_history():
    data = request.get_json()
    user_id = data.get("utilisateur_id")
    disease = data.get("maladie")

    if not user_id or not disease:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO antecedents (utilisateur_id, maladie, membre, severite, traitement)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            user_id,
            disease,
            data.get("membre"),
            data.get("severite"),
            data.get("traitement")
        ))
        conn.commit()
        family_history_id = cursor.lastrowid
    return jsonify({"message": "Family history added successfully", "id": family_history_id}), 201


# GET ALL (by user)
@family_history_bp.route("/family-history/<int:user_id>", methods=["GET"])
def get_all_family_history(user_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM antecedents WHERE utilisateur_id=%s", (user_id,))
        family_history = cursor.fetchall()
    return jsonify(family_history), 200


# GET ONE
@family_history_bp.route("/family-history/entry/<int:entry_id>", methods=["GET"])
def get_family_history(entry_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM antecedents WHERE id=%s", (entry_id,))
        entry = cursor.fetchone()
    if not entry:
        return jsonify({"error": "Family history entry not found"}), 404
    return jsonify(entry), 200


# UPDATE
@family_history_bp.route("/family-history/entry/<int:entry_id>", methods=["PUT"])
def update_family_history(entry_id):
    data = request.get_json()
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE antecedents
            SET maladie=%s, membre=%s, severite=%s, traitement=%s
            WHERE id=%s
        """, (
            data.get("maladie"),
            data.get("membre"),
            data.get("severite"),
            data.get("traitement"),
            entry_id
        ))
        conn.commit()
    return jsonify({"message": "Family history updated successfully"}), 200


# DELETE
@family_history_bp.route("/family-history/entry/<int:entry_id>", methods=["DELETE"])
def delete_family_history(entry_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM antecedents WHERE id=%s", (entry_id,))
        conn.commit()
    return jsonify({"message": "Family history deleted successfully"}), 200
