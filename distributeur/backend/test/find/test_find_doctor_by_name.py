
import pytest
import config
from unittest.mock import patch

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_name_success(client):
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_rpps"]
    )
    assert response.status_code == 200
    assert b'John' in response.data
    assert b'Doe' in response.data

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_name_not_found(client):
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_not_to_add["not_added_without_rpps"]
    )
    assert response.status_code == 404
    assert b'No doctors found' in response.data

@pytest.mark.order(2) # LOX n°1
def test_find_doctor_by_name_missing_params(client):
    response = client.get('/find_doctor_by_name', query_string={
        'first_name': config.dict_doctor_to_add["add_success_1"]["first_name"]
        # last_name is missing
    })
    assert response.status_code == 400
    assert b'Both \'first_name\' and \'last_name\' are required' in response.data

@pytest.mark.order(2)  # LOX n°1
@patch('routes.find.find_doctor_by_name.get_connection', side_effect=Exception("Database connection failed"))
def test_find_doctor_by_name_db_error(mock_get_connection, client):
    response = client.get('/find_doctor_by_name',
        query_string=config.dict_doctor_to_add["missing_field_rpps"]
    )
    assert response.status_code == 500
    assert b'Database connection failed' in response.data
