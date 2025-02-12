
import pytest
import config
from unittest.mock import patch

# Test case to successfully find a doctor by their name
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_name_success(client):
    # Sending a GET request with valid query parameters to find a doctor by name
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_rpps"]
    )
    # Assert that the response status code is 200 (OK)
    assert response.status_code == 200
    # Assert that the first and last name of the doctor are in the response data
    assert b'John' in response.data
    assert b'Doe' in response.data

# Test case where the doctor is not found by the given name
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_name_not_found(client):
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
    # Sending a GET request with only the 'first_name' parameter (missing 'last_name')
    response = client.get('/find_doctor_by_name', query_string={
        'first_name': config.dict_doctor_to_add["add_success_1"]["first_name"]
        # last_name is missing
    })
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert that the response contains the error message about missing parameters
    assert b'Both \'first_name\' and \'last_name\' are required' in response.data

# Test case to simulate a database connection error while finding a doctor by name
@pytest.mark.order(2)  # LOX n°1
@patch('routes.find.find_doctor_by_name.get_connection', side_effect=Exception("Database connection failed"))
def test_find_doctor_by_name_db_error(mock_get_connection, client):
    # Sending a GET request to find a doctor by name, which will trigger a DB error
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_rpps"]
    )
    # Assert that the response status code is 500 (Internal Server Error)
    assert response.status_code == 500
    # Assert that the response contains the database error message
    assert b'Database connection failed' in response.data
