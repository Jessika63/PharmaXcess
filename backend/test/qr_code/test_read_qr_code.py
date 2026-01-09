import pytest
import json
from unittest.mock import patch, mock_open, MagicMock, call
import os
import tempfile
import io
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import requests
import subprocess
import sys

# Import the module instead of individual functions
import scripts.qrcode.qrCodeLect as qrCodeLect

# Test data
TEST_ENCRYPTED_DATA = "encrypted_test_data"
TEST_DECRYPTED_DATA = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

# Ajouter ce patch global pour gérer les imports
@pytest.fixture(autouse=True)
def mock_imports():
    """Mock the relative imports for testing"""
    # qrCodeGen is imported in conftest or scripts, we ensure it's mocked
    with patch.dict('sys.modules', {'qrCodeGen': MagicMock()}):
        # qrCodeLect uses os.getenv ("SECRET_QR_ENCRYPTION_KEY")
        # We can patch os.environ in the tests or here if needed globally for this file
        with patch.dict(os.environ, {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}):
            yield


@pytest.fixture
def mock_env_file():
    """Create a mock .env file for testing"""
    env_content = "SECRET_QR_ENCRYPTION_KEY=test_key_123456789012345678901234567890"
    with patch("builtins.open", mock_open(read_data=env_content)):
        with patch("os.path.exists", return_value=True):
            yield


@pytest.mark.order(2) # LOX n°6
def test_read_prescription_qr_success(client):
    """
    Test successful QR code reading and decryption
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name

    try:
        with patch('scripts.qrcode.qrCodeLect.read_qr_code') as mock_read:
            mock_read.return_value = (True, json.dumps({
                "doctor": {"name": "Dr. Smith"},
                "patient": {"name": "John Doe"},
                "medications": ["Med1", "Med2"]
            }))
            # mock_read.return_value = (True, decrypted_content)  # Tuple avec success
            with open(tmp_path, 'rb') as f:
                response = client.post(
                    '/read_prescription_qr',
                    data={
                        'image': (
                            f,
                            'test.png'
                        )
                    },
                    content_type='multipart/form-data'
                )

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "prescription" in data
            assert data["prescription"]["doctor"]["name"] == "Dr. Smith"
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@pytest.mark.order(2) # LOX n°6
def test_read_prescription_qr_no_file(client):
    """
    Test QR reading with no file provided
    """
    response = client.post('/read_prescription_qr')

    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Aucun fichier image fourni" in data["error"]

@pytest.mark.order(2) # LOX n°6
def test_read_prescription_qr_no_file_selected(client):
    """
    Test QR reading with empty filename
    """
    response = client.post(
        '/read_prescription_qr',
        data={
            'image': (
                io.BytesIO(b''),
                ''
            )
        },
        content_type='multipart/form-data'
    )

    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Aucun fichier sélectionné" in data["error"]

@pytest.mark.order(2) # LOX n°6
def test_read_prescription_qr_no_qr_detected(client):
    """
    Test QR reading when no QR code is detected in image
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name

    try:
        with patch('scripts.qrcode.qrCodeLect.read_qr_code') as mock_read:
            mock_read.return_value = (False, "No QR code detected")

            with open(tmp_path, 'rb') as f:
                response = client.post('/read_prescription_qr',
                                    data={'image': (f, 'test.png')},
                                    content_type='multipart/form-data')

            assert response.status_code == 400
            data = json.loads(response.data)
            assert "No QR code detected" in data["error"]
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@pytest.mark.order(2) # LOX n°6
def test_read_prescription_qr_decryption_error(client):
    """
    Test QR reading when decryption fails
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name

    try:
        with patch('scripts.qrcode.qrCodeLect.read_qr_code') as mock_read:
            mock_read.side_effect = Exception("Decryption error")

            with open(tmp_path, 'rb') as f:
                response = client.post(
                    '/read_prescription_qr',
                    data={
                        'image': (
                            f,
                            'test.png'
                        )
                    },
                    content_type='multipart/form-data'
                )

            assert response.status_code == 500
            data = json.loads(response.data)
            assert "error" in data
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
