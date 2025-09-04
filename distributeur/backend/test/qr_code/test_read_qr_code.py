import pytest
import json
from unittest.mock import patch, mock_open, MagicMock
import os
import tempfile
import io
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import requests

# Import the functions to test
from scripts.qrcode.qrCodeLect import (
    decrypt_data,
    read_qr_code,
    verify_doctor
)

@pytest.mark.order(2)
def test_read_prescription_qr_success(client):
    """
    Test successful QR code reading and decryption
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name
    
    try:
        with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
            # Mock decrypted content
            decrypted_content = json.dumps({
                "doctor": {"name": "Dr. Smith"},
                "patient": {"name": "John Doe"},
                "medications": ["Med1", "Med2"]
            })
            mock_read.return_value = decrypted_content
            
            with open(tmp_path, 'rb') as f:
                response = client.post('/read_prescription_qr', 
                                    data={'image': (f, 'test.png')},
                                    content_type='multipart/form-data')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "prescription" in data
            assert data["prescription"]["doctor"]["name"] == "Dr. Smith"
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@pytest.mark.order(2)
def test_read_prescription_qr_no_file(client):
    """
    Test QR reading with no file provided
    """
    response = client.post('/read_prescription_qr')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Aucun fichier image fourni" in data["error"]

@pytest.mark.order(2)
def test_read_prescription_qr_no_file_selected(client):
    """
    Test QR reading with empty filename
    """
    response = client.post('/read_prescription_qr', 
                         data={'image': (io.BytesIO(b''), '')},
                         content_type='multipart/form-data')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Aucun fichier sélectionné" in data["error"]

@pytest.mark.order(2)
def test_read_prescription_qr_no_qr_detected(client):
    """
    Test QR reading when no QR code is detected in image
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name
    
    try:
        with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
            mock_read.return_value = None
            
            with open(tmp_path, 'rb') as f:
                response = client.post('/read_prescription_qr', 
                                    data={'image': (f, 'test.png')},
                                    content_type='multipart/form-data')
            
            assert response.status_code == 404
            data = json.loads(response.data)
            assert "Aucun QR Code valide" in data["error"]
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@pytest.mark.order(2)
def test_read_prescription_qr_decryption_error(client):
    """
    Test QR reading when decryption fails
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name
    
    try:
        with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
            mock_read.side_effect = Exception("Decryption error")
            
            with open(tmp_path, 'rb') as f:
                response = client.post('/read_prescription_qr', 
                                    data={'image': (f, 'test.png')},
                                    content_type='multipart/form-data')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert "error" in data
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@pytest.mark.order(2)
def test_read_prescription_qr_invalid_json(client):
    """
    Test QR reading when decrypted content is not valid JSON
    """
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'fake image data')
        tmp_path = tmp_file.name
    
    try:
        with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
            mock_read.return_value = "invalid json"
            
            with open(tmp_path, 'rb') as f:
                response = client.post('/read_prescription_qr', 
                                    data={'image': (f, 'test.png')},
                                    content_type='multipart/form-data')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert "error" in data
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
            
# Test data
TEST_ENCRYPTED_DATA = "encrypted_test_data"
TEST_DECRYPTED_DATA = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

@pytest.fixture
def mock_env_file():
    """Create a mock .env file for testing"""
    env_content = "SECRET_QR_ENCRYPTION_KEY=test_key_123456789012345678901234567890"
    with patch("builtins.open", mock_open(read_data=env_content)):
        with patch("os.path.exists", return_value=True):
            yield

def test_decrypt_data():
    """Test data decryption with AES"""
    # First, encrypt some test data
    test_data = "Test data to decrypt"
    key = b'test_key_12345678'  # 16 bytes (exactly)
    
    # Encrypt the data
    cipher = AES.new(key, AES.MODE_ECB)
    padded_data = pad(test_data.encode(), AES.block_size)
    encrypted_data = cipher.encrypt(padded_data)
    encrypted_b64 = base64.b64encode(encrypted_data).decode()
    
    # Now decrypt it
    decrypted = decrypt_data(encrypted_b64, key)
    
    # Should return the original data
    assert decrypted == test_data

def test_decrypt_data_invalid():
    """Test decryption with invalid data"""
    with pytest.raises(Exception):
        decrypt_data("invalid_data", b'test_key_12345678')

def test_read_qr_code_success(mock_env_file):
    """Test successful QR code reading and decryption"""
    # Mock all external dependencies
    with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:
        
        # Setup mocks
        mock_image = MagicMock()
        mock_imread.return_value = mock_image
        
        # Mock QR code detection
        mock_qr_code = MagicMock()
        mock_qr_code.data = b'encrypted_test_data'
        mock_decode.return_value = [mock_qr_code]
        
        # Mock environment file loading
        mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}
        
        # Mock decryption
        with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
            mock_decrypt.return_value = TEST_DECRYPTED_DATA
            
            # Call the function
            result = read_qr_code("test_image.png")
            
            # Should return decrypted data
            assert result == TEST_DECRYPTED_DATA
            
            # Verify dependencies were called
            mock_imread.assert_called_once_with("test_image.png")
            mock_decode.assert_called_once_with(mock_image)
            mock_load_env.assert_called_once_with(".env")
            mock_decrypt.assert_called_once()

def test_read_qr_code_image_not_found():
    """Test QR code reading when image file doesn't exist"""
    with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread:
        mock_imread.return_value = None
        
        result = read_qr_code("nonexistent.png")
        
        # Should return None
        assert result is None

