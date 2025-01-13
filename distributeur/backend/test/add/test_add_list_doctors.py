
import pytest
import config
from unittest.mock import patch

@pytest.mark.order(1) # LOX n°1
def test_add_list_doctors_success(client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["add_success_1"],
            config.dict_doctor_to_add["add_success_2"]
        ]
    })
    assert response.status_code == 201
    assert b'Doctors added successfully' in response.data

@pytest.mark.order(1) # LOX n°1
def test_add_list_doctors_empty_list(client):
    response = client.post('/add_list_doctors', json={'doctors': []})
    assert response.status_code == 400
    assert b'A list of doctors is required' in response.data

@pytest.mark.order(1) # LOX n°1
def test_add_list_doctors_missing_field(client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["missing_field_rpps"],
            config.dict_doctor_to_add["missing_field_region"]
        ]
    })
    assert response.status_code == 400
    assert b'All fields are required for each doctor' in response.data

@pytest.mark.order(1) # LOX n°1
def test_add_list_doctors_not_a_list(client):
    response = client.post('/add_list_doctors', json={'doctors': None})
    assert response.status_code == 400
    assert b'A list of doctors is required' in response.data

@pytest.mark.order(1) # LOX n°1
def test_add_list_doctors_single_doctor(client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["add_success_1"]
        ]
    })
    assert response.status_code == 201
    assert b'Doctors added successfully' in response.data

@pytest.mark.order(1) # LOX n°1
@patch('routes.add.add_list_doctors.get_connection', side_effect=Exception("Database connection failed"))
def test_add_list_doctors_db_error(mock_get_connection, client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            config.dict_doctor_to_add["add_success_1"]
        ]
    })
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
