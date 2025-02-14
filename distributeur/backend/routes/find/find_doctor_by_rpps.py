
from flask import Blueprint, request, jsonify
from db import get_connection  # Import the database connection function

# Create a Blueprint for finding doctors by RPPS
find_doctor_by_rpps_bp = Blueprint('find_doctor_by_rpps', __name__)

@find_doctor_by_rpps_bp.route('/find_doctor_by_rpps', methods=['GET'])
def find_doctor_by_rpps():
    """
    Checks if a doctor with the given RPPS code exists in the database.

    Query parameters:
        - rpps (str): Required. The RPPS code of the doctor.

    Returns:
        - 200 OK: JSON response with 'exists': True or False.
        - 400 Bad Request: If the 'rpps' parameter is missing.
        - 500 Internal Server Error: In case of a database error.
    """

    # Retrieve and validate the RPPS parameter
    rpps = request.args.get('rpps')
    if not rpps:
        return jsonify({"error": "'rpps' parameter is required"}), 400

    connection = None  # Initialize connection

    try:
        # Establish database connection
        connection = get_connection()
        with connection.cursor() as cursor:
            sql_query = "SELECT 1 FROM doctors WHERE rpps_code = %s"
            cursor.execute(sql_query, (rpps,))
            result = cursor.fetchone()

            # Return JSON response
            return jsonify({"exists": bool(result)}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Ensure the database connection is closed
        if connection:
            connection.close()
