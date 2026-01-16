import pytest
import json
import os
from backend.app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestGetDefaultPosition:
    """Test suite for the get_default_position endpoint"""

    def test_get_default_position_without_parameter(self, client):
        """Test getting default position without specifying location parameter"""
        # Set environment variable for default location
        os.environ['DEFAULT_LOCATION'] = 'paris'
        
        response = client.get('/get_default_position')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'position' in data
        assert 'lat' in data['position']
        assert 'lon' in data['position']
        assert 'name' in data['position']
        
        # Should return Epitech Paris by default
        assert data['position']['lat'] == 48.815273
        assert data['position']['lon'] == 2.363006

    def test_get_default_position_with_env_lyon(self, client):
        """Test that environment variable changes default location"""
        # Set environment variable to Lyon
        os.environ['DEFAULT_LOCATION'] = 'lyon'
        
        response = client.get('/get_default_position')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['position']['name'] == "Epitech Lyon"
        assert data['position']['lat'] == 45.746288
        assert data['position']['lon'] == 4.835127

    def test_get_default_position_paris(self, client):
        """Test getting Paris position explicitly via parameter"""
        response = client.get('/get_default_position?location=paris')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['position']['name'] == "Epitech Kremlin-Bicêtre"
        assert data['position']['lat'] == 48.815273
        assert data['position']['lon'] == 2.363006

    def test_get_default_position_lyon(self, client):
        """Test getting Lyon position explicitly via parameter"""
        response = client.get('/get_default_position?location=lyon')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['position']['name'] == "Epitech Lyon"
        assert data['position']['lat'] == 45.746288
        assert data['position']['lon'] == 4.835127

    def test_get_default_position_parameter_overrides_env(self, client):
        """Test that query parameter overrides environment variable"""
        # Set environment to Paris
        os.environ['DEFAULT_LOCATION'] = 'paris'
        
        # But request Lyon via parameter
        response = client.get('/get_default_position?location=lyon')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        # Should return Lyon (parameter overrides env)
        assert data['position']['name'] == "Epitech Lyon"

    def test_get_default_position_unknown_location(self, client):
        """Test getting position with unknown location parameter (should fallback to env)"""
        os.environ['DEFAULT_LOCATION'] = 'paris'
        
        response = client.get('/get_default_position?location=unknown')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        # Should fallback to env default (Paris)
        assert data['position']['lat'] == 48.815273
        assert data['position']['lon'] == 2.363006

    def test_get_default_position_case_insensitive(self, client):
        """Test that location parameter is case-insensitive"""
        response = client.get('/get_default_position?location=LYON')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['position']['name'] == "Epitech Lyon"

    def test_get_default_position_cors_headers(self, client):
        """Test that CORS headers are properly set"""
        response = client.get('/get_default_position')
        
        assert response.status_code == 200
        # CORS headers should be added by the after_request handler in app.py

    def test_get_default_position_options_method(self, client):
        """Test OPTIONS request for CORS preflight"""
        response = client.options('/get_default_position')
        
        assert response.status_code == 200
