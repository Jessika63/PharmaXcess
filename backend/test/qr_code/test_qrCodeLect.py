import pytest
import numpy as np
import cv2
from unittest.mock import MagicMock, patch
import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from scripts.qrcode.qrCodeLect import decrypt_and_decompress, super_enhance_image, detect_qr_codes_aggressively, read_qr_code

class TestQrCodeLect:

    @pytest.fixture(autouse=True)
    def mock_cv2(self):
        with patch('scripts.qrcode.qrCodeLect.cv2') as mock_cv2:
            # Setup default returns for common cv2 functions to avoid unpack errors
            mock_cv2.threshold.return_value = (None, np.zeros((100, 100), dtype=np.uint8))
            mock_cv2.cvtColor.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.createCLAHE.return_value.apply.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.adaptiveThreshold.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.medianBlur.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.GaussianBlur.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.dilate.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.erode.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.morphologyEx.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.bilateralFilter.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.addWeighted.return_value = np.zeros((100, 100), dtype=np.uint8)
            mock_cv2.LUT.return_value = np.zeros((100, 100), dtype=np.uint8)
            
            # For detect_qr_codes
            mock_cv2.QRCodeDetector.return_value.detectAndDecode.return_value = (None, None, None)
            mock_cv2.QRCodeDetector.return_value.detectAndDecodeMulti.return_value = (False, [], None, None)
            
            yield mock_cv2

    @pytest.fixture
    def mock_encryption_env(self, monkeypatch):
        key = "1234567890123456" # 16 bytes
        monkeypatch.setenv("SECRET_QR_ENCRYPTION_KEY", key)
        return key

    def test_decrypt_and_decompress_success(self, mock_encryption_env):
        # Setup valid encrypted data
        # This requires reversing the logic: string -> compress -> pad -> encrypt -> base64
        import base64
        from Crypto.Cipher import AES
        from Crypto.Util.Padding import pad
        import zlib
        
        original_text = "test_decryption"
        key = mock_encryption_env.encode('utf-8')
        
        # 1. Compress
        compressed = zlib.compress(original_text.encode('utf-8'))
        
        # 2. Encrypt
        cipher = AES.new(key, AES.MODE_ECB)
        encrypted = cipher.encrypt(pad(compressed, AES.block_size))
        
        # 3. Base64
        b64_encrypted = base64.b64encode(encrypted).decode('utf-8')
        
        # Test
        result = decrypt_and_decompress(b64_encrypted, key)
        assert result == original_text

    def test_decrypt_and_decompress_invalid_base64(self, mock_encryption_env):
        key = mock_encryption_env.encode('utf-8')
        result = decrypt_and_decompress("invalid-base64", key)
        assert result is None

    def test_super_enhance_image_gray(self):
        # Create a dummy grayscale image
        img = np.zeros((100, 100), dtype=np.uint8)
        enhanced = super_enhance_image(img)
        # Check that we get a list of images back
        assert isinstance(enhanced, list)
        assert len(enhanced) > 0
        # Check types
        for e_img in enhanced:
            assert isinstance(e_img, np.ndarray)
            assert e_img.shape == (100, 100)

    def test_super_enhance_image_color(self):
        # Create a dummy color image
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        enhanced = super_enhance_image(img)
        assert isinstance(enhanced, list)
        assert len(enhanced) > 0
        # Should be converted to grayscale
        assert enhanced[0].shape == (100, 100)

    @patch('scripts.qrcode.qrCodeLect.cv2.QRCodeDetector')
    @patch('scripts.qrcode.qrCodeLect.decode')
    def test_detect_qr_codes_aggressively_opencv_found(self, mock_decode, mock_cv2_detector):
        # Setup OpenCV detector mock
        mock_detector_instance = MagicMock()
        mock_cv2_detector.return_value = mock_detector_instance
        
        # detectAndDecode returns (data, points, straight_qrcode)
        mock_detector_instance.detectAndDecode.return_value = ("found_cv2", np.array([]), None)
        # detectAndDecodeMulti returns (retval, decoded_info, points, straight_qrcode)
        mock_detector_instance.detectAndDecodeMulti.return_value = (True, ["found_cv2_multi"], None, None)
        
        img = np.zeros((100, 100), dtype=np.uint8)
        detected = detect_qr_codes_aggressively(img)
        
        assert "found_cv2" in detected
        assert "found_cv2_multi" in detected

    @patch('scripts.qrcode.qrCodeLect.cv2.QRCodeDetector')
    @patch('scripts.qrcode.qrCodeLect.decode')
    def test_detect_qr_codes_aggressively_pyzbar_found(self, mock_decode, mock_cv2_detector):
        # Setup OpenCV to find nothing
        mock_detector_instance = MagicMock()
        mock_cv2_detector.return_value = mock_detector_instance
        mock_detector_instance.detectAndDecode.return_value = (None, None, None)
        mock_detector_instance.detectAndDecodeMulti.return_value = (False, [], None, None)
        
        # Setup pyzbar (decode) mock
        mock_qr = MagicMock()
        mock_qr.data.decode.return_value = "found_pyzbar"
        mock_decode.return_value = [mock_qr]
        
        img = np.zeros((100, 100), dtype=np.uint8)
        detected = detect_qr_codes_aggressively(img)
        
        assert "found_pyzbar" in detected

    @patch('scripts.qrcode.qrCodeLect.detect_qr_codes_aggressively')
    @patch('scripts.qrcode.qrCodeLect.cv2.imread')
    @patch('os.getenv')
    def test_read_qr_code_success_no_encryption(self, mock_getenv, mock_imread, mock_detect):
        mock_imread.return_value = np.zeros((100, 100), dtype=np.uint8)
        mock_detect.return_value = ["plain_text_qr"]
        mock_getenv.return_value = "1234567890123456" # Valid key
        
        success, content = read_qr_code("dummy_path")
        
        assert success is True
        assert content == "plain_text_qr"

    @patch('scripts.qrcode.qrCodeLect.detect_qr_codes_aggressively')
    @patch('scripts.qrcode.qrCodeLect.cv2.imread')
    def test_read_qr_code_file_not_found(self, mock_imread, mock_detect):
        mock_imread.return_value = None
        
        success, content = read_qr_code("bad_path")
        
        assert success is False
        assert "Impossible de charger" in content

    @patch('scripts.qrcode.qrCodeLect.detect_qr_codes_aggressively')
    @patch('scripts.qrcode.qrCodeLect.cv2.imread')
    def test_read_qr_code_no_qr_found(self, mock_imread, mock_detect):
        mock_imread.return_value = np.zeros((100, 100), dtype=np.uint8)
        mock_detect.return_value = []
        
        success, content = read_qr_code("dummy_path")
        
        assert success is False
        assert "Aucun QR code détecté" in content
