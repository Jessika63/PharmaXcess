
from flask import Blueprint, request, jsonify
from db import get_connection  # Import the database connection function

# Create a Blueprint for finding doctors by RPPS
find_doctor_by_rpps_bp = Blueprint('find_doctor_by_rpps', __name__)

@find_doctor_by_rpps_bp.route('/find_doctor_by_rpps', methods=['GET'])
def find_doctor_by_rpps():
    """
    Objectif: Checks if a doctor with the specified RPPS code exists in the database.

    Parameters:
        - None

    Query parameters:
        - rpps: The RPPS code of the doctor to check. (String, Required)

    Return Value:
        - 200: JSON response with a boolean 'exists' field indicating presence. (Object)
        - 400: JSON error response if the 'rpps' parameter is missing. (Object)
        - 500: JSON error response for database or internal errors. (Object)
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
