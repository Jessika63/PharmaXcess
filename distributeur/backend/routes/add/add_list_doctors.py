
from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

add_list_doctors_bp = Blueprint('add_list_doctors', __name__)

@add_list_doctors_bp.route('/add_list_doctors', methods=['POST'])
def add_list_doctors():
    """
    Adds a list of doctors to the database.

    Request body (JSON):
        - doctors: a list of doctor objects, where each object contains:
            - first_name: the first name of the doctor.
            - last_name: the last name of the doctor.
            - frpp: the French Regulation on Pharmaceutical Products code.
            - sector: the sector of activity.
            - region: the region.

    Return Value:
        - 201 Created with a success message for all doctors.
        - 400 Bad Request if any doctor is missing required fields.
        - 500 Internal Server Error if database or other error.
    """

    data = request.get_json()
    doctors = data.get('doctors')

    if not doctors or not isinstance(doctors, list):
        return jsonify({"error": "A list of doctors is required"}), 400

    for doctor in doctors:
        if not all(k in doctor for k in ('first_name', 'last_name', 'frpp', 'sector', 'region')):
            return jsonify({"error": "All fields are required for each doctor"}), 400

    connection = None

    try:
        connection = get_connection()  # Établir la connexion
        with connection.cursor() as cursor:
            sql_query = """
            INSERT INTO doctors (first_name, last_name, frpp_code, sector, region)
            VALUES (%s, %s, %s, %s, %s)
            """
            values = [(doc['first_name'], doc['last_name'], doc['frpp'], doc['sector'], doc['region']) for doc in doctors]
            cursor.executemany(sql_query, values)
            connection.commit()
            return jsonify({"message": "Doctors added successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()