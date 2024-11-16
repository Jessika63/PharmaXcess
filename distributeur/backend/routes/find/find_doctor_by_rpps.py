
from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

find_doctor_by_rpps_bp = Blueprint('find_doctor_by_rpps', __name__)

@find_doctor_by_rpps_bp.route('/find_doctor_by_rpps', methods=['GET'])
def find_doctor_by_rpps():
    """
    Checks if a doctor with the given RPPS code exists in the database.

    Query parameters:
        - rpps: the French Regulation on Pharmaceutical Products code (required).

    Return Value:
        - 200 OK with a boolean indicating if the doctor exists.
        - 400 Bad Request, if the 'rpps' parameter is missing.
        - 500 Internal Server Error, if database or other error.
    """

    rpps = request.args.get('rpps')

    if not rpps:
        return jsonify({"error": "'rpps' parameter is required"}), 400

    connection = None  # Initialiser ici

    try:
        connection = get_connection()  # Connexion à la base de données
        with connection.cursor() as cursor:
            sql_query = """
            SELECT 1
            FROM doctors
            WHERE rpps_code = %s
            """
            cursor.execute(sql_query, (rpps,))
            result = cursor.fetchone()

            if result:
                return jsonify({"exists": True}), 200
            else:
                return jsonify({"exists": False}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()
