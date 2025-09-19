
from flask import Blueprint, request, jsonify
from db_doctors import get_connection  # Import function to establish a database connection

# Create a Blueprint for the add_list_doctors route
add_list_doctors_bp = Blueprint('add_list_doctors', __name__)

@add_list_doctors_bp.route('/add_list_doctors', methods=['POST'])
def add_list_doctors():
    """
    Objectif: Adds multiple doctors to the database in a single operation.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - doctors: A list of doctor objects, each containing the required fields. (List of Objects, Required)
            - first_name: Doctor's first name. (String, Required)
            - last_name: Doctor's last name. (String, Required)
            - rpps: RPPS code (French Regulation on Pharmaceutical Products). (String, Required)
            - sector: Doctor's sector of activity. (String, Required)
            - region: Doctor's region of practice. (String, Required)

    Return Value:
        - 201: JSON response confirming successful addition of all doctors. (Object)
        - 400: JSON error response if the request body is invalid or any required field is missing. (Object)
        - 500: JSON error response for database connection issues or other internal errors. (Object)
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
