import pytest
import config
from unittest.mock import patch

# Test case to successfully add a doctor
@pytest.mark.order(1)  # LOX n°1
def test_add_doctor_success(client):
    """
    Objectif: Test the /add_doctor endpoint for successfully adding a new doctor to the database with valid data.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request to add a doctor with valid data
    response = client.post('/add_doctor',
        json=config.dict_doctor_to_add["add_success_1"]
    )
    # Assert that the response status code is 201 (Created)
    assert response.status_code == 201
    # Assert that the response contains the success message
    assert b'Doctor added successfully' in response.data

# Test case where a required field (RPPS) is missing while adding a doctor
@pytest.mark.order(1)  # LOX n°1
def test_add_doctor_missing_field(client):
    """
    Objectif: Test the /add_doctor endpoint when a required field (RPPS) is missing in the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request with missing 'rpps' field
    response = client.post('/add_doctor',
        json=config.dict_doctor_to_add["missing_field_rpps"]
    )
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400  # Bad request
    # Assert that the response contains the error message
    assert b'All fields are required' in response.data

# Test case to simulate a database connection error while adding a doctor
@pytest.mark.order(1)  # LOX n°1
@patch('routes.add.add_doctor.get_connection', side_effect=Exception("Database connection failed"))
def test_add_doctor_db_error(mock_get_connection, client):
    """
    Objectif: Test the /add_doctor endpoint when a database connection error occurs during the doctor addition process.

    Parameters:
        - mock_get_connection: Mock object that simulates the database connection function and raises an exception. (Mock)
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request to add a doctor, which will trigger a DB error
    response = client.post('/add_doctor',
        json=config.dict_doctor_to_add["add_success_1"]
    )
    # Assert that the response status code is 500 (Internal Server Error)
    assert response.status_code == 500
    # Assert that the response contains the database error message
    assert b'Database connection failed' in response.data
