import pytest
import os
from cors_config import get_cors_registration_url, get_cors_headers, REGISTER_ORIGIN_ENDPOINT

def test_get_cors_registration_url(monkeypatch):
    """
    Objectif: Test that the CORS registration URL is constructed correctly.
    """
    # Case 1: Default BACKEND_URL
    # We need to reload or patch the module level variable if it was already imported, 
    # but since it reads env var at top level, it's tricky. 
    # However, get_cors_registration_url uses BACKEND_URL global.
    
    # Let's verify the default behavior or mocked behavior.
    # Note: 'cors_config' is likely already imported by app.
    
    from cors_config import BACKEND_URL
    expected_url = f"{BACKEND_URL}{REGISTER_ORIGIN_ENDPOINT}"
    assert get_cors_registration_url() == expected_url

def test_get_cors_headers(monkeypatch):
    """
    Objectif: Test that CORS headers are returned correctly including the secret key.
    """
    test_key = "super_secret_test_key"
    monkeypatch.setenv('CORS_SECRET_KEY', test_key)
    
    # We need to patch the module-level variable because it's loaded at import time
    import cors_config
    monkeypatch.setattr(cors_config, 'CORS_SECRET_KEY', test_key)
    
    headers = get_cors_headers()
    assert headers['X-Secret-Key'] == test_key
    assert headers['Content-Type'] == 'application/json'
