
import pytest
import config
from unittest.mock import patch

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_frpp_success(client):
    response = client.get('/find_doctor_by_frpp', query_string={
        'frpp': config.dict_doctor_to_add["add_success_1"]["frpp"]
    })
    assert response.status_code == 200
    data = response.get_json()  # Récupérer les données JSON sous forme de dictionnaire
    assert data['exists'] is True  # Vérifier que "exists" est bien True

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_frpp_not_found(client):
    response = client.get('/find_doctor_by_frpp', query_string={
        'frpp': config.frpp_not_added
    })
    assert response.status_code == 200
    data = response.get_json()  # Récupérer les données JSON sous forme de dictionnaire
    assert data['exists'] is False  # Vérifier que "exists" est bien False

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_frpp_missing_param(client):
    response = client.get('/find_doctor_by_frpp')
    assert response.status_code == 400
    assert b'\'frpp\' parameter is required' in response.data

@pytest.mark.order(2)  # LOX n°1
@patch('routes.find.find_doctor_by_frpp.get_connection', side_effect=Exception("Database connection failed"))
def test_find_doctor_by_frpp_db_error(mock_get_connection, client):
    response = client.get('/find_doctor_by_frpp', query_string={
        'frpp': config.dict_doctor_to_add["add_success_1"]["frpp"]
    })
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
