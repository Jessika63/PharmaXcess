from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

add_doctor_bp = Blueprint('add_doctor', __name__)

@add_doctor_bp.route('/add_doctor', methods=['POST'])
def add_doctor():
    """
    Adds a new doctor to the database.

    Request body (JSON):
        - first_name: the first name of the doctor.
        - last_name: the last name of the doctor.
        - frpp: the French Regulation on Pharmaceutical Products code.
        - sector: the sector of activity.
        - region: the region.

    Return Value:
        - 201 Created with a success message.
        - 400 Bad Request if required fields are missing.
        - 500 Internal Server Error if database or other error.
    """

    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    frpp = data.get('frpp')
    sector = data.get('sector')
    region = data.get('region')

    if not first_name or not last_name or not frpp or not sector or not region:
        return jsonify({"error": "All fields are required"}), 400

    try:
        connection = get_connection()  # Établir la connexion ici
        with connection.cursor() as cursor:
            sql_query = """
            INSERT INTO doctors (first_name, last_name, frpp_code, sector, region)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql_query, (first_name, last_name, frpp, sector, region))
            connection.commit()
            return jsonify({"message": "Doctor added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()  # Fermer la connexion
