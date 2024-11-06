
import pytest

@pytest.mark.order(1)
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

@pytest.mark.order(1)
def test_add_doctor_missing_field(client):
    response = client.post('/add_doctor', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'sector': 'General',
        'region': 'Ile-de-France'
    })
    assert response.status_code == 400  # Bad request
    assert b'All fields are required' in response.data
