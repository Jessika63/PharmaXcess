
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

family_history_bp = Blueprint("family_history", __name__)

# CREATE
@family_history_bp.route("/family-history", methods=["POST"])
def create_family_history():
    """
    Objective:
    Create a new family medical history record for a user.

    Endpoint: POST /family-history

    Request Body (JSON):
    - utilisateur_id (int, required): ID of the user to associate the record with.
    - maladie (string, required): Name of the disease or condition.
    - membre (string, optional): Family member affected (e.g., father, mother, sibling).
    - severite (string, optional): Severity of the condition.
    - traitement (string, optional): Treatment or management details.

    Response:
    - 201 Created: If the family history record was successfully added, returns the new record ID.
    - 400 Bad Request: If required fields are missing.
    - 500 Internal Server Error: If a database error occurs during insertion.
    """

    data = request.get_json()
    user_id = data.get("utilisateur_id")
    disease = data.get("maladie")

    if not user_id or not disease:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
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
    finally:
        conn.close()


# GET ALL (by user)
@family_history_bp.route("/family-history/<int:user_id>", methods=["GET"])
def get_all_family_history(user_id):
    """
    Objective:
    Retrieve all family medical history records associated with a specific user.

    Endpoint: GET /family-history/<user_id>

    Path Parameters:
    - user_id (int, required): ID of the user whose family history records are to be retrieved.

    Response:
    - 200 OK: Returns a JSON list of all family history records for the user.
    - 404 Not Found: If no records exist for the given user (optional behavior depending on implementation).
    - 500 Internal Server Error: If a database error occurs during retrieval.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM antecedents WHERE utilisateur_id=%s", (user_id,))
            family_history = cursor.fetchall()
        return jsonify(family_history), 200
    finally:
        conn.close()


# GET ONE
@family_history_bp.route("/family-history/entry/<int:entry_id>", methods=["GET"])
def get_family_history(entry_id):
    """
    Objective:
    Retrieve a single family medical history entry by its unique ID.

    Endpoint: GET /family-history/entry/<entry_id>

    Path Parameters:
    - entry_id (int, required): ID of the specific family history entry to retrieve.

    Response:
    - 200 OK: Returns a JSON object representing the family history entry.
    - 404 Not Found: If no entry exists for the given ID.
    - 500 Internal Server Error: If a database error occurs during retrieval.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM antecedents WHERE id=%s", (entry_id,))
            entry = cursor.fetchone()
        if not entry:
            return jsonify({"error": "Family history entry not found"}), 404
        return jsonify(entry), 200
    finally:
        conn.close()


# UPDATE
@family_history_bp.route("/family-history/entry/<int:entry_id>", methods=["PUT"])
def update_family_history(entry_id):
    """
    Objective:
    Update an existing family medical history entry by its unique ID.

    Endpoint: PUT /family-history/entry/<entry_id>

    Path Parameters:
    - entry_id (int, required): ID of the family history entry to update.

    Request Body (JSON):
    - maladie (string, optional): Name of the disease.
    - membre (string, optional): Family member associated with the disease.
    - severite (string, optional): Severity of the disease.
    - traitement (string, optional): Treatment information.

    Response:
    - 200 OK: Returns a message indicating successful update.
    - 400 Bad Request: If required fields are missing or invalid.
    - 500 Internal Server Error: If a database error occurs during update.
    """

    data = request.get_json()
    conn = get_app_connection()
    try:
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
    finally:
        conn.close()


# DELETE
@family_history_bp.route("/family-history/entry/<int:entry_id>", methods=["DELETE"])
def delete_family_history(entry_id):
    """
    Objective:
    Delete a specific family medical history entry by its unique ID.

    Endpoint: DELETE /family-history/entry/<entry_id>

    Path Parameters:
    - entry_id (int, required): ID of the family history entry to delete.

    Response:
    - 200 OK: Returns a message indicating successful deletion.
    - 404 Not Found: If the entry does not exist.
    - 500 Internal Server Error: If a database error occurs during deletion.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM antecedents WHERE id=%s", (entry_id,))
            conn.commit()
        return jsonify({"message": "Family history deleted successfully"}), 200
    finally:
        conn.close()
