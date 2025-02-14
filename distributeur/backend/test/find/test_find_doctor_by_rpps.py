
import pytest
import config
from unittest.mock import patch

# Test case to successfully find a doctor by their RPPS code
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_rpps_success(client):
    # Sending a GET request with a valid RPPS code to find a doctor
    response = client.get('/find_doctor_by_rpps', query_string={
        'rpps': config.dict_doctor_to_add["add_success_1"]["rpps"]
    })
    # Assert that the response status code is 200 (OK)
    assert response.status_code == 200
    # Retrieve the response data as JSON dictionary
    data = response.get_json()
    # Assert that the "exists" field is True, indicating the doctor was found
    assert data['exists'] is True

# Test case where the doctor is not found by their RPPS code
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_rpps_not_found(client):
    # Sending a GET request with an invalid RPPS code for a doctor that doesn't exist
    response = client.get('/find_doctor_by_rpps', query_string={
        'rpps': config.rpps_not_added
    })
    # Assert that the response status code is 200 (OK)
    assert response.status_code == 200
    # Retrieve the response data as JSON dictionary
    data = response.get_json()
    # Assert that the "exists" field is False, indicating the doctor was not found
    assert data['exists'] is False

# Test case when the RPPS parameter is missing in the query
@pytest.mark.order(2)  # LOX n°1
def test_find_doctor_by_rpps_missing_param(client):
    # Sending a GET request without the required RPPS parameter
    response = client.get('/find_doctor_by_rpps')
    # Assert that the response status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert that the response contains the error message about the missing 'rpps' parameter
    assert b'\'rpps\' parameter is required' in response.data

# Test case to simulate a database connection error while finding a doctor by RPPS code
@pytest.mark.order(2)  # LOX n°1
@patch('routes.find.find_doctor_by_rpps.get_connection', side_effect=Exception("Database connection failed"))
def test_find_doctor_by_rpps_db_error(mock_get_connection, client):
    # Sending a GET request to find a doctor by RPPS, which will trigger a DB error
    response = client.get('/find_doctor_by_rpps', query_string={
        'rpps': config.dict_doctor_to_add["add_success_1"]["rpps"]
    })
    # Assert that the response status code is 500 (Internal Server Error)
    assert response.status_code == 500
    # Assert that the response contains the database error message
    assert b'Database connection failed' in response.data
