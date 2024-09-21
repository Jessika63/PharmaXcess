from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

remove_doctor_bp = Blueprint('remove_doctor', __name__)

@remove_doctor_bp.route('/remove_doctor', methods=['DELETE'])
def remove_doctor():
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
            DELETE FROM doctors
            WHERE first_name = %s
            AND last_name = %s
            AND frpp_code = %s
            AND sector = %s
            AND region = %s
            """
            cursor.execute(sql_query, (first_name, last_name, frpp, sector, region))
            connection.commit()

            if cursor.rowcount > 0:
                return jsonify({"message": "Doctor removed successfully"}), 200
            else:
                return jsonify({"error": "Doctor not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()  # Fermer la connexion
