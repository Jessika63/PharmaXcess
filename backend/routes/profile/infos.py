
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

infos_bp = Blueprint("infos", __name__)

# GET ALL
@infos_bp.route("/all_infos", methods=["GET"])
def get_all_infos():
    """
    Objective:
    Retrieve all user information stored in the database.

    Endpoint: GET /all_infos

    Parameters:
    - None

    Response:
    - 200 OK: Returns a JSON array containing all user records.
    - 500 Internal Server Error: If a database error occurs while fetching the data.
    """

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
    """
    Objective:
    Retrieve detailed information for a specific user by their ID.

    Endpoint: GET /infos/<user_id>

    Parameters:
    - user_id (int): The ID of the user whose information is to be retrieved.

    Response:
    - 200 OK: Returns a JSON object containing the user's information.
    - 404 Not Found: If no user exists with the specified ID.
    - 500 Internal Server Error: If a database error occurs while fetching the data.
    """

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
    """
    Objective:
    Update the personal information of a specific user in the database.

    Endpoint: PUT /infos/<user_id>

    Parameters:
    - user_id (int): The ID of the user whose information is to be updated.
    - JSON body: May include any of the following fields:
        - date_naissance (str): Date of birth.
        - poids (float): Weight of the user.
        - taille (float): Height of the user.
        - groupe_sanguin (str): Blood group.
        - telephone (str): Phone number.
        - numero_securite_sociale (str): Social security number.
        - adresse (str): Address.
        - contact_urgence_nom (str): Name of emergency contact.
        - contact_urgence_tel (str): Phone number of emergency contact.

    Response:
    - 200 OK: Confirmation message that the user's information was successfully updated.
    - 400 Bad Request: If required data is missing or invalid.
    - 500 Internal Server Error: If a database error occurs while updating the data.
    """

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
    """
    Objective:
    Delete all personal information of a specific user from the database.

    Endpoint: DELETE /infos/<user_id>

    Parameters:
    - user_id (int): The ID of the user whose information is to be deleted.

    Response:
    - 200 OK: Confirmation message that the user's information was successfully deleted.
    - 404 Not Found: If the user with the given ID does not exist.
    - 500 Internal Server Error: If a database error occurs during deletion.
    """

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM utilisateurs WHERE id=%s", (user_id,))
            conn.commit()
        return jsonify({"message": "Infos deleted successfully"}), 200
    finally:
        conn.close()
