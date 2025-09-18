# import pytest
# import json
# from unittest.mock import patch, mock_open, MagicMock, call
# import os
# import tempfile
# import io
# import base64
# from Crypto.Cipher import AES
# from Crypto.Util.Padding import pad, unpad
# import requests
# import subprocess
# import sys

# # Import the module instead of individual functions
# import scripts.qrcode.qrCodeLect as qrCodeLect

# # Test data
# TEST_ENCRYPTED_DATA = "encrypted_test_data"
# TEST_DECRYPTED_DATA = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

# # Ajouter ce patch global pour gérer les imports
# @pytest.fixture(autouse=True)
# def mock_imports():
#     """Mock the relative imports for testing"""
#     with patch.dict('sys.modules', {'qrCodeGen': MagicMock()}):
#         with patch('scripts.qrcode.qrCodeLect.load_env_file') as mock_load_env:
#             mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}
#             yield


# @pytest.fixture
# def mock_env_file():
#     """Create a mock .env file for testing"""
#     env_content = "SECRET_QR_ENCRYPTION_KEY=test_key_123456789012345678901234567890"
#     with patch("builtins.open", mock_open(read_data=env_content)):
#         with patch("os.path.exists", return_value=True):
#             yield


# @pytest.mark.order(2) # LOX n°6
# def test_read_prescription_qr_success(client):
#     """
#     Test successful QR code reading and decryption
#     """
#     # Create a temporary file for testing
#     with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
#         tmp_file.write(b'fake image data')
#         tmp_path = tmp_file.name

#     try:
#         with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
#             mock_read.return_value = (True, json.dumps({
#                 "doctor": {"name": "Dr. Smith"},
#                 "patient": {"name": "John Doe"},
#                 "medications": ["Med1", "Med2"]
#             }))
#             decrypted_content = json.dumps({
#                 "doctor": {"name": "Dr. Smith"},
#                 "patient": {"name": "John Doe"},
#                 "medications": ["Med1", "Med2"]
#             })
#             mock_read.return_value = (True, decrypted_content)  # Tuple avec success
#             with open(tmp_path, 'rb') as f:
#                 response = client.post(
#                     '/read_prescription_qr',
#                     data={
#                         'image': (
#                             f,
#                             'test.png'
#                         )
#                     },
#                     content_type='multipart/form-data'
#                 )

#             assert response.status_code == 200
#             data = json.loads(response.data)
#             assert "prescription" in data
#             assert data["prescription"]["doctor"]["name"] == "Dr. Smith"
#     finally:
#         # Clean up
#         if os.path.exists(tmp_path):
#             os.unlink(tmp_path)

# @pytest.mark.order(2) # LOX n°6
# def test_read_prescription_qr_no_file(client):
#     """
#     Test QR reading with no file provided
#     """
#     response = client.post('/read_prescription_qr')

#     assert response.status_code == 400
#     data = json.loads(response.data)
#     assert "Aucun fichier image fourni" in data["error"]

# @pytest.mark.order(2) # LOX n°6
# def test_read_prescription_qr_no_file_selected(client):
#     """
#     Test QR reading with empty filename
#     """
#     response = client.post(
#         '/read_prescription_qr',
#         data={
#             'image': (
#                 io.BytesIO(b''),
#                 ''
#             )
#         },
#         content_type='multipart/form-data'
#     )

#     assert response.status_code == 400
#     data = json.loads(response.data)
#     assert "Aucun fichier sélectionné" in data["error"]

# @pytest.mark.order(2) # LOX n°6
# def test_read_prescription_qr_no_qr_detected(client):
#     """
#     Test QR reading when no QR code is detected in image
#     """
#     # Create a temporary file for testing
#     with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
#         tmp_file.write(b'fake image data')
#         tmp_path = tmp_file.name

#     try:
#         with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
#             mock_read.return_value = (False, "No QR code detected")

#             with open(tmp_path, 'rb') as f:
#                 response = client.post('/read_prescription_qr',
#                                     data={'image': (f, 'test.png')},
#                                     content_type='multipart/form-data')

#             assert response.status_code == 404
#             data = json.loads(response.data)
#             assert "Aucun QR Code valide" in data["error"]
#     finally:
#         # Clean up
#         if os.path.exists(tmp_path):
#             os.unlink(tmp_path)

