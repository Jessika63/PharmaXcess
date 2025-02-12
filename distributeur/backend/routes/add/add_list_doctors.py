
from flask import Blueprint, request, jsonify
from db import get_connection  # Import function to establish a database connection

# Create a Blueprint for the add_list_doctors route
add_list_doctors_bp = Blueprint('add_list_doctors', __name__)

@add_list_doctors_bp.route('/add_list_doctors', methods=['POST'])
def add_list_doctors():
    """
    Adds a list of doctors to the database.

    Expected JSON request body:
        - doctors (list): A list of doctor objects, where each object contains:
            - first_name (str): Doctor's first name.
            - last_name (str): Doctor's last name.
            - rpps (str): RPPS code (French Regulation on Pharmaceutical Products).
            - sector (str): Sector of activity.
            - region (str): Region of practice.

    Returns:
        - 201 Created: If all doctors are successfully added.
        - 400 Bad Request: If any doctor is missing required fields.
        - 500 Internal Server Error: If a database or unexpected error occurs.
    """

    # Retrieve JSON data from the request
    data = request.get_json()

    # Extract the list of doctors
    doctors = data.get('doctors')

    # Validate that doctors is a non-empty list
    if not isinstance(doctors, list) or not doctors:
        return jsonify({"error": "A non-empty list of doctors is required"}), 400

    # Validate that all doctors have the required fields
    required_fields = {'first_name', 'last_name', 'rpps', 'sector', 'region'}
    for doctor in doctors:
        if not required_fields.issubset(doctor):
            return jsonify({"error": "All fields are required for each doctor"}), 400

    connection = None  # Initialize the connection variable

    try:
        # Establish a database connection
        connection = get_connection()

        with connection.cursor() as cursor:
            # SQL query to insert multiple doctors into the database
            sql_query = """
            INSERT INTO doctors (first_name, last_name, rpps_code, sector, region)
            VALUES (%s, %s, %s, %s, %s)
            """

            # Prepare a list of values for bulk insertion
            values = [(doc['first_name'], doc['last_name'], doc['rpps'], doc['sector'], doc['region']) for doc in doctors]

            # Execute the query for multiple rows
            cursor.executemany(sql_query, values)

            # Commit the transaction
            connection.commit()

            return jsonify({"message": "Doctors added successfully"}), 201

    except Exception as e:
        # Log the error for debugging
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Ensure the database connection is closed
        if connection:
            connection.close()
