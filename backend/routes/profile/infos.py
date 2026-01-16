
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

    import re
    from datetime import datetime

    data = request.get_json() or {}
    # Accept a single full 'name' field from frontend and map it to 'nom'
    if data.get('name'):
        data['nom'] = data.get('name')
        # we don't distinguish prenom; clear or leave empty
        data['prenom'] = ''
    conn = get_app_connection()
    try:
        # Build dynamic update to avoid overwriting fields with null when not provided
        fields = []
        values = []

        # Helper: normalize date formats. Accept DD/MM/YYYY or YYYY-MM-DD
        def normalize_date(val):
            if not val:
                return None
            val = str(val).strip()
            # DD/MM/YYYY -> YYYY-MM-DD
            m = re.match(r"^(\d{2})/(\d{2})/(\d{4})$", val)
            if m:
                day = int(m.group(1))
                month = int(m.group(2))
                year = int(m.group(3))
                try:
                    d = datetime(year, month, day)
                    return d.strftime('%Y-%m-%d')
                except Exception:
                    return None
            # YYYY-MM-DD -> keep if valid
            m2 = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", val)
            if m2:
                try:
                    d = datetime.fromisoformat(val)
                    return d.strftime('%Y-%m-%d')
                except Exception:
                    return None
            # Try generic parse
            try:
                d = datetime.fromisoformat(val)
                return d.strftime('%Y-%m-%d')
            except Exception:
                return None

        # If frontend provides a single 'contact_urgence' field, split it into name/phone
        contact_nom = data.get('contact_urgence_nom')
        contact_tel = data.get('contact_urgence_tel')
        if data.get('contact_urgence'):
            raw = str(data.get('contact_urgence')).strip()
            parts = [p.strip() for p in raw.split(',') if p.strip()]
            if len(parts) == 0:
                contact_nom = ''
                contact_tel = ''
            elif len(parts) == 1:
                # guess: if there are digits -> phone else name
                if re.search(r"\d", parts[0]):
                    contact_tel = parts[0]
                    contact_nom = ''
                else:
                    contact_nom = parts[0]
                    contact_tel = ''
            else:
                contact_nom = parts[0]
                contact_tel = parts[1]

        # Map allowed fields dynamically
        allowed = [
            ('date_naissance', lambda v: normalize_date(v)),
            ('poids', lambda v: v),
            ('taille', lambda v: v),
            ('groupe_sanguin', lambda v: v),
            ('telephone', lambda v: v),
            ('numero_securite_sociale', lambda v: v),
            ('adresse', lambda v: v),
            ('contact_urgence_nom', lambda v: v),
            ('contact_urgence_tel', lambda v: v),
            ('nom', lambda v: v),
            ('prenom', lambda v: v),
        ]

        # Fill contact fields from parsed values if present
        if contact_nom is not None:
            data['contact_urgence_nom'] = contact_nom
        if contact_tel is not None:
            data['contact_urgence_tel'] = contact_tel

        for key, transform in allowed:
            if key in data and data.get(key) is not None:
                val = transform(data.get(key))
                # If date normalization failed, reject the request
                if key == 'date_naissance' and data.get('date_naissance') and val is None:
                    return jsonify({"error": "Invalid date format for date_naissance"}), 400
                fields.append(f"{key}=%s")
                values.append(val)

        if not fields:
            return jsonify({"error": "No valid fields provided to update"}), 400

        set_clause = ", ".join(fields)
        sql = f"UPDATE utilisateurs SET {set_clause} WHERE id=%s"
        values.append(user_id)

        with conn.cursor() as cursor:
            cursor.execute(sql, tuple(values))
            conn.commit()

        return jsonify({"message": "Infos updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
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
