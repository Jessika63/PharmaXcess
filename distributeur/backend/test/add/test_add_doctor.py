
import pytest
import config
from unittest.mock import patch

# Test case to successfully add a doctor
@pytest.mark.order(1)  # LOX n°1
def test_add_doctor_success(client):
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
    # Sending a POST request to add a doctor, which will trigger a DB error
    response = client.post('/add_doctor',
        json=config.dict_doctor_to_add["add_success_1"]
    )
    # Assert that the response status code is 500 (Internal Server Error)
    assert response.status_code == 500
    # Assert that the response contains the database error message
    assert b'Database connection failed' in response.data
