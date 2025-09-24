import pytest

# Test case for missing parameters in get_directions request
@pytest.mark.order(1)  # LOX n°4
def test_missing_params(client):
    """
    Objectif: Test the /get_direction endpoint when required parameters (origin and destination) are missing.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    resp = client.get('/get_direction')
    assert resp.status_code == 400
    assert b'Missing origin or destination' in resp.data

@pytest.mark.order(1)  # LOX n°4
def test_successful_directions(client, mocker):
    """
    Objectif: Test the /get_direction endpoint for successful retrieval of directions from the OpenRouteService API.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - mocker: Pytest fixture used to mock functions and attributes during testing. (MockerFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
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
    Objectif: Test the /get_direction endpoint when the OpenRouteService API key is missing or not configured.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - mocker: Pytest fixture used to mock functions and attributes during testing. (MockerFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    mocker.patch('routes.get_directions.ORS_API_KEY', None)
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 500
    assert b'Missing OpenRouteService API key' in resp.data

@pytest.mark.order(1)  # LOX n°4
def test_invalid_coordinates(client, mocker):
    """
    Objectif: Test the /get_direction endpoint when invalid coordinate format is provided in the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - mocker: Pytest fixture used to mock functions and attributes during testing. (MockerFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    mocker.patch.dict('os.environ', {'OPENROUTESERVICE_API_KEY': 'dummy'})
    resp = client.get('/get_direction?origin=bad,coords&destination=3,4&mode=driving')
    assert resp.status_code == 400
    assert b'Invalid coordinates' in resp.data

@pytest.mark.order(1)  # LOX n°4
def test_ors_non_200_status(client, mocker):
    """
    Objectif: Test the /get_direction endpoint when the OpenRouteService API returns a non-200 status code.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - mocker: Pytest fixture used to mock functions and attributes during testing. (MockerFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
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
    Objectif: Test the /get_direction endpoint when an exception occurs during the OpenRouteService API call.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - mocker: Pytest fixture used to mock functions and attributes during testing. (MockerFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    mocker.patch('requests.post', side_effect=Exception('API error'))
    mocker.patch.dict('os.environ', {'OPENROUTESERVICE_API_KEY': 'dummy'})


    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 500
    assert b'API error' in resp.data

    assert b'API error' in resp.data
