import pytest

# Test case for missing parameters in get_directions request
@pytest.mark.order(1)  # LOX n°4
def test_missing_params(client):
    """
    Test case: Missing origin or destination parameters.
    
    - Sends a GET request to /get_direction without required parameters.
    - Expects a 400 Bad Request response with an appropriate error message.
    """
    resp = client.get('/get_direction')
    assert resp.status_code == 400
    assert b'Missing origin or destination' in resp.data

@pytest.mark.order(1)  # LOX n°4
def test_successful_directions(client, mocker):
    """
    Test case: Successful retrieval of directions.
    
    - Mocks the OpenRouteService API response with valid route data.
    - Sends a GET request to /get_direction with valid parameters.
    - Expects a 200 OK response with route information.
    """
    # Mock the requests.post function to return a successful response
    mock_response = mocker.Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'status': 'OK', 'routes': []}
    mocker.patch('requests.post', return_value=mock_response)
    
    # Mock the environment variable
    mocker.patch.dict('os.environ', {'OPENROUTESERVICE_API_KEY': 'dummy'})
    
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] == 'OK'
    assert 'routes' in data

@pytest.mark.order(1)  # LOX n°4
def test_missing_api_key(client, mocker):
    """
    Test case: Missing OpenRouteService API key.
    
    - Mocks the API key as None.
    - Sends a GET request to /get_direction.
    - Expects a 500 Internal Server Error response.
    """
    mocker.patch('routes.get_directions.ORS_API_KEY', None)
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 500
    assert b'Missing OpenRouteService API key' in resp.data

@pytest.mark.order(1)  # LOX n°4
def test_invalid_coordinates(client, mocker):
    """
    Test case: Invalid coordinate format.
    
    - Sends a GET request with invalid coordinate format.
    - Expects a 400 Bad Request response with an error message.
    """
    mocker.patch.dict('os.environ', {'OPENROUTESERVICE_API_KEY': 'dummy'})
    resp = client.get('/get_direction?origin=bad,coords&destination=3,4&mode=driving')
    assert resp.status_code == 400
    assert b'Invalid coordinates' in resp.data

@pytest.mark.order(1)  # LOX n°4
def test_ors_non_200_status(client, mocker):
    """
    Test case: OpenRouteService API returns non-200 status.
    
    - Mocks the OpenRouteService API to return a 403 Forbidden response.
    - Sends a GET request to /get_direction.
    - Expects the same status code and error message from the API.
    """
    # Mock the requests.post function to return an error response
    mock_response = mocker.Mock()
    mock_response.status_code = 403
    mock_response.json.return_value = {'error': 'ORS error', 'message': 'Forbidden'}
    mocker.patch('requests.post', return_value=mock_response)
    
    # Mock the environment variable
    mocker.patch.dict('os.environ', {'OPENROUTESERVICE_API_KEY': 'dummy'})
    
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 403
    data = resp.get_json()
    assert data['error'] == 'ORS error'
    assert data['error_message'] == 'Forbidden'

@pytest.mark.order(1)  # LOX n°4
def test_directions_api_error(client, mocker):
    """
    Test case: Exception during API call.
    
    - Mocks an exception during the requests.post call.
    - Sends a GET request to /get_direction.
    - Expects a 500 Internal Server Error response.
    """
    mocker.patch('requests.post', side_effect=Exception('API error'))
    mocker.patch.dict('os.environ', {'OPENROUTESERVICE_API_KEY': 'dummy'})
    
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 500
    assert b'API error' in resp.data 