# @pytest.mark.order(2) # LOX n°6
# def test_read_prescription_qr_decryption_error(client):
#     """
#     Test QR reading when decryption fails
#     """
#     # Create a temporary file for testing
#     with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
#         tmp_file.write(b'fake image data')
#         tmp_path = tmp_file.name

#     try:
#         with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
#             mock_read.side_effect = Exception("Decryption error")

#             with open(tmp_path, 'rb') as f:
#                 response = client.post(
#                     '/read_prescription_qr',
#                     data={
#                         'image': (
#                             f,
#                             'test.png'
#                         )
#                     },
#                     content_type='multipart/form-data'
#                 )

#             assert response.status_code == 500
#             data = json.loads(response.data)
#             assert "error" in data
#     finally:
#         # Clean up
#         if os.path.exists(tmp_path):
#             os.unlink(tmp_path)

# @pytest.mark.order(2) # LOX n°6
# def test_read_prescription_qr_invalid_json(client):
#     """
#     Test QR reading when decrypted content is not valid JSON
#     """
#     # Create a temporary file for testing
#     with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
#         tmp_file.write(b'fake image data')
#         tmp_path = tmp_file.name

#     try:
#         with patch('routes.qr_code.read_qr_code.read_qr_code') as mock_read:
#             mock_read.return_value = "invalid json"

#             with open(tmp_path, 'rb') as f:
#                 response = client.post(
#                     '/read_prescription_qr',
#                     data={
#                         'image': (
#                             f,
#                             'test.png'
#                         )
#                     },
#                     content_type='multipart/form-data'
#                 )

#             assert response.status_code == 500
#             data = json.loads(response.data)
#             assert "error" in data
#     finally:
#         # Clean up
#         if os.path.exists(tmp_path):
#             os.unlink(tmp_path)

# @pytest.mark.order(2) # LOX n°6
# def test_decrypt_data():
#     """Test data decryption with AES"""
#     # First, encrypt some test data
#     test_data = "Test data to decrypt"
#     key = b'1234567890123456'  # 16 bytes (exactly)

#     # Encrypt the data
#     cipher = AES.new(key, AES.MODE_ECB)
#     padded_data = pad(test_data.encode(), AES.block_size)
#     encrypted_data = cipher.encrypt(padded_data)
#     encrypted_b64 = base64.b64encode(encrypted_data).decode()

#     # Now decrypt it
#     decrypted = qrCodeLect.decrypt_data(encrypted_b64, key)

#     # Should return the original data
#     assert decrypted == test_data

# @pytest.mark.order(2) # LOX n°6
# def test_decrypt_data_invalid():
#     """Test decryption with invalid data"""
#     with pytest.raises(Exception):
#         qrCodeLect.decrypt_data("invalid_data", b'test_key_12345678')

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_success(mock_env_file):
#     """Test successful QR code reading and decryption"""
#     # Mock all external dependencies
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         # Setup mocks
#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         # Mock QR code detection
#         mock_qr_code = MagicMock()
#         mock_qr_code.data = b'encrypted_test_data'
#         mock_decode.return_value = [mock_qr_code]

#         # Mock environment file loading
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}

#         # Mock decryption
#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.return_value = TEST_DECRYPTED_DATA

#             # Call the function
#             result = qrCodeLect.read_qr_code("test_image.png")

#             # Should return decrypted data
#             assert result[0] is True
#             assert result[1] == TEST_DECRYPTED_DATA

#             # Verify dependencies were called
#             mock_imread.assert_called_once_with("test_image.png")
#             mock_decode.assert_called_once_with(mock_image)
#             mock_load_env.assert_called_once_with(".env")
#             mock_decrypt.assert_called_once()

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_image_not_found():
#     """Test QR code reading when image file doesn't exist"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread:
#         mock_imread.return_value = None

#         fake_file = "nonexistent.png"

#         result = qrCodeLect.read_qr_code(fake_file)

#         # Should return None
#         assert result[1] is f"Error: Unable to load the image {fake_file}."

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_no_qr_detected():
#     """Test QR code reading when no QR code is found in image"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode:

