
import pytest

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_name_success(client):
    response = client.get('/find_doctor_by_name', query_string={
        'first_name': 'John',
        'last_name': 'Doe',
        'sector': 'General',  # Optionnel
        'region': 'Ile-de-France'  # Optionnel
    })
    assert response.status_code == 200
    assert b'John' in response.data
    assert b'Doe' in response.data

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_name_not_found(client):
    response = client.get('/find_doctor_by_name', query_string={
        'first_name': 'Jane',
        'last_name': 'Smith',
        'sector': 'Cardiology',  # Optionnel
        'region': 'Provence-Alpes-Cote d\'Azur'  # Optionnel
    })
    assert response.status_code == 404
    assert b'No doctors found' in response.data

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_name_missing_params(client):
    response = client.get('/find_doctor_by_name', query_string={
        'first_name': 'John'
        # last_name is missing
    })
    assert response.status_code == 400
    assert b'Both \'first_name\' and \'last_name\' are required' in response.data
