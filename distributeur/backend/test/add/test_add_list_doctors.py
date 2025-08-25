
import pytest
import config
from unittest.mock import patch

# Test case to successfully add a list of doctors
@pytest.mark.order(1)  # LOX n°1
def test_add_list_doctors_success(client):
    """
    Objectif: Test the /add_list_doctors endpoint for successfully adding multiple doctors to the database with valid data.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request to add a list of doctors with valid data
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["add_success_1"],
            config.dict_doctor_to_add["add_success_2"]
        ]
    })
    # Assert that the response status code is 201 (Created)
    assert response.status_code == 201
    # Assert that the response contains the success message
    assert b'Doctors added successfully' in response.data

# Test case where the list of doctors is empty
@pytest.mark.order(1)  # LOX n°1
def test_add_list_doctors_empty_list(client):
    """
    Objectif: Test the /add_list_doctors endpoint when an empty list of doctors is provided in the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request with an empty list of doctors
    response = client.post('/add_list_doctors', json={'doctors': []})
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert that the response contains the error message
    assert b'A non-empty list of doctors is required' in response.data

# Test case where a required field is missing in one of the doctors
@pytest.mark.order(1)  # LOX n°1
def test_add_list_doctors_missing_field(client):
    """
    Objectif: Test the /add_list_doctors endpoint when one or more doctors in the list are missing required fields.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request with missing fields in the doctors' list
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["missing_field_rpps"],
            config.dict_doctor_to_add["missing_field_region"]
        ]
    })
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert that the response contains the error message
    assert b'All fields are required for each doctor' in response.data

# Test case where the 'doctors' parameter is not a list
@pytest.mark.order(1)  # LOX n°1
def test_add_list_doctors_not_a_list(client):
    """
    Objectif: Test the /add_list_doctors endpoint when the 'doctors' parameter is not a list type.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request with 'doctors' not being a list (None in this case)
    response = client.post('/add_list_doctors', json={'doctors': None})
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert that the response contains the error message
    assert b'A non-empty list of doctors is required' in response.data

# Test case where only a single doctor is added, but it is in a list
@pytest.mark.order(1)  # LOX n°1
def test_add_list_doctors_single_doctor(client):
    """
    Objectif: Test the /add_list_doctors endpoint when a single doctor is provided in a list format.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request with a single doctor in the list
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["add_success_1"]
        ]
    })
    # Assert that the response status code is 201 (Created)
    assert response.status_code == 201
    # Assert that the response contains the success message
    assert b'Doctors added successfully' in response.data

# Test case to simulate a database connection error while adding a list of doctors
@pytest.mark.order(1)  # LOX n°1
@patch('routes.add.add_list_doctors.get_connection', side_effect=Exception("Database connection failed"))
def test_add_list_doctors_db_error(mock_get_connection, client):
    """
    Objectif: Test the /add_list_doctors endpoint when a database connection error occurs during the batch doctor addition process.

    Parameters:
        - mock_get_connection: Mock object that simulates the database connection function and raises an exception. (Mock)
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a POST request to add a list of doctors, which will trigger a DB error
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["add_success_1"]
        ]
    })
    # Assert that the response status code is 500 (Internal Server Error)
    assert response.status_code == 500
    # Assert that the response contains the database error message
    assert b'Database connection failed' in response.data
