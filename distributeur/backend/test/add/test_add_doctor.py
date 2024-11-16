
import pytest
import config
from unittest.mock import patch

@pytest.mark.order(1) # LOX n°1
def test_add_doctor_success(client):
    response = client.post('/add_doctor', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'frpp': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    })
    assert response.status_code == 201
    assert b'Doctor added successfully' in response.data

@pytest.mark.order(1) # LOX n°1
def test_add_doctor_missing_field(client):
    response = client.post('/add_doctor',
        json=config.dict_doctor_to_add["missing_field_frpp"]
    )
    assert response.status_code == 400  # Bad request
    assert b'All fields are required' in response.data

@pytest.mark.order(1) # LOX n°1
@patch('routes.add.add_doctor.get_connection', side_effect=Exception("Database connection failed"))
def test_add_doctor_db_error(mock_get_connection, client):
    response = client.post('/add_doctor',
        json=config.dict_doctor_to_add["add_success_1"]
    )
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
