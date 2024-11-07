
def test_remove_doctor_success(client):
    response = client.delete('/remove_doctor', query_string={
        'first_name': 'John',
        'last_name': 'Doe',
        'rpps': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    })
    assert response.status_code == 200
    assert b'Doctor removed successfully' in response.data

def test_remove_doctor_not_found(client):
    response = client.delete('/remove_doctor', query_string={
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '9876543210',
        'sector': 'Cardiology',
        'region': 'Provence-Alpes-Cote d\'Azur'
    })
    assert response.status_code == 404
    assert b'Doctor not found' in response.data
