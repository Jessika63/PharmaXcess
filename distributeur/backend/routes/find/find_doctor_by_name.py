
from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

find_doctor_by_name_bp = Blueprint('find_doctor_by_name', __name__)

@find_doctor_by_name_bp.route('/find_doctor_by_name', methods=['GET'])
def find_doctor_by_name():
    """
    Searches the database for doctors by first name and last name (other parameters are optional).

    Query parameters:
        - first_name: the first name of the doctor to search for (required).
        - last_name: the last name of the doctor to search for (required).
        - sector: optional sector filter.
        - region: optional region filter.

    Return Value:
        - 200 OK with a list of matching doctors.
        - 400 Bad Request, if first_name or last_name is missing.
        - 404 Not Found, if no doctors are found.
        - 500 Internal Server Error, if database or other error.
    """

    first_name = request.args.get('first_name')
    last_name = request.args.get('last_name')
    sector = request.args.get('sector')
    region = request.args.get('region')

    if not first_name or not last_name:
        return jsonify({"error": "Both 'first_name' and 'last_name' are required"}), 400

    connection = None  # Initialiser ici

    try:
        connection = get_connection()  # Connexion à la base de données
        with connection.cursor() as cursor:
            # Construire la requête SQL avec des filtres optionnels
            sql_query = """
            SELECT first_name, last_name, rpps_code, sector, region
            FROM doctors
            WHERE first_name = %s
            AND last_name = %s
            """
            params = [first_name, last_name]

            if sector:
                sql_query += " AND sector = %s"
                params.append(sector)
            if region:
                sql_query += " AND region = %s"
                params.append(region)

            cursor.execute(sql_query, params)
            result = cursor.fetchall()

            if result:
                return jsonify(result), 200
            else:
                return jsonify({"error": "No doctors found matching the criteria"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()
