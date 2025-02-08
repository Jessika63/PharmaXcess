
from flask import Blueprint, request, jsonify
from db import get_connection  # Import function to establish a database connection

# Create a Blueprint for the add_doctor route
add_doctor_bp = Blueprint('add_doctor', __name__)

@add_doctor_bp.route('/add_doctor', methods=['POST'])
def add_doctor():
    """
    Adds a new doctor to the database.

    Expected JSON request body:
        - first_name (str): Doctor's first name.
        - last_name (str): Doctor's last name.
        - rpps (str): RPPS code (French Regulation on Pharmaceutical Products).
        - sector (str): Sector of activity.
        - region (str): Region of practice.

    Returns:
        - 201 Created: If the doctor is successfully added.
        - 400 Bad Request: If any required field is missing.
        - 500 Internal Server Error: If a database or unexpected error occurs.
    """

    # Retrieve JSON data from request
    data = request.get_json()

    # Extract required fields
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    rpps = data.get('rpps')
    sector = data.get('sector')
    region = data.get('region')

    # Validate that all required fields are provided
    if not all([first_name, last_name, rpps, sector, region]):
        return jsonify({"error": "All fields are required"}), 400

    connection = None  # Initialize the connection variable

    try:
        # Establish a database connection
        connection = get_connection()

        with connection.cursor() as cursor:
            # SQL query to insert a new doctor into the database
            sql_query = """
            INSERT INTO doctors (first_name, last_name, rpps_code, sector, region)
            VALUES (%s, %s, %s, %s, %s)
            """
            # Execute the query with the provided data
            cursor.execute(sql_query, (first_name, last_name, rpps, sector, region))

            # Commit the transaction to save changes
            connection.commit()

            return jsonify({"message": "Doctor added successfully"}), 201

    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Ensure the database connection is closed to avoid leaks
        if connection:
            connection.close()
