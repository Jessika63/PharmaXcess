
from flask import Blueprint, request, jsonify
from db_doctors import get_connection  # Import the connection function

remove_doctor_bp = Blueprint('remove_doctor', __name__)

@remove_doctor_bp.route('/remove_doctor', methods=['DELETE'])
def remove_doctor():
    """
    Objectif: Removes a doctor from the database based on specific identification criteria.

    Parameters:
        - None

    Query parameters:
        - first_name: The first name of the doctor to remove. (String, Required)
        - last_name: The last name of the doctor to remove. (String, Required)
        - rpps: The French Regulation on Pharmaceutical Products code of the doctor. (String, Required)
        - sector: The sector of activity of the doctor. (String, Required)
        - region: The region where the doctor practices. (String, Required)

    Return Value:
        - 200: JSON response confirming successful removal of the doctor. (Object)
        - 400: JSON error response if any required parameters are missing. (Object)
        - 404: JSON error response if the specified doctor is not found in the database. (Object)
        - 500: JSON error response for database connection issues or other internal errors. (Object)
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
