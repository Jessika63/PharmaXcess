
from flask import Blueprint, request, jsonify
from db import get_connection  # Import the connection function

remove_doctor_bp = Blueprint('remove_doctor', __name__)

@remove_doctor_bp.route('/remove_doctor', methods=['DELETE'])
def remove_doctor():
    """
    Removes a doctor from the database.

    Query parameters:
        - first_name: the first name of the doctor to remove.
        - last_name: the last name of the doctor to remove.
        - rpps: the French Regulation on Pharmaceutical Products code.
        - sector: the sector of activity.
        - region: the region.

    Return Value:
        - 200 OK with a success message.
        - 400 Bad Request if required fields are missing.
        - 404 Not Found if the doctor does not exist.
        - 500 Internal Server Error if database or other error.
    """

    # Get query parameters
    first_name = request.args.get('first_name')
    last_name = request.args.get('last_name')
    rpps = request.args.get('rpps')
    sector = request.args.get('sector')
    region = request.args.get('region')

    # Validate required fields
    if not all([first_name, last_name, rpps, sector, region]):
        return jsonify({"error": "All parameters 'first_name', 'last_name', 'rpps', 'sector', and 'region' are required"}), 400

    connection = None  # Initialize connection

    try:
        # Establish database connection
        connection = get_connection()
        with connection.cursor() as cursor:
            # SQL query to remove the doctor
            sql_query = """
            DELETE FROM doctors
            WHERE first_name = %s
            AND last_name = %s
            AND rpps_code = %s
            AND sector = %s
            AND region = %s
            """
            cursor.execute(sql_query, (first_name, last_name, rpps, sector, region))
            connection.commit()

            if cursor.rowcount > 0:
                return jsonify({"message": "Doctor removed successfully"}), 200
            else:
                return jsonify({"error": "Doctor not found"}), 404

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    finally:
        if connection:
            connection.close()  # Ensure connection is closed
