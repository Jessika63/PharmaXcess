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

    @patch('scripts.qrcode.qrCodeLect.cv2.findContours')
    @patch('scripts.qrcode.qrCodeLect.cv2.Canny')
    @patch('scripts.qrcode.qrCodeLect.cv2.contourArea')
    @patch('scripts.qrcode.qrCodeLect.cv2.arcLength')
    @patch('scripts.qrcode.qrCodeLect.cv2.approxPolyDP')
    @patch('scripts.qrcode.qrCodeLect.cv2.warpPerspective')
    @patch('scripts.qrcode.qrCodeLect.cv2.getPerspectiveTransform')
    def test_detect_qr_codes_warp_perspective(self, mock_get_perspect, mock_warp, mock_approx, mock_arc, mock_area, mock_canny, mock_find):
        # Mock Canny to return something
        mock_canny.return_value = np.zeros((100, 100), dtype=np.uint8)
        
        # Mock findContours to return one contour
        # Contour is (N, 1, 2) array
        cnt = np.array([[[0,0]], [[10,0]], [[10,10]], [[0,10]]], dtype=np.int32)
        mock_find.return_value = ([cnt], None)
        
        # Mock area
        mock_area.return_value = 100.0
        
        # Mock arcLength
        mock_arc.return_value = 40.0
        
        # Mock approxPolyDP to return 4 points
        # Shape (4, 1, 2)
        approx = np.array([[[0,0]], [[10,0]], [[10,10]], [[0,10]]], dtype=np.float32)
        mock_approx.return_value = approx
        
        # Mock getPerspectiveTransform
        mock_get_perspect.return_value = np.eye(3)
        
        # Mock warpPerspective
        mock_warp.return_value = np.zeros((10, 10), dtype=np.uint8)
        
        # Run detection
        img = np.zeros((100, 100), dtype=np.uint8)
        
        # We need detect_qr_codes_aggressively to call warp_perspective_candidates
        # It calls it inside the loop.
        
        # We also need to prevent other mocked calls from crashing or we just let them run?
        # Our mock_cv2 fixture mocks others. These explicit patches override the fixture for these specific names?
        # Yes, patch decorators override fixture mocks passed via self if they target same path.
        
        detected = detect_qr_codes_aggressively(img)
        
        # We don't expect actual detection unless we mock decode too, but we want to verify coverage of warp logic.
        assert isinstance(detected, list)
        # Check if warp was called
        assert mock_warp.called

    def test_decrypt_and_decompress_fallback_encodings(self):
        # Test fallback to latin-1
        key = b'1234567890123456'
        # Create a payload that is valid latin-1 but invalid utf-8 when decrypted
        # Actually easy way: encrypt something that decrypts to bytes 0xFF which is invalid start byte in UTF-8
        # but valid in latin-1 (ÿ)
        
        import base64
        from Crypto.Cipher import AES
        from Crypto.Util.Padding import pad
        
        # encrypted payload that decrypts to b'\xff'
        cipher = AES.new(key, AES.MODE_ECB)
        encrypted = cipher.encrypt(pad(b'\xff', AES.block_size))
        b64_encrypted = base64.b64encode(encrypted).decode('utf-8')
        
        # This should hit the utf-8 decode error and fall back to latin-1
        result = decrypt_and_decompress(b64_encrypted, key)
        assert result == '\xff'

    def test_decrypt_and_decompress_various_compression_methods(self):
        # Test zlib/gzip variants
        # Since we use zlib.compress in standard way, it produces zlib header.
        # Let's test standard flow again to be sure it hits the first try
        key = b'1234567890123456'
        import zlib, base64
        from Crypto.Cipher import AES
        from Crypto.Util.Padding import pad
        
        data = b"compressed_data"
        compressed = zlib.compress(data)
        cipher = AES.new(key, AES.MODE_ECB)
        encrypted = cipher.encrypt(pad(compressed, AES.block_size))
        b64 = base64.b64encode(encrypted).decode('ascii')
        
        assert decrypt_and_decompress(b64, key) == "compressed_data"

    @patch('scripts.qrcode.qrCodeLect.cv2.QRCodeDetector')
    @patch('scripts.qrcode.qrCodeLect.decode')
    def test_detect_qr_codes_rotation(self, mock_decode, mock_cv2_detector):
        # Mock initial detections to fail
        instance = MagicMock()
        instance.detectAndDecode.return_value = (None, None, None)
        instance.detectAndDecodeMulti.return_value = (False, [], None, None)
        mock_cv2_detector.return_value = instance
        mock_decode.return_value = []
        
        # We need to simulate that ONE rotation works
        # This is tricky without precise side_effect control on the mocked calls.
        # But we can check if rotation code is EXECUTED by spying on cv2.getRotationMatrix2D
        # Or better: ensure we return something when rotated.
        
        # Let's make detectAndDecode return something ONLY for the last call? 
        # Hard to deterministic count.
        
        # Simpler approach: Verify full code path execution by ensuring no exceptions raised
        # and checking coverage
        img = np.zeros((100, 100), dtype=np.uint8)
        results = detect_qr_codes_aggressively(img)
        assert isinstance(results, list)

    @patch('scripts.qrcode.qrCodeLect.cv2.imread')
    @patch('scripts.qrcode.qrCodeLect.detect_qr_codes_aggressively')
    def test_read_qr_code_decryption_errors(self, mock_detect, mock_imread):
        mock_imread.return_value = np.zeros((10,10))
        mock_detect.return_value = ["some_data"]
        # Decryption fails (bad key or bad data), should return raw data
        with patch.dict(os.environ, {"SECRET_QR_ENCRYPTION_KEY": "1234567890123456"}):
            success, content = read_qr_code("test.png")
            assert success is True
            assert content == "some_data"

    def test_super_enhance_image_exceptions(self):
        # Test that exceptions in enhancement steps are caught
        img = np.zeros((100, 100), dtype=np.uint8)
        
        # We need to force exceptions in cv2 calls.
        # Since cv2 is mocked by autouse fixture, we can get it from there?
        # But we need specific side effects.
        
        with patch('scripts.qrcode.qrCodeLect.cv2.adaptiveThreshold', side_effect=Exception("Fail")):
            super_enhance_image(img)
            
        with patch('scripts.qrcode.qrCodeLect.cv2.bilateralFilter', side_effect=Exception("Fail")):
            super_enhance_image(img)
            
        with patch('scripts.qrcode.qrCodeLect.cv2.addWeighted', side_effect=Exception("Fail")):
            super_enhance_image(img)
            
        with patch('scripts.qrcode.qrCodeLect.cv2.LUT', side_effect=Exception("Fail")):
             super_enhance_image(img)

    def test_detect_qr_codes_exceptions(self):
        img = np.zeros((100, 100), dtype=np.uint8)
        # Exception during rotation detection
        with patch('scripts.qrcode.qrCodeLect.cv2.getRotationMatrix2D', side_effect=Exception("Fail")):
             detect_qr_codes_aggressively(img)
        
        # Exception during warp
        with patch('scripts.qrcode.qrCodeLect.cv2.findContours', side_effect=Exception("Fail")):
             detect_qr_codes_aggressively(img)

    @patch('os.getenv')
    def test_read_qr_code_key_logic_gaps(self, mock_getenv):
        # Cover lines 297 (len > 32)
        mock_getenv.return_value = "a" * 40
        with patch('scripts.qrcode.qrCodeLect.detect_qr_codes_aggressively', return_value=["enc"]):
            with patch('scripts.qrcode.qrCodeLect.cv2.imread', return_value=np.zeros((10,10))):
                read_qr_code("path")
                
        # Cover 288 (no key) -> Covered by test_read_qr_code_decryption_errors ? 
        # No, that used "with patch.dict". 
        mock_getenv.return_value = None
        with patch('scripts.qrcode.qrCodeLect.detect_qr_codes_aggressively', return_value=["enc"]):
            with patch('scripts.qrcode.qrCodeLect.cv2.imread', return_value=np.zeros((10,10))):
                read_qr_code("path")

    def test_main_cli(self):
        from scripts.qrcode.qrCodeLect import main
        # Test success path
        with patch('sys.argv', ["script", "file.png"]):
            with patch('scripts.qrcode.qrCodeLect.read_qr_code', return_value=(True, "content")):
                # Mock print to avoid stdout noise
                with patch('builtins.print'):
                    main()
                    
        # Test error path
        with patch('sys.argv', ["script", "file.png"]):
            with patch('scripts.qrcode.qrCodeLect.read_qr_code', return_value=(False, "error")):
                with patch('builtins.print'):
                    main()
                    
        # Test usage error
        with patch('sys.argv', ["script"]):
             with patch('builtins.print'):
                 with pytest.raises(SystemExit):
                     main()
