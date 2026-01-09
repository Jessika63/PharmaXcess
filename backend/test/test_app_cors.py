import pytest
import json
import os
from unittest.mock import patch

# Test du health check endpoint
@pytest.mark.order(1)  # LOX n°1
def test_home_endpoint(client):
    """
    Objectif: Test the / endpoint to verify the backend health check returns the expected status message.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.get('/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Backend is up and running!'

# Tests pour /register-origin
@pytest.mark.order(1)  # LOX n°1
def test_register_origin_success(client):
    """
    Objectif: Test the /register-origin endpoint for successfully registering a new origin with a valid secret key.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Mock file operations to prevent actual file writes
    mock_origins = set()
    
    def mock_save(origins):
        nonlocal mock_origins
        mock_origins = origins.copy()
    
    with patch('app.save_allowed_origins', side_effect=mock_save):
        with patch('app.allowed_origins', mock_origins):
            response = client.post('/register-origin',
                headers={
                    'X-Secret-Key': 'test_secret_key_default',
                    'Origin': 'https://example.com'
                },
                json={}
            )
            
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Origin registered successfully'
    assert data['origin'] == 'https://example.com'

@pytest.mark.order(1)  # LOX n°1
def test_register_origin_unauthorized_invalid_key(client):
    """
    Objectif: Test the /register-origin endpoint when an invalid secret key is provided.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.post('/register-origin',
        headers={
            'X-Secret-Key': 'wrong_key',
            'Origin': 'https://example.com'
        },
        json={}
    )
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'Unauthorized' in data['error']

@pytest.mark.order(1)  # LOX n°1
def test_register_origin_unauthorized_no_key(client):
    """
    Objectif: Test the /register-origin endpoint when no secret key is provided in the headers.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.post('/register-origin',
        headers={'Origin': 'https://example.com'},
        json={}
    )
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'Unauthorized' in data['error']

@pytest.mark.order(1)  # LOX n°1
def test_register_origin_no_origin_header(client):
    """
    Objectif: Test the /register-origin endpoint when the Origin header is missing from the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Need to provide valid secret key to bypass decorator and test the Origin header check
    response = client.post('/register-origin',
        headers={'X-Secret-Key': 'test_secret_key_default'},
        json={}
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Origin header required' in data['error']

# Tests pour /list-origins
@pytest.mark.order(1)  # LOX n°1
def test_list_origins_success(client):
    """
    Objectif: Test the /list-origins endpoint for successfully listing all allowed origins with a valid secret key.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Patch allowed_origins at the module level
    test_origins = {'https://example.com', 'https://test.com'}
    with patch('app.allowed_origins', test_origins):
        response = client.get('/list-origins',
            headers={'X-Secret-Key': 'test_secret_key_default'}
        )

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'allowed_origins' in data
    assert data['count'] == 2
    assert 'https://example.com' in data['allowed_origins']
    assert 'https://test.com' in data['allowed_origins']

@pytest.mark.order(1)  # LOX n°1
def test_list_origins_unauthorized(client):
    """
    Objectif: Test the /list-origins endpoint when no valid secret key is provided.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.get('/list-origins',
        headers={'X-Secret-Key': 'wrong_key'}
    )
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'Unauthorized' in data['error']

# Tests pour /remove-origin
@pytest.mark.order(1)  # LOX n°1
def test_remove_origin_success(client):
    """
    Objectif: Test the /remove-origin endpoint for successfully removing an existing origin.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Create a mutable set for testing
    test_origins = {'https://example.com', 'https://test.com'}

    def mock_save(origins):
        pass

    with patch('app.allowed_origins', test_origins):
        with patch('app.save_allowed_origins', side_effect=mock_save):
            response = client.post('/remove-origin',
                headers={'X-Secret-Key': 'test_secret_key_default'},
                json={'origin': 'https://example.com'}
            )

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Origin removed successfully'
    assert data['origin'] == 'https://example.com'

@pytest.mark.order(1)  # LOX n°1
def test_remove_origin_not_found(client):
    """
    Objectif: Test the /remove-origin endpoint when attempting to remove a non-existent origin.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    test_origins = {'https://test.com'}
    with patch('app.allowed_origins', test_origins):
        response = client.post('/remove-origin',
            headers={'X-Secret-Key': 'test_secret_key_default'},
            json={'origin': 'https://nonexistent.com'}
        )
        
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'Origin not found' in data['error']

@pytest.mark.order(1)  # LOX n°1
def test_remove_origin_unauthorized(client):
    """
    Objectif: Test the /remove-origin endpoint when no valid secret key is provided.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.post('/remove-origin',
        headers={'X-Secret-Key': 'wrong_key'},
        json={'origin': 'https://example.com'}
    )
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'Unauthorized' in data['error']

@pytest.mark.order(1)  # LOX n°1
def test_remove_origin_missing_origin_field(client):
    """
    Objectif: Test the /remove-origin endpoint when the 'origin' field is missing from the request body.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.post('/remove-origin',
        headers={'X-Secret-Key': 'test_secret_key_default'},
        json={}
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Origin required' in data['error']

# Tests pour le middleware CORS
@pytest.mark.order(1)  # LOX n°1
def test_cors_middleware_allowed_origin(client):
    """
    Objectif: Test the CORS middleware to verify that requests from allowed origins are accepted.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    test_origins = {'https://example.com'}
    with patch('app.allowed_origins', test_origins):
        response = client.get('/',
            headers={'Origin': 'https://example.com'}
        )
        
    assert response.status_code == 200
    assert response.headers.get('Access-Control-Allow-Origin') == 'https://example.com'

@pytest.mark.order(1)  # LOX n°1
def test_cors_middleware_forbidden_origin(client):
    """
    Objectif: Test the CORS middleware to verify that requests from non-allowed origins are rejected.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    test_origins = {'https://example.com'}
    with patch('app.allowed_origins', test_origins):
        response = client.get('/',
            headers={'Origin': 'https://forbidden.com'}
        )
        
    assert response.status_code == 403
    data = json.loads(response.data)
    assert 'Origin not allowed' in data['error']

@pytest.mark.order(1)  # LOX n°1
def test_cors_middleware_options_request(client):
    """
    Objectif: Test the CORS middleware to verify that OPTIONS (preflight) requests are always accepted.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.options('/',
        headers={'Origin': 'https://any-origin.com'}
    )
    # OPTIONS requests should be handled by after_request and return appropriate CORS headers
    assert response.headers.get('Access-Control-Allow-Origin') is not None
    assert 'Access-Control-Allow-Methods' in response.headers