def test_read_qr_code_no_qr_detected():
    """Test QR code reading when no QR code is found in image"""
    with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode:
        
        mock_image = MagicMock()
        mock_imread.return_value = mock_image
        mock_decode.return_value = []  # No QR codes detected
        
        result = read_qr_code("test_image.png")
        
        # Should return None
        assert result is None

def test_read_qr_code_decryption_error(mock_env_file):
    """Test QR code reading when decryption fails"""
    with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:
        
        # Setup mocks
        mock_image = MagicMock()
        mock_imread.return_value = mock_image
        
        # Mock QR code detection
        mock_qr_code = MagicMock()
        mock_qr_code.data = b'encrypted_test_data'
        mock_decode.return_value = [mock_qr_code]
        
        # Mock environment file loading
        mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}
        
        # Mock decryption to raise an exception
        with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
            mock_decrypt.side_effect = Exception("Decryption error")
            
            result = read_qr_code("test_image.png")
            
            # Should return None due to decryption error
            assert result is None

def test_verify_doctor_success():
    """Test successful doctor verification"""
    qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'
    
    with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
        # Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"doctor": {"id": 1, "name": "John Doe"}}
        mock_get.return_value = mock_response
        
        # This should not raise an exception
        verify_doctor(qr_content)
        
        # Verify API was called with correct parameters
        mock_get.assert_called_once_with("http://localhost:5000/find_doctor_by_name?first_name=John&last_name=Doe")

def test_verify_doctor_missing_info():
    """Test doctor verification with missing information"""
    qr_content = '{"doctor": {}}'  # Missing first_name and last_name
    
    # This should not raise an exception but should print a message
    verify_doctor(qr_content)

def test_verify_doctor_api_error():
    """Test doctor verification with API error"""
    qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'
    
    with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
        # Mock API error
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Not found"
        mock_get.return_value = mock_response
        
        # This should not raise an exception but should print an error message
        verify_doctor(qr_content)

def test_verify_doctor_connection_error():
    """Test doctor verification with connection error"""
    qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'
    
    with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
        # Mock connection error
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection error")
        
        # This should not raise an exception but should print an error message
        verify_doctor(qr_content)

def test_verify_doctor_invalid_json():
    """Test doctor verification with invalid JSON"""
    qr_content = "invalid json"
    
    # This should not raise an exception but should print an error message
    verify_doctor(qr_content)

# Tests for the main execution block
def test_main_execution(monkeypatch):
    """Test the main execution when script is run directly"""
    # Mock sys.argv to simulate command line arguments
    with patch("sys.argv", ["qrCodeLect.py", "test_image.png"]), \
         patch("scripts.qrcode.qrCodeLect.read_qr_code") as mock_read, \
         patch("scripts.qrcode.qrCodeLect.verify_doctor") as mock_verify:
        
        # Mock successful QR code reading
        mock_read.return_value = TEST_DECRYPTED_DATA
        
        # Execute the main block by importing the module
        import scripts.qrcode.qrCodeLect
        
        # Verify functions were called
        mock_read.assert_called_once_with("test_image.png")
        mock_verify.assert_called_once_with(TEST_DECRYPTED_DATA)

def test_main_execution_no_args(capsys):
    """Test the main execution with no arguments"""
    # Mock sys.argv to simulate no arguments
    with patch("sys.argv", ["qrCodeLect.py"]):
        # Execute the main block and catch SystemExit
        with pytest.raises(SystemExit):
            import scripts.qrcode.qrCodeLect
        
        # Verify error message was printed
        captured = capsys.readouterr()
        assert "Usage: python3 code.py <path_to_qrcode>" in captured.out

def test_main_execution_no_qr_content():
    """Test the main execution when no QR content is found"""
    # Mock sys.argv to simulate command line arguments
    with patch("sys.argv", ["qrCodeLect.py", "test_image.png"]), \
         patch("scripts.qrcode.qrCodeLect.read_qr_code") as mock_read, \
         patch("scripts.qrcode.qrCodeLect.verify_doctor") as mock_verify:
        
        # Mock no QR content found
        mock_read.return_value = None
        
        # Execute the main block by importing the module
        import scripts.qrcode.qrCodeLect
        
        # Verify functions were called but verify_doctor was not
        mock_read.assert_called_once_with("test_image.png")
        mock_verify.assert_not_called()
