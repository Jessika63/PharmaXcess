
import pytest
import json
from unittest.mock import patch, mock_open, MagicMock
import io
import os
import base64
import zlib

# Import the functions to test
from scripts.qrcode.qrCodeGen import (
    load_env_file,
    encrypt_data,
    find_unique_filename,
    generate_rounded_qr_code
)

# Test data
MOCK_PRESCRIPTION_DATA = {
    "doctor": {
        "first_name": "John",
        "last_name": "Doe",
        "rpps_code": "123456789",
        "location": "Paris"
    },
    "patient": {
        "last_name": "Smith",
        "age": 30
    },
    "date": "2024-01-01",
    "content": ["Medication 1", "Medication 2"]
}

MOCK_DIRECTION_DATA = {
    "pharmacy": {
        "name": "Pharmacy",
        "address": "123 Street"
    },
    "transport": "car",
    "userCoords": [48.8566, 2.3522]
}

# Test data for qrCodeGen module tests
TEST_DATA = {
    "doctor": {"name": "Test Doctor"},
    "patient": {"name": "Test Patient"},
    "date": "2024-01-01",
    "content": ["Test Medication"]
}

@pytest.fixture
def mock_env_file():
    """Create a mock .env file for testing"""
    env_content = "SECRET_QR_ENCRYPTION_KEY=test_key_123456789012345678901234567890\nOTHER_VAR=test_value"
    with patch("builtins.open", mock_open(read_data=env_content)):
        with patch("os.path.exists", return_value=True):
            yield

@pytest.fixture(scope="session", autouse=True)
def cleanup_after_tests():
    """Fixture pour nettoyer les fichiers après tous les tests"""
    yield
    import glob
    import os

    # Nettoyer les fichiers de test dans le répertoire courant et le répertoire parent
    directories_to_clean = [os.getcwd(), os.path.dirname(os.getcwd())]

    for directory in directories_to_clean:
        pattern = os.path.join(directory, "prescription_*.png")
        for file in glob.glob(pattern):
            os.remove(file)
            print(f"✓ Fichier nettoyé : {file}")

# Create a mock image buffer
def create_mock_image_buffer():
    # Create a simple PNG image in memory
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

@pytest.mark.order(1)  # LOX n°6
def test_generate_prescription_qr_success(client):
    """
    Test successful prescription QR code generation
    """
    with patch('routes.qr_code.generate_qr_code.generate_rounded_qr_code') as mock_generate:
        # Create a realistic mock image buffer
        mock_buffer = create_mock_image_buffer()
        mock_generate.return_value = mock_buffer

        response = client.post(
            '/generate_prescription_qr',
            json=MOCK_PRESCRIPTION_DATA
        )

        assert response.status_code == 200
        assert response.mimetype == 'image/png'
        assert response.content_length > 0

        # Vérifier que generate_rounded_qr_code a été appelé
        assert mock_generate.called
        call_args = mock_generate.call_args
        assert call_args[0][0] == MOCK_PRESCRIPTION_DATA  # Premier argument
        assert call_args[0][1] == "prescription"  # Deuxième argument
        assert call_args[0][2] == True  # Troisième argument

@pytest.mark.order(1)  # LOX n°6
def test_generate_direction_qr_success(client):
    """
    Test successful direction QR code generation
    """
    with patch('routes.qr_code.generate_qr_code.generate_rounded_qr_code') as mock_generate:
        # Create a realistic mock image buffer
        mock_buffer = create_mock_image_buffer()
        mock_generate.return_value = mock_buffer

        response = client.post(
            '/generate_direction_qr',
            json=MOCK_DIRECTION_DATA
        )

        assert response.status_code == 200
        assert response.mimetype == 'image/png'
        assert response.content_length > 0

        # Vérifier que generate_rounded_qr_code a été appelé
        assert mock_generate.called
        call_args = mock_generate.call_args
        assert call_args[0][0] == MOCK_DIRECTION_DATA  # Premier argument
        assert call_args[0][1] == "direction"  # Deuxième argument
        assert call_args[0][2] == True  # Troisième argument

@pytest.mark.order(1)  # LOX n°6
def test_generate_prescription_qr_missing_fields(client):
    """
    Test prescription QR generation with missing required fields
    """
    invalid_data = MOCK_PRESCRIPTION_DATA.copy()
    del invalid_data['doctor']

    response = client.post('/generate_prescription_qr', json=invalid_data)

    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Le champ 'doctor' est requis" in data["error"]

