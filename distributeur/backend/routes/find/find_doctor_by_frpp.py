
from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

find_doctor_by_frpp_bp = Blueprint('find_doctor_by_frpp', __name__)

@find_doctor_by_frpp_bp.route('/find_doctor_by_frpp', methods=['GET'])
def find_doctor_by_frpp():
    """
    Checks if a doctor with the given FRPP code exists in the database.

    Query parameters:
        - frpp: the French Regulation on Pharmaceutical Products code (required).

    Return Value:
        - 200 OK with a boolean indicating if the doctor exists.
        - 400 Bad Request, if the 'frpp' parameter is missing.
        - 500 Internal Server Error, if database or other error.
    """

    frpp = request.args.get('frpp')

    if not frpp:
        return jsonify({"error": "'frpp' parameter is required"}), 400

    connection = None  # Initialiser ici

    try:
        connection = get_connection()  # Connexion à la base de données
        with connection.cursor() as cursor:
            sql_query = """
            SELECT 1
            FROM doctors
            WHERE frpp_code = %s
            """
            cursor.execute(sql_query, (frpp,))
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