#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image
#         mock_decode.return_value = []  # No QR codes detected

#         result = qrCodeLect.read_qr_code("test_image.png")

#         # Should return None
#         assert result == (False, "No QR Code detected in the image.")

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_decryption_error(mock_env_file):
#     """Test QR code reading when decryption fails"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         # Setup mocks
#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         # Mock QR code detection
#         mock_qr_code = MagicMock()
#         mock_qr_code.data = b'encrypted_test_data'
#         mock_decode.return_value = [mock_qr_code]

#         # Mock environment file loading
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}

#         # Mock decryption to raise an exception
#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.side_effect = Exception("Decryption error")

#             result = qrCodeLect.read_qr_code("test_image.png")

#             # Should return None due to decryption error
#             assert result is None

# @pytest.mark.order(2) # LOX n°6
# def test_verify_doctor_success():
#     """Test successful doctor verification"""
#     qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

#     with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
#         # Mock successful API response
#         mock_response = MagicMock()
#         mock_response.status_code = 200
#         mock_response.json.return_value = {"doctor": {"id": 1, "name": "John Doe"}}
#         mock_get.return_value = mock_response

#         # This should not raise an exception
#         qrCodeLect.verify_doctor(qr_content)

#         # Verify API was called with correct parameters
#         mock_get.assert_called_once_with("http://localhost:5000/find_doctor_by_name?first_name=John&last_name=Doe")

# @pytest.mark.order(2) # LOX n°6
# def test_verify_doctor_missing_info():
#     """Test doctor verification with missing information"""
#     qr_content = '{"doctor": {}}'  # Missing first_name and last_name

#     # This should not raise an exception but should print a message
#     qrCodeLect.verify_doctor(qr_content)

# @pytest.mark.order(2) # LOX n°6
# def test_verify_doctor_api_error():
#     """Test doctor verification with API error"""
#     qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

#     with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
#         # Mock API error
#         mock_response = MagicMock()
#         mock_response.status_code = 404
#         mock_response.text = "Not found"
#         mock_get.return_value = mock_response

#         # This should not raise an exception but should print an error message
#         qrCodeLect.verify_doctor(qr_content)

# @pytest.mark.order(2) # LOX n°6
# def test_verify_doctor_connection_error():
#     """Test doctor verification with connection error"""
#     qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

#     with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
#         # Mock connection error
#         mock_get.side_effect = requests.exceptions.ConnectionError("Connection error")

#         # This should not raise an exception but should print an error message
#         qrCodeLect.verify_doctor(qr_content)

# @pytest.mark.order(2) # LOX n°6
# def test_verify_doctor_invalid_json():
#     """Test doctor verification with invalid JSON"""
#     qr_content = "invalid json"

#     # This should not raise an exception but should print an error message
#     qrCodeLect.verify_doctor(qr_content)

# @pytest.mark.order(2) # LOX n°6
# # Tests for the command-line interface
# def test_command_line_interface():
#     """Test the command-line interface by directly calling the functions"""
#     with patch("scripts.qrcode.qrCodeLect.read_qr_code") as mock_read, \
#         patch("scripts.qrcode.qrCodeLect.verify_doctor") as mock_verify:

#         # Mock successful QR code reading
#         mock_read.return_value = TEST_DECRYPTED_DATA

#         # Simulate the command-line interface by calling the functions directly
#         filename = "test_image.png"
#         content = qrCodeLect.read_qr_code(filename)
#         if content:
#             qrCodeLect.verify_doctor(content)

#         # Verify functions were called
#         mock_read.assert_called_once_with(filename)
#         mock_verify.assert_called_once_with(TEST_DECRYPTED_DATA)

# @pytest.mark.order(2) # LOX n°6
# def test_command_line_interface_no_file():
#     """Test the command-line interface when no file is provided"""
#     # Mock the relative import issue
#     with patch('scripts.qrcode.qrCodeLect.load_env_file', side_effect=ImportError):
#         # Run the script as a subprocess with no arguments
#         result = subprocess.run(
#             [sys.executable, "-c", "import scripts.qrcode.qrCodeLect; scripts.qrcode.qrCodeLect.main()"],
#             capture_output=True,
#             text=True
#         )