@pytest.mark.order(1)  # LOX n°6
def test_generate_prescription_qr_generation_error(client):
    """
    Test prescription QR generation when QR code generation fails
    """
    with patch('routes.qr_code.generate_qr_code.generate_rounded_qr_code') as mock_generate:
        mock_generate.side_effect = Exception("Generation error")

        response = client.post(
            '/generate_prescription_qr',
            json=MOCK_PRESCRIPTION_DATA
        )

        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data

@pytest.mark.order(1)  # LOX n°6
def test_generate_direction_qr_missing_fields(client):
    """
    Test direction QR generation with missing required fields
    """
    invalid_data = MOCK_DIRECTION_DATA.copy()
    del invalid_data['pharmacy']

    response = client.post('/generate_direction_qr', json=invalid_data)

    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Le champ 'pharmacy' est requis" in data["error"]

@pytest.mark.order(1)  # LOX n°6
def test_generate_direction_qr_generation_error(client):
    """
    Test direction QR generation when QR code generation fails
    """
    with patch('routes.qr_code.generate_qr_code.generate_rounded_qr_code') as mock_generate:
        mock_generate.side_effect = Exception("Generation error")

        response = client.post(
            '/generate_direction_qr',
            json=MOCK_DIRECTION_DATA
        )

        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data

@pytest.mark.order(1)  # LOX n°6
def test_load_env_file_success():
    """Test loading environment variables from a valid .env file"""
    env_content = "SECRET_QR_ENCRYPTION_KEY=test_key\nOTHER_VAR=test_value\n# This is a comment"

    with patch("os.path.exists", return_value=True):
        with patch("builtins.open", mock_open(read_data=env_content)):
            env_data = load_env_file(".env")

            assert "SECRET_QR_ENCRYPTION_KEY" in env_data
            assert env_data["SECRET_QR_ENCRYPTION_KEY"] == "test_key"
            assert "OTHER_VAR" in env_data
            assert env_data["OTHER_VAR"] == "test_value"

@pytest.mark.order(1)  # LOX n°6
def test_load_env_file_not_found():
    """Test loading environment variables from a non-existent .env file"""
    with patch("os.path.exists", return_value=False):
        with pytest.raises(FileNotFoundError) as exc_info:
            load_env_file("nonexistent.env")

        assert "nonexistent.env" in str(exc_info.value)

@pytest.mark.order(1)  # LOX n°6
def test_load_env_file_invalid_line():
    """Test loading environment variables from a .env file with invalid lines"""
    env_content = "INVALID_LINE_WITHOUT_EQUALS\nVALID_LINE=value"

    with patch("os.path.exists", return_value=True):
        with patch("builtins.open", mock_open(read_data=env_content)):
            with pytest.raises(ValueError) as exc_info:
                load_env_file(".env")

            assert "Invalid line in .env file" in str(exc_info.value)

@pytest.mark.order(1)  # LOX n°6
def test_encrypt_data():
    """Test data encryption with AES"""
    test_data = b"Test data to encrypt"  # Change to bytes
    # Use a valid AES key length (16, 24, or 32 bytes)
    key = b'test_key_1234567'  # 16 bytes (exactly)

    encrypted = encrypt_data(test_data, key)

    # Verify that encryption worked (should return a base64 string)
    assert isinstance(encrypted, str)
    # Should be able to decode from base64
    decoded = base64.b64decode(encrypted)
    assert isinstance(decoded, bytes)

