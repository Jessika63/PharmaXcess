

import pytest
import config
from unittest.mock import patch

@pytest.mark.order(3) # LOX n°1
def test_remove_doctor_success(client):
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_to_add["add_success_1"]
    )
    assert response.status_code == 200
    assert b'Doctor removed successfully' in response.data

@pytest.mark.order(3) # LOX n°1
def test_remove_doctor_not_found(client):
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_not_to_add["not_added_with_first_name"]
    )
    assert response.status_code == 404
    assert b'Doctor not found' in response.data

@pytest.mark.order(3) # LOX n°1
def test_remove_doctor_missing_params(client):
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_to_add["missing_field_first_name"]
    )
    assert response.status_code == 400
    assert b"All parameters 'first_name', 'last_name', 'frpp', 'sector', and 'region' are required" in response.data

@pytest.mark.order(3) # LOX n°1
@patch('routes.remove_doctor.get_connection', side_effect=Exception("Database connection failed"))
def test_remove_doctor_db_error(mock_get_connection, client):
    response = client.delete('/remove_doctor',
        query_string=config.dict_doctor_to_add["add_success_1"]
    )
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