#     # Should exit with non-zero status
#     assert result.returncode != 0
#     # Should print usage message
#     assert "Usage: python3 code.py <path_to_qrcode>" in result.stderr or "Usage: python3 code.py <path_to_qrcode>" in result.stdout

# @pytest.mark.order(2) # LOX n°6
# def test_command_line_interface_no_qr_content():
#     """Test the command-line interface when no QR content is found"""
#     with patch("scripts.qrcode.qrCodeLect.read_qr_code") as mock_read, \
#         patch("scripts.qrcode.qrCodeLect.verify_doctor") as mock_verify:

#         # Mock no QR content found
#         mock_read.return_value = None

#         # Simuler l'appel de la fonction main
#         with patch.object(sys, 'argv', ['qrCodeLect.py', 'test_image.png']):
#             qrCodeLect.main()

#         # Verify functions were called but verify_doctor was not
#         mock_read.assert_called_once_with('test_image.png')
#         mock_verify.assert_not_called()

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_unicode_decode_error(mock_env_file):
#     """Test QR code reading with non-UTF8 data that requires fallback decoding"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         # Setup mocks
#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         # Mock QR code detection with non-UTF8 data
#         mock_qr_code = MagicMock()
#         # Create bytes that are not valid UTF-8
#         mock_qr_code.data = b'\xff\xfe'  # Invalid UTF-8
#         mock_decode.return_value = [mock_qr_code]

#         # Mock environment file loading
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}

#         # Mock decryption
#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.return_value = TEST_DECRYPTED_DATA

#             # Call the function
#             result = qrCodeLect.read_qr_code("test_image.png")

#             # Should return decrypted data
#             assert result[1] == TEST_DECRYPTED_DATA

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_key_adjustment_short(mock_env_file):
#     """Test QR code reading with a short key (less than 16 bytes)"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         mock_qr_code = MagicMock()
#         mock_qr_code.data = b'encrypted_test_data'
#         mock_decode.return_value = [mock_qr_code]

#         # Set a short key (less than 16 bytes)
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "short_key"}

#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.return_value = TEST_DECRYPTED_DATA

#             result = qrCodeLect.read_qr_code("test_image.png")
#             assert result == TEST_DECRYPTED_DATA

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_key_adjustment_medium(mock_env_file):
#     """Test QR code reading with a medium key (between 16 and 24 bytes)"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         mock_qr_code = MagicMock()
#         mock_qr_code.data = b'encrypted_test_data'
#         mock_decode.return_value = [mock_qr_code]

#         # Set a medium key (between 16 and 24 bytes)
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "medium_key_1234567890"}

#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.return_value = TEST_DECRYPTED_DATA

#             result = qrCodeLect.read_qr_code("test_image.png")
#             assert result == TEST_DECRYPTED_DATA

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_key_adjustment_long(mock_env_file):
#     """Test QR code reading with a long key (between 24 and 32 bytes)"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         mock_qr_code = MagicMock()
#         mock_qr_code.data = b'encrypted_test_data'
#         mock_decode.return_value = [mock_qr_code]

#         # Set a long key (between 24 and 32 bytes)
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "long_key_12345678901234567890"}

#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.return_value = TEST_DECRYPTED_DATA

#             result = qrCodeLect.read_qr_code("test_image.png")
#             assert result == TEST_DECRYPTED_DATA

# @pytest.mark.order(2) # LOX n°6
# def test_verify_doctor_request_exception():
#     """Test doctor verification with a RequestException (other than ConnectionError)"""
#     qr_content = '{"doctor": {"first_name": "John", "last_name": "Doe"}}'

#     with patch("scripts.qrcode.qrCodeLect.requests.get") as mock_get:
#         # Mock a RequestException (e.g., timeout)
#         mock_get.side_effect = requests.exceptions.RequestException("Timeout error")

#         # This should not raise an exception but should print an error message
#         qrCodeLect.verify_doctor(qr_content)

# @pytest.mark.order(2) # LOX n°6
# def test_read_qr_code_all_qr_codes_fail_decryption(mock_env_file):
#     """Test QR code reading when all detected QR codes fail decryption"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env:

