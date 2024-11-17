import pytest
import config
from unittest.mock import patch

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_rpps_success(client):
    response = client.get('/find_doctor_by_rpps', query_string={
        'rpps': config.dict_doctor_to_add["add_success_1"]["rpps"]
    })
    assert response.status_code == 200
    data = response.get_json()  # Récupérer les données JSON sous forme de dictionnaire
    assert data['exists'] is True  # Vérifier que "exists" est bien True

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_rpps_not_found(client):
    response = client.get('/find_doctor_by_rpps', query_string={
        'rpps': config.rpps_not_added
    })
    assert response.status_code == 200
    data = response.get_json()  # Récupérer les données JSON sous forme de dictionnaire
    assert data['exists'] is False  # Vérifier que "exists" est bien False

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_rpps_missing_param(client):
    response = client.get('/find_doctor_by_rpps')
    assert response.status_code == 400
    assert b'\'rpps\' parameter is required' in response.data

@pytest.mark.order(2)  # LOX n°1
@patch('routes.find.find_doctor_by_rpps.get_connection', side_effect=Exception("Database connection failed"))
def test_find_doctor_by_rpps_db_error(mock_get_connection, client):
    response = client.get('/find_doctor_by_rpps', query_string={
        'rpps': config.dict_doctor_to_add["add_success_1"]["rpps"]
    })
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