@pytest.mark.order(1)  # LOX n°6
def test_find_unique_filename(tmp_path):
    """Test finding a unique filename"""
    # Change to the temporary directory
    original_cwd = os.getcwd()
    os.chdir(tmp_path)

    try:
        # Test when no files exist
        filename = find_unique_filename("test")
        assert filename == "test_1.png"

        # Create a file and test again
        with open("test_1.png", "w") as f:
            f.write("test")

        filename = find_unique_filename("test")
        assert filename == "test_2.png"

        # Create more files and test
        with open("test_2.png", "w") as f:
            f.write("test")

        filename = find_unique_filename("test")
        assert filename == "test_3.png"
    finally:
        os.chdir(original_cwd)

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_key_adjustment():
    """Test QR code generation with different key lengths that need adjustment"""
    # Test with a short key (less than 16 bytes)
    with patch("scripts.qrcode.qrCodeGen.load_env_file") as mock_load:
        mock_load.return_value = {"SECRET_QR_ENCRYPTION_KEY": "short_key"}

        # Mock the encryption function to avoid actual encryption
        with patch("scripts.qrcode.qrCodeGen.encrypt_data") as mock_encrypt:
            mock_encrypt.return_value = "encrypted_data"

            # Mock the QR code creation to avoid slow image generation
            with patch("scripts.qrcode.qrCodeGen.qrcode.QRCode") as mock_qrcode:
                mock_qr_instance = MagicMock()
                mock_qrcode.return_value = mock_qr_instance

                # Mock the image creation
                mock_img = MagicMock()
                mock_qr_instance.make_image.return_value = mock_img

                # This should not raise an exception
                result = generate_rounded_qr_code(TEST_DATA, return_buffer=True)
                assert result is not None

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_return_buffer(mock_env_file):
    """Test QR code generation with return_buffer=True"""
    # Mock the compression and encryption functions
    with patch("scripts.qrcode.qrCodeGen.zlib.compress") as mock_compress:
        with patch("scripts.qrcode.qrCodeGen.encrypt_data") as mock_encrypt:
            mock_compress.return_value = b"compressed_data"
            mock_encrypt.return_value = "encrypted_data"

            # Mock the QR code creation to avoid slow image generation
            with patch("scripts.qrcode.qrCodeGen.qrcode.QRCode") as mock_qrcode:
                mock_qr_instance = MagicMock()
                mock_qrcode.return_value = mock_qr_instance

                # Mock the image creation
                mock_img = MagicMock()
                mock_qr_instance.make_image.return_value = mock_img

                # Mock the BytesIO to avoid actual file operations
                with patch("scripts.qrcode.qrCodeGen.BytesIO") as mock_bytesio:
                    mock_buffer = MagicMock()
                    mock_bytesio.return_value = mock_buffer

                    result = generate_rounded_qr_code(TEST_DATA, return_buffer=True)

                    # Should return the mock buffer
                    assert result == mock_buffer

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_save_file_fast(mock_env_file, tmp_path):
    """Test QR code generation with file saving - FAST VERSION"""
    # Change to the temporary directory
    original_cwd = os.getcwd()
    os.chdir(tmp_path)

    try:
        # Mock the compression and encryption functions
        with patch("scripts.qrcode.qrCodeGen.zlib.compress") as mock_compress:
            with patch("scripts.qrcode.qrCodeGen.encrypt_data") as mock_encrypt:
                mock_compress.return_value = b"compressed_data"
                mock_encrypt.return_value = "encrypted_data"

                # Mock the entire QRCode object and its methods
                with patch("scripts.qrcode.qrCodeGen.qrcode.QRCode") as mock_qr_class:
                    mock_qr_instance = MagicMock()
                    mock_qr_class.return_value = mock_qr_instance

                    # Mock the image creation
                    mock_img = MagicMock()
                    mock_qr_instance.make_image.return_value = mock_img

                    # Mock find_unique_filename to return a fixed name
                    with patch("scripts.qrcode.qrCodeGen.find_unique_filename") as mock_find:
                        mock_find.return_value = "test_qr_1.png"

                        # Generate and save QR code
                        filename = generate_rounded_qr_code(TEST_DATA, "test_qr", return_buffer=False)

                        # Should return the fixed filename
                        assert filename == "test_qr_1.png"

                        # Verify that the QRCode was called with the encrypted data
                        mock_qr_instance.add_data.assert_called_with("encrypted_data")
                        mock_qr_instance.make.assert_called_with(fit=True)

                        # Verify that we tried to save the image
                        mock_img.save.assert_called_with("test_qr_1.png")

    finally:
        os.chdir(original_cwd)

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_env_file_not_found():
    """Test QR code generation when .env file is not found"""
    with patch("scripts.qrcode.qrCodeGen.load_env_file") as mock_load:
        mock_load.side_effect = FileNotFoundError("File not found")
        with pytest.raises(FileNotFoundError):
            generate_rounded_qr_code(TEST_DATA, return_buffer=True)

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_env_file_invalid():
    """Test QR code generation when .env file has invalid content"""
    with patch("scripts.qrcode.qrCodeGen.load_env_file") as mock_load:
        mock_load.side_effect = ValueError("Invalid line")
        with pytest.raises(ValueError):
            generate_rounded_qr_code(TEST_DATA, return_buffer=True)

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_key_adjustment_20_bytes():
    """Test QR code generation with a 20-byte key (should be padded to 24 bytes)"""
    with patch("scripts.qrcode.qrCodeGen.load_env_file") as mock_load:
        # Create a 20-byte key (between 16 and 24)
        mock_load.return_value = {"SECRET_QR_ENCRYPTION_KEY": "20_byte_key_12345678"}

        # Mock the encryption function to avoid actual encryption
        with patch("scripts.qrcode.qrCodeGen.encrypt_data") as mock_encrypt:
            mock_encrypt.return_value = "encrypted_data"

            # Mock the QR code creation to avoid slow image generation
            with patch("scripts.qrcode.qrCodeGen.qrcode.QRCode") as mock_qrcode:
                mock_qr_instance = MagicMock()
                mock_qrcode.return_value = mock_qr_instance

                # Mock the image creation
                mock_img = MagicMock()
                mock_qr_instance.make_image.return_value = mock_img

                # This should not raise an exception and should use ljust(24, b'\0')
                result = generate_rounded_qr_code(TEST_DATA, return_buffer=True)
                assert result is not None