#         # Setup mocks
#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         # Mock multiple QR codes detection
#         mock_qr_code1 = MagicMock()
#         mock_qr_code1.data = b'encrypted_test_data_1'
#         mock_qr_code2 = MagicMock()
#         mock_qr_code2.data = b'encrypted_test_data_2'
#         mock_decode.return_value = [mock_qr_code1, mock_qr_code2]

#         # Mock environment file loading
#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}

#         # Mock decryption to always fail
#         with patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt:
#             mock_decrypt.side_effect = Exception("Decryption error for all QR codes")

#             # Mock print statements
#             with patch("builtins.print") as mock_print:
#                 result = qrCodeLect.read_qr_code("test_image.png")

#                 # Should return None after trying all QR codes
#                 assert result is None
#                 # Should have called decrypt_data twice (once for each QR code)
#                 assert mock_decrypt.call_count == 2
#                 # Verify error messages were printed
#                 mock_print.assert_any_call("Erreur de déchiffrement: Decryption error for all QR codes")
#                 mock_print.assert_any_call("Aucun QR code n'a pu être déchiffré.")

# @pytest.mark.order(2) # LOX n°6
# def test_main_success(capsys):
#     """Test main function with successful execution"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread, \
#         patch("scripts.qrcode.qrCodeLect.decode") as mock_decode, \
#         patch("scripts.qrcode.qrCodeLect.load_env_file") as mock_load_env, \
#         patch("scripts.qrcode.qrCodeLect.decrypt_data") as mock_decrypt, \
#         patch("scripts.qrcode.qrCodeLect.verify_doctor") as mock_verify:

#         # Setup mocks for successful QR code reading
#         mock_image = MagicMock()
#         mock_imread.return_value = mock_image

#         mock_qr_code = MagicMock()
#         mock_qr_code.data = b'encrypted_test_data'
#         mock_decode.return_value = [mock_qr_code]

#         mock_load_env.return_value = {"SECRET_QR_ENCRYPTION_KEY": "test_key_123456789012345678901234567890"}
#         mock_decrypt.return_value = TEST_DECRYPTED_DATA

#         with patch.object(sys, 'argv', ['qrCodeLect.py', 'test_image.png']):
#             qrCodeLect.main()

#             # Verify functions were called
#             mock_imread.assert_called_once_with('test_image.png')
#             mock_decode.assert_called_once_with(mock_image)
#             mock_load_env.assert_called_once_with('.env')
#             mock_decrypt.assert_called_once()
#             mock_verify.assert_called_once_with(TEST_DECRYPTED_DATA)

#             # Verify print statements were called
#             captured = capsys.readouterr()
#             assert "QR Code content (chiffré):" in captured.out
#             assert "QR Code content (déchiffré):" in captured.out

# @pytest.mark.order(2) # LOX n°6
# def test_main_no_args(capsys):
#     """Test main function with no arguments"""
#     with patch.object(sys, 'argv', ['qrCodeLect.py']):
#         with pytest.raises(SystemExit):
#             qrCodeLect.main()

#         captured = capsys.readouterr()
#         assert "Usage: python3 code.py <path_to_qrcode>" in captured.out

# @pytest.mark.order(2) # LOX n°6
# def test_main_file_not_found(capsys):
#     """Test main function with non-existent file"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread:
#         mock_imread.return_value = None

#         with patch.object(sys, 'argv', ['qrCodeLect.py', 'nonexistent.png']):
#             qrCodeLect.main()

#             mock_imread.assert_called_once_with('nonexistent.png')

#             # Verify error message was printed
#             captured = capsys.readouterr()
#             assert "Unable to load the image" in captured.out

# @pytest.mark.order(2) # LOX n°6
# def test_main_image_load_error(capsys):
#     """Test main function when image cannot be loaded"""
#     with patch("scripts.qrcode.qrCodeLect.cv2.imread") as mock_imread:
#         mock_imread.return_value = None

#         with patch.object(sys, 'argv', ['qrCodeLect.py', 'invalid_image.png']):
#             qrCodeLect.main()

#             mock_imread.assert_called_once_with('invalid_image.png')

#             # Verify error message was printed
#             captured = capsys.readouterr()
#             assert "Unable to load the image" in captured.out
