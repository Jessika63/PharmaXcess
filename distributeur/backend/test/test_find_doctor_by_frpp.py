
def test_find_doctor_by_frpp_success(client):
    response = client.get('/find_doctor_by_frpp', query_string={
        'frpp': '1234567890'
    })
    assert response.status_code == 200
    data = response.get_json()  # Récupérer les données JSON sous forme de dictionnaire
    assert data['exists'] is True  # Vérifier que "exists" est bien True

def test_find_doctor_by_frpp_not_found(client):
    response = client.get('/find_doctor_by_frpp', query_string={
        'frpp': '9876543210'
    })
    assert response.status_code == 200
    data = response.get_json()  # Récupérer les données JSON sous forme de dictionnaire
    assert data['exists'] is False  # Vérifier que "exists" est bien False

def test_find_doctor_by_frpp_missing_param(client):
    response = client.get('/find_doctor_by_frpp')
    assert response.status_code == 400
    assert b'\'frpp\' parameter is required' in response.data
