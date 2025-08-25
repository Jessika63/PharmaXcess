
import pytest
import config
from unittest.mock import patch

# Test case to successfully find a doctor by their name
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_name_success(client):
    """
    Objectif: Test the /find_doctor_by_name endpoint for successfully retrieving a doctor by their name.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a GET request with valid query parameters to find a doctor by name
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_first_name"]
    )
    # Assert that the response status code is 200 (OK)
    assert response.status_code == 200
    # Assert that the first and last name of the doctor are in the response data
    assert b'Doe' in response.data

# Test case where the doctor is not found by the given name
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_name_not_found(client):
    """
    Objectif: Test the /find_doctor_by_name endpoint when no doctors are found matching the search criteria.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a GET request with query parameters for a doctor that doesn't exist
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_not_to_add["not_added_without_rpps"]
    )
    # Assert that the response status code is 404 (Not Found)
    assert response.status_code == 404
    # Assert that the response contains the 'No doctors found' message
    assert b'No doctors found' in response.data

# Test case when the required parameters are missing in the query
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_name_missing_params(client):
    """
    Objectif: Test the /find_doctor_by_name endpoint when required query parameters are missing.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a GET request with only the 'first_name' parameter (missing 'last_name')
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_last_name"]
    )
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert that the response contains the error message about missing parameters
    assert b'\'last_name\' is required' in response.data

# Test case to simulate a database connection error while finding a doctor by name
@pytest.mark.order(2)  # LOX n°1
@patch('routes.find.find_doctor_by_name.get_connection', side_effect=Exception("Database connection failed"))
def test_find_doctor_by_name_db_error(mock_get_connection, client):
    """
    Objectif: Test the /find_doctor_by_name endpoint when a database connection error occurs during the search process.

    Parameters:
        - mock_get_connection: Mock object that simulates the database connection function and raises an exception. (Mock)
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Sending a GET request to find a doctor by name, which will trigger a DB error
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_rpps"]
    )
    # Assert that the response status code is 500 (Internal Server Error)
    assert response.status_code == 500
    # Assert that the response contains the database error message
    assert b'Database connection failed' in response.data