@pytest.mark.order(1)  # LOX n°6
def test_generate_rounded_qr_code_key_adjustment_28_bytes():
    """Test QR code generation with a 28-byte key (should be padded to 32 bytes)"""
    with patch("scripts.qrcode.qrCodeGen.load_env_file") as mock_load:
        # Create a 28-byte key (between 24 and 32)
        mock_load.return_value = {"SECRET_QR_ENCRYPTION_KEY": "28_byte_key_1234567890123456"}

        # Mock the encryption function to avoid actual encryption
        with patch("scripts.qrcode.qrCodeGen.encrypt_data") as mock_encrypt:
            mock_encrypt.return_value = "encrypted_data"

            # Mock the QR code creation to avoid slow image generation
            with patch("scripts.qrcode.qrCodeGen.qrcode.QRCode") as mock_qrcode:
                mock_qr_instance = MagicMock()
                mock_qrcode.return_value = mock_qr_instance

                # Mock the image creation
                mock_img = MagicMock()
                mock_qr_instance.make_image.return_value = mock_img

                # This should not raise an exception and should use ljust(32, b'\0')
                result = generate_rounded_qr_code(TEST_DATA, return_buffer=True)
                assert result is not None

                # Verify that the key was adjusted to 32 bytes
                # We can check this by looking at the call to encrypt_data
                # The second argument should be a 32-byte key
                args, kwargs = mock_encrypt.call_args
                key_arg = args[1]  # Second argument is the key
                assert len(key_arg) == 32

@pytest.mark.order(1)  # LOX n°6
def test_compression_and_encoding():
    """Test that data is properly compressed and encoded"""
    import zlib
    import base64

    # Test data
    test_data = {"test": "data", "number": 123}
    json_content = json.dumps(test_data, ensure_ascii=False, separators=(',', ':'))

    # Compress
    compressed_data = zlib.compress(json_content.encode('utf-8'))
    assert isinstance(compressed_data, bytes)

    # Encode
    encoded_data = base64.b64encode(compressed_data).decode('utf-8')
    assert isinstance(encoded_data, str)

    # Verify we can decode and decompress
    decoded_data = base64.b64decode(encoded_data.encode('utf-8'))
    decompressed_data = zlib.decompress(decoded_data).decode('utf-8')
    assert decompressed_data == json_content

@pytest.mark.order(1)  # LOX n°6
def test_encrypt_data_with_string():
    """Test data encryption with AES when data is a string"""
    test_data = "Test data to encrypt"  # String input
    # Use a valid AES key length (16, 24, or 32 bytes)
    key = b'test_key_1234567'  # 16 bytes (exactly)

    encrypted = encrypt_data(test_data, key)

    # Verify that encryption worked (should return a base64 string)
    assert isinstance(encrypted, str)
    # Should be able to decode from base64
    decoded = base64.b64decode(encrypted)
    assert isinstance(decoded, bytes)

    # Verify that the function can handle both string and bytes input
    # Encrypt the same data as bytes for comparison
    test_data_bytes = test_data.encode('utf-8')
    encrypted_bytes = encrypt_data(test_data_bytes, key)

    # Both should produce the same result
    assert encrypted == encrypted_bytes
