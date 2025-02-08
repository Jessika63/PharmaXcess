
import pytest
import config
from unittest.mock import patch

# Test case for successfully removing a doctor
@pytest.mark.order(3) # LOX n°1
def test_remove_doctor_success(client):
    # Perform a DELETE request to the /remove_doctor route with a doctor's information
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_to_add["add_success_1"]
    )

    # Check that the response status code is 200 and the success message is present
    assert response.status_code == 200
    assert b'Doctor removed successfully' in response.data


# Test case for trying to remove a doctor that doesn't exist
@pytest.mark.order(3) # LOX n°1
def test_remove_doctor_not_found(client):
    # Perform a DELETE request with information of a doctor not in the list
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_not_to_add["not_added_with_first_name"]
    )

    # Check that the response status code is 404 and the error message is correct
    assert response.status_code == 404
    assert b'Doctor not found' in response.data


# Test case for missing required parameters when trying to remove a doctor
@pytest.mark.order(3) # LOX n°1
def test_remove_doctor_missing_params(client):
    # Perform a DELETE request with missing parameters in the doctor's information
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_to_add["missing_field_first_name"]
    )

    # Check that the response status code is 400 and the error message is correct
    assert response.status_code == 400
    assert b"All parameters 'first_name', 'last_name', 'rpps', 'sector', and 'region' are required" in response.data


# Test case for a database connection error when trying to remove a doctor
@pytest.mark.order(3) # LOX n°1
@patch('routes.remove_doctor.get_connection', side_effect=Exception("Database connection failed"))
def test_remove_doctor_db_error(mock_get_connection, client):
    # Perform a DELETE request and simulate a database connection failure
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_to_add["add_success_1"]
    )

    # Check that the response status code is 500 and the database error message is present
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
