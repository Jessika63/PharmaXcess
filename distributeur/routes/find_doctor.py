from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

find_doctor_bp = Blueprint('find_doctor', __name__)

@find_doctor_bp.route('/find_doctor', methods=['GET'])
def find_doctor():
    first_name = request.args.get('first_name')
    last_name = request.args.get('last_name')
    frpp = request.args.get('frpp')
    sector = request.args.get('sector')
    region = request.args.get('region')

    if not first_name or not last_name or not frpp or not sector or not region:
        return jsonify({"error": "All parameters 'first_name', 'last_name', 'frpp', 'sector', and 'region' are required"}), 400

    try:
        connection = get_connection()  # Établir la connexion ici
        with connection.cursor() as cursor:
            sql_query = """
            SELECT first_name, last_name
            FROM doctors
            WHERE first_name = %s
            AND last_name = %s
            AND frpp_code = %s
            AND sector = %s
            AND region = %s
            """
            cursor.execute(sql_query, (first_name, last_name, frpp, sector, region))
            result = cursor.fetchone()

            if result:
                return jsonify({"message": "Doctor found successfully"}), 200
            else:
                return jsonify({"error": "Doctor not found or details do not match"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()  # Fermer la connexion
