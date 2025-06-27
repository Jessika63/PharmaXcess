import pytest
from unittest.mock import patch
from flask import Flask
from routes.get_directions import get_directions_bp
import os

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(get_directions_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_missing_params(client):
    resp = client.get('/get_direction')
    assert resp.status_code == 400
    assert b'Missing origin or destination' in resp.data

@patch('routes.get_directions.requests.post')
def test_successful_directions(mock_requests_post, client, monkeypatch):
    monkeypatch.setenv('OPENROUTESERVICE_API_KEY', 'dummy')
    mock_requests_post.return_value.status_code = 200
    mock_requests_post.return_value.json.return_value = {'status': 'OK', 'routes': []}
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] == 'OK'
    assert 'routes' in data

def test_missing_api_key(client, monkeypatch):
    monkeypatch.setattr('routes.get_directions.ORS_API_KEY', None)
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 500
    assert b'Missing OpenRouteService API key' in resp.data

def test_invalid_coordinates(client, monkeypatch):
    monkeypatch.setenv('OPENROUTESERVICE_API_KEY', 'dummy')
    resp = client.get('/get_direction?origin=bad,coords&destination=3,4&mode=driving')
    assert resp.status_code == 400
    assert b'Invalid coordinates' in resp.data

@patch('routes.get_directions.requests.post')
def test_ors_non_200_status(mock_requests_post, client, monkeypatch):
    monkeypatch.setenv('OPENROUTESERVICE_API_KEY', 'dummy')
    mock_requests_post.return_value.status_code = 403
    mock_requests_post.return_value.json.return_value = {'error': 'ORS error', 'message': 'Forbidden'}
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 403
    data = resp.get_json()
    assert data['error'] == 'ORS error'
    assert data['error_message'] == 'Forbidden'

@patch('routes.get_directions.requests.post', side_effect=Exception('API error'))
def test_directions_api_error(mock_requests_post, client, monkeypatch):
    monkeypatch.setenv('OPENROUTESERVICE_API_KEY', 'dummy')
    resp = client.get('/get_direction?origin=1,2&destination=3,4&mode=driving')
    assert resp.status_code == 500
    assert b'API error' in resp.data 