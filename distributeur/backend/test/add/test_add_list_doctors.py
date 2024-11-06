
def test_add_list_doctors_success(client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            {
                'first_name': 'Michael',
                'last_name': 'Jackson',
                'frpp': '066606660',
                'sector': 'General',
                'region': 'Ile-de-France'
            },
            {
                'first_name': 'Jane',
                'last_name': 'Smith',
                'frpp': '1234567890',
                'sector': 'Pediatrics',
                'region': 'Auvergne-Rhône-Alpes'
            }
        ]
    })
    assert response.status_code == 201
    assert b'Doctors added successfully' in response.data

def test_add_list_doctors_empty_list(client):
    response = client.post('/add_list_doctors', json={'doctors': []})
    assert response.status_code == 400
    assert b'A list of doctors is required' in response.data

def test_add_list_doctors_missing_field(client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            {
                'first_name': 'John',
                'last_name': 'Doe',
                'sector': 'General',
                'region': 'Ile-de-France'
            },
            {
                'first_name': 'Jane',
                'last_name': 'Smith',
                'frpp': '9876543210',
                'sector': 'Pediatrics',
            }
        ]
    })
    assert response.status_code == 400
    assert b'All fields are required for each doctor' in response.data

def test_add_list_doctors_not_a_list(client):
    response = client.post('/add_list_doctors', json={'doctors': None})
    assert response.status_code == 400
    assert b'A list of doctors is required' in response.data

def test_add_list_doctors_single_doctor(client):
    response = client.post('/add_list_doctors', json={
        'doctors': [
            {
                'first_name': 'John',
                'last_name': 'Doe',
                'frpp': '1234567890',
                'sector': 'General',
                'region': 'Ile-de-France'
            }
        ]
    })
    assert response.status_code == 201
    assert b'Doctors added successfully' in response.data
