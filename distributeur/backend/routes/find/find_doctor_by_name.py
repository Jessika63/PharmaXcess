
from flask import Blueprint, request, jsonify
from db import get_connection  # Import the database connection function

# Create a Blueprint for finding doctors by name
find_doctor_by_name_bp = Blueprint('find_doctor_by_name', __name__)

@find_doctor_by_name_bp.route('/find_doctor_by_name', methods=['GET'])
def find_doctor_by_name():
    """
    Searches the database for doctors by last name. Other parameters are optional.

    Query parameters:
        - last_name (str): Required. The last name of the doctor.
        - first_name (str): Optional. Filters by first name.
        - sector (str): Optional. Filters by sector.
        - region (str): Optional. Filters by region.

    Returns:
        - 200 OK: A list of matching doctors.
        - 400 Bad Request: If 'last_name' is missing.
        - 404 Not Found: If no doctors match the criteria.
        - 500 Internal Server Error: In case of a database error.
    """

    # Retrieve query parameters
    last_name = request.args.get('last_name')
    first_name = request.args.get('first_name')
    sector = request.args.get('sector')
    region = request.args.get('region')

    # Validate required field
    if not last_name:
        return jsonify({"error": "'last_name' is required"}), 400

    connection = None  # Initialize connection

    try:
        # Establish a database connection
        connection = get_connection()
        with connection.cursor() as cursor:
            # Base SQL query
            sql_query = """
            SELECT first_name, last_name, rpps_code, sector, region
            FROM doctors
            WHERE last_name = %s
            """
            params = [last_name]

            # Add optional filters
            if first_name:
                sql_query += " AND first_name = %s"
                params.append(first_name)
            if sector:
                sql_query += " AND sector = %s"
                params.append(sector)
            if region:
                sql_query += " AND region = %s"
                params.append(region)

            # Execute query
            cursor.execute(sql_query, params)
            result = cursor.fetchall()

            # Check if doctors were found
            if result:
                return jsonify(result), 200
            return jsonify({"error": "No doctors found matching the criteria"}), 404

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Ensure the database connection is closed
        if connection:
            connection.close()
