
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

doctors_bp = Blueprint("doctors", __name__)

# CREATE
@doctors_bp.route("/doctors", methods=["POST"])
def create_doctor():
    data = request.get_json()
    user_id = data.get("utilisateur_id")
    name = data.get("nom")

    if not user_id or not name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO medecins (utilisateur_id, nom, specialite, hopital, telephone, email, adresse)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                name,
                data.get("specialite"),
                data.get("hopital"),
                data.get("telephone"),
                data.get("email"),
                data.get("adresse")
            ))
            conn.commit()
            doctor_id = cursor.lastrowid
        return jsonify({"message": "Doctor added successfully", "id": doctor_id}), 201
    finally:
        conn.close()


# GET ALL
@doctors_bp.route("/doctors/<int:user_id>", methods=["GET"])
def get_all_doctors(user_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM medecins WHERE utilisateur_id=%s", (user_id,))
            doctors = cursor.fetchall()
        return jsonify(doctors), 200
    finally:
        conn.close()


# GET UNIQUE
@doctors_bp.route("/doctor/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM medecins WHERE id=%s", (doctor_id,))
            doctor = cursor.fetchone()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        return jsonify(doctor), 200
    finally:
        conn.close()


# UPDATE
@doctors_bp.route("/doctor/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):
    data = request.get_json()
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE medecins
                SET nom=%s, specialite=%s, hopital=%s, telephone=%s, email=%s, adresse=%s
                WHERE id=%s
            """, (
                data.get("nom"),
                data.get("specialite"),
                data.get("hopital"),
                data.get("telephone"),
                data.get("email"),
                data.get("adresse"),
                doctor_id
            ))
            conn.commit()
        return jsonify({"message": "Doctor updated successfully"}), 200
    finally:
        conn.close()


# DELETE
@doctors_bp.route("/doctor/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM medecins WHERE id=%s", (doctor_id,))
            conn.commit()
        return jsonify({"message": "Doctor deleted successfully"}), 200
    finally:
        conn.close()
