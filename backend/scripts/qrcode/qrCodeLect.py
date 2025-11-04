
import cv2
import numpy as np
from pyzbar.pyzbar import decode, ZBarSymbol
import json
import sys
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import os
import zlib

from scripts.qrcode.qrCodeGen import load_env_file

def decrypt_and_decompress(encrypted_base64_text, key):
    """
    Objective:
    Decrypts and decompresses data previously encrypted and compressed for secure storage or transmission.

    Parameters:
    - encrypted_base64_text (str): The encrypted and base64-encoded string to decrypt and decompress.
    - key (bytes): The AES key used for decryption (must match the key used during encryption).

    Returns:
    - str or None: The resulting UTF-8 string after decryption and decompression. Returns None if decryption or decompression fails.

    Notes:
    - Uses AES in ECB mode for decryption.
    - Supports multiple decompression methods (zlib, gzip, raw deflate) and attempts UTF-8 or Latin-1 decoding if decompression fails.
    - Prints an error message and returns None if the operation cannot be completed.
    """
    try:
        cipher = AES.new(key, AES.MODE_ECB)
        decrypted_padded = cipher.decrypt(base64.b64decode(encrypted_base64_text))
        raw_bytes = unpad(decrypted_padded, AES.block_size)
        # Attempt zlib/gzip decompression with different options
        decompress_candidates = [
            (None, {}),
            ('zlib_15', {'wbits': 15}),
            ('gzip', {'wbits': 31}),
            ('raw_deflate', {'wbits': -15}),
        ]
        last_error = None
        for _, kwargs in decompress_candidates:
            try:
                decompressed = zlib.decompress(raw_bytes, **kwargs)
                return decompressed.decode('utf-8')
            except Exception as e:
                last_error = e
                continue
        # If no decompression works, try direct decoding
        try:
            return raw_bytes.decode('utf-8')
        except Exception:
            try:
                return raw_bytes.decode('latin-1')
            except Exception:
                raise last_error or Exception('Unable to decompress or decode payload')
    except Exception as e:
        print(f"Error during decryption/decompression: {e}")
        return None

def super_enhance_image(image):
    """
    Objective:
    Aggressively enhances an input image to maximize QR code detection accuracy.

    Parameters:
    - image (numpy.ndarray): The input image in either grayscale or BGR color format.

    Returns:
    - List[numpy.ndarray]: A list of multiple enhanced versions of the image, including:
    1. Original grayscale image
    2. CLAHE histogram-equalized image
    3. Multiple adaptive thresholded images (varying block sizes and C values)
    4. Otsu thresholded image
    5. Median-blurred image
    6. Gaussian-blurred + Otsu thresholded image
    7. Dilated image
    8. Eroded image
    9. Morphological opening
    10. Morphological closing
    11. Bilateral filtered image
    12. Sharpened image (unsharp masking)
    13. Gamma-corrected images with different gamma values

    Notes:
    - Enhancements include blurring, thresholding, morphological operations, contrast adjustment, and gamma correction.
    - Designed specifically for improving QR code readability under challenging conditions.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # List to store all enhanced versions of the image
    enhanced_versions = []

    # 1. Original grayscale image
    enhanced_versions.append(gray)

    # 2. CLAHE histogram-equalized image
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced_versions.append(clahe.apply(gray))

    # 3. Multiple adaptive thresholded images (varying block sizes and C values)
    for block_size in [11, 15, 21]:
        for c_val in [2, 5, 10]:
            try:
                t = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                           cv2.THRESH_BINARY, block_size, c_val)
                enhanced_versions.append(t)
            except:
                pass

    # 4. Otsu thresholded image
    _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    enhanced_versions.append(thresh_otsu)

    # 5. Median-blurred image
    median_blur = cv2.medianBlur(gray, 5)
    enhanced_versions.append(median_blur)

    # 6. Gaussian-blurred + Otsu thresholded image
    gaussian_blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh_gauss = cv2.threshold(gaussian_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    enhanced_versions.append(thresh_gauss)

    # 7. Dilated image
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(gray, kernel, iterations=1)
    enhanced_versions.append(dilated)

    # 8. Eroded image
    eroded = cv2.erode(gray, kernel, iterations=1)
    enhanced_versions.append(eroded)

    # 9. Morphological opening (erosion followed by dilation)
    opening = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
    enhanced_versions.append(opening)

    # 10. Morphological closing (dilation followed by erosion)
    closing = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
    enhanced_versions.append(closing)

    # 11. Bilateral filter to smooth while preserving edges
    try:
        bilateral = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
        enhanced_versions.append(bilateral)
    except:
        pass

    # 12. Sharpened image (unsharp masking)
    try:
        gaussian = cv2.GaussianBlur(gray, (0, 0), 3)
        unsharp = cv2.addWeighted(gray, 1.5, gaussian, -0.5, 0)
        enhanced_versions.append(unsharp)
    except:
        pass

    # 13. Gamma correction
    for gamma in [0.6, 0.8, 1.2, 1.5]:
        try:
            inv_gamma = 1.0 / gamma
            table = np.array([(i / 255.0) ** inv_gamma * 255 for i in np.arange(0, 256)]).astype("uint8")
            gamma_img = cv2.LUT(gray, table)
            enhanced_versions.append(gamma_img)
        except:
            pass

    return enhanced_versions

def detect_qr_codes_aggressively(image):
    """
    Objective:
    Aggressively detects QR codes from an input image using multiple enhancement, scaling, rotation, 
    and perspective correction techniques to maximize the chances of successful decoding.

    Parameters:
    - image (numpy.ndarray): The input image in grayscale or BGR format.

    Returns:
    - List[str]: A list of all unique QR code data strings detected in the image.

    Techniques used:
    1. Multi-scale image resizing to detect small or large QR codes.
    2. Aggressive image enhancement (contrast, thresholding, blurring, gamma correction).
    3. OpenCV QR code detection (single and multi-detection).
    4. ZBar QR code decoding.
    5. Perspective warp correction to handle skewed QR codes.
    6. Rotational corrections (0°, 90°, 180°, 270°) for tilted QR codes.
    7. Multi-encoding handling (UTF-8, Latin-1).

    Notes:
    - Designed to maximize detection success even under challenging conditions such as low contrast,
    noise, skewed QR codes, or partial occlusion.
    - Returns only unique QR code data found across all attempted enhancements.
    """
    all_detected_data = []

    # Try different scales, including enlargements for phone screens
    scales = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]

    def try_opencv_qr(img_variant, collector):
        """
        Helper function for aggressive QR code detection using OpenCV.

        Parameters:
        - img_variant (numpy.ndarray): A preprocessed or transformed variant of the input image.
        - collector (list): A list to store unique QR code data strings detected.

        Behavior:
        - Uses OpenCV's QRCodeDetector to attempt both single and multi QR code detection.
        - Adds any successfully decoded QR code data to the collector if not already present.
        - Silently ignores any errors during detection to allow robust processing of multiple image variants.
        """
        try:
            detector = cv2.QRCodeDetector()
            data_single, points, _ = detector.detectAndDecode(img_variant)
            if data_single and data_single not in collector:
                collector.append(data_single)
            retval, decoded_info, _, _ = detector.detectAndDecodeMulti(img_variant)
            if retval and decoded_info:
                for d in decoded_info:
                    if d and d not in collector:
                        collector.append(d)
        except:
            pass

    def warp_perspective_candidates(img_variant):
        """
        Generates candidate images by correcting perspective to help detect skewed or rotated QR codes.

        Parameters:
        - img_variant (numpy.ndarray): A grayscale or preprocessed image.

        Returns:
        - candidates (list): A list of image variants including the original and perspective-corrected crops.

        Behavior:
        - Applies Canny edge detection to find edges.
        - Finds contours and keeps the 5 largest ones.
        - Approximates contours to polygons; if a polygon has 4 points, it is considered a potential QR code region.
        - Warps the perspective of each detected quadrilateral to a rectangle.
        - Adds the warped images to the candidate list for further QR code detection.
        - Silently ignores errors to maintain robustness.
        """
        candidates = [img_variant]
        try:
            edges = cv2.Canny(img_variant, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
            for cnt in contours:
                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
                if len(approx) == 4:
                    pts = approx.reshape(4, 2).astype(np.float32)
                    s = pts.sum(axis=1)
                    diff = np.diff(pts, axis=1)
                    rect = np.zeros((4, 2), dtype="float32")
                    rect[0] = pts[np.argmin(s)]
                    rect[2] = pts[np.argmax(s)]
                    rect[1] = pts[np.argmin(diff)]
                    rect[3] = pts[np.argmax(diff)]
                    (tl, tr, br, bl) = rect
                    widthA = np.linalg.norm(br - bl)
                    widthB = np.linalg.norm(tr - tl)
                    heightA = np.linalg.norm(tr - br)
                    heightB = np.linalg.norm(tl - bl)
                    maxW = int(max(widthA, widthB))
                    maxH = int(max(heightA, heightB))
                    if maxW > 0 and maxH > 0:
                        dst = np.array([[0, 0], [maxW - 1, 0], [maxW - 1, maxH - 1], [0, maxH - 1]], dtype="float32")
                        M = cv2.getPerspectiveTransform(rect, dst)
                        warped = cv2.warpPerspective(img_variant, M, (maxW, maxH))
                        candidates.append(warped)
        except:
            pass
        return candidates

    for scale in scales:
        try:
            # Resize the image
            if scale != 1.0:
                resized = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            else:
                resized = image

            # Enhance the image
            enhanced_images = super_enhance_image(resized)

            # Try each enhanced version
            for enhanced_img in enhanced_images:
                # First try with the OpenCV API
                try_opencv_qr(enhanced_img, all_detected_data)

                # Generate candidates by warping perspective
                candidates = warp_perspective_candidates(enhanced_img)

                # DDetect QR codes with different configurations
                try:
                    for img_variant in candidates:
                        qr_codes = decode(img_variant, symbols=[ZBarSymbol.QRCODE])

                        for qr_code in qr_codes:
                            try:
                                data = qr_code.data.decode('utf-8')
                                if data not in all_detected_data:
                                    all_detected_data.append(data)
                            except UnicodeDecodeError:
                                try:
                                    data = qr_code.data.decode('latin-1')
                                    if data not in all_detected_data:
                                        all_detected_data.append(data)
                                except:
                                    continue
                except:
                    continue

                # Try also with a rotation of the image (for skewed QR codes)
                for angle in [0, 90, 180, 270]:
                    if angle != 0:
                        # Calculate the rotation matrix
                        (h, w) = enhanced_img.shape[:2]
                        center = (w // 2, h // 2)
                        M = cv2.getRotationMatrix2D(center, angle, 1.0)
                        rotated = cv2.warpAffine(enhanced_img, M, (w, h))
                    else:
                        rotated = enhanced_img

                    try:
                        try_opencv_qr(rotated, all_detected_data)
                        qr_codes = decode(rotated, symbols=[ZBarSymbol.QRCODE])
                        for qr_code in qr_codes:
                            try:
                                data = qr_code.data.decode('utf-8')
                                if data not in all_detected_data:
                                    all_detected_data.append(data)
                            except UnicodeDecodeError:
                                try:
                                    data = qr_code.data.decode('latin-1')
                                    if data not in all_detected_data:
                                        all_detected_data.append(data)
                                except:
                                    continue
                    except:
                        continue
        except:
            continue

    return all_detected_data

def read_qr_code(qr_filename):
    """
    Objective: Reads and decodes a QR code from an image file using ultra-robust detection techniques, including aggressive preprocessing, perspective correction, and multiple decoding strategies. If the QR code contains encrypted data, it attempts decryption using a secret key from the environment.

    Parameters:
    - qr_filename (str): The path to the image file containing the QR code.

    Return Value:
    - tuple: A tuple (success, data_or_error) where:
        - success (bool): True if a QR code was detected (and optionally decrypted), False otherwise.
        - data_or_error (str): The decoded (and decrypted) content if successful, or an error message describing why reading failed.
    """
    try:
        # Load the image
        image = cv2.imread(qr_filename)
        if image is None:
            return False, f"Unable to load image: {qr_filename}"

        # Aggressive QR code detection
        all_detected_data = detect_qr_codes_aggressively(image)

        # If we found data, take the longest (usually the correct one)
        if all_detected_data:
            # Sort by length (real QR codes usually have more data)
            all_detected_data.sort(key=len, reverse=True)
            most_likely_data = all_detected_data[0]

            # Decrypt if necessary
            try:
                secret_key_str = os.getenv("SECRET_QR_ENCRYPTION_KEY")
                if not secret_key_str:
                    return False, "Missing encryption key in environment variable"

                # Prepare the key
                secret_key = secret_key_str.encode('utf-8')
                if len(secret_key) < 16:
                    secret_key = secret_key.ljust(16, b'\0')
                elif 16 < len(secret_key) < 24:
                    secret_key = secret_key.ljust(24, b'\0')
                elif 24 < len(secret_key) < 32:
                    secret_key = secret_key.ljust(32, b'\0')
                elif len(secret_key) > 32:
                    secret_key = secret_key[:32]

                # Decrypt and decompress
                decrypted_content = decrypt_and_decompress(most_likely_data, secret_key)
                if decrypted_content:
                    return True, decrypted_content
                else:
                    # Perhaps the data is not encrypted.
                    return True, most_likely_data
            except Exception as e:
                print(f"Decryption error: {e}")
                # Perhaps the data is not encrypted.
                return True, most_likely_data

        return False, "No QR code detected after multiple attempts"

    except Exception as e:
        return False, f"Error reading QR code: {str(e)}"

def decrypt_and_parse_raw_content(raw_content, env_path=".env"):
    """
    Objective: Decodes a raw Base64-encoded QR code content, decrypts it using AES-ECB with PKCS7 padding, optionally decompresses it (zlib/gzip/raw), and attempts to parse it as JSON. Returns structured data if possible.

    Parameters:
    - raw_content (str): The Base64-encoded encrypted content from a QR code.
    - env_path (str, optional): Path to the .env file containing the SECRET_QR_ENCRYPTION_KEY. Defaults to ".env".

    Return Value:
    - tuple: A tuple (success, parsed_or_error) where:
        - success (bool): True if decoding and parsing succeeded, False otherwise.
        - parsed_or_error (dict/str): Parsed JSON object or raw text if successful, otherwise an error message.
    """
    try:
        # Load .env (optional)
        env_data = load_env_file(".env")
        secret_key_str = env_data["SECRET_QR_ENCRYPTION_KEY"]
        if not secret_key_str:
            return False, "Missing encryption key in environment variable"

        # Prepare the key
        secret_key = secret_key_str.encode('utf-8')
        if len(secret_key) < 16:
            secret_key = secret_key.ljust(16, b'\0')
        elif len(secret_key) < 24:
            secret_key = secret_key.ljust(24, b'\0')
        elif len(secret_key) < 32:
            secret_key = secret_key.ljust(32, b'\0')
        else:
            secret_key = secret_key[:32]

        # Step 1: Base64 decode
        encrypted_bytes = base64.b64decode(raw_content)

        # Step 2: Decrypt with AES ECB
        cipher = AES.new(secret_key, AES.MODE_ECB)
        decrypted_padded = cipher.decrypt(encrypted_bytes)

        # Step 3: Remove PKCS7 padding
        decrypted_data = unpad(decrypted_padded, AES.block_size)

        # Step 4: Attempt decompression with multiple modes, else use raw bytes
        decompressed = None
        decompress_candidates = [({},), ({'wbits': 15},), ({'wbits': 31},), ({'wbits': -15},)]
        last_err = None
        for args in decompress_candidates:
            try:
                kwargs = args[0]
                decompressed = zlib.decompress(decrypted_data, **kwargs) if kwargs else zlib.decompress(decrypted_data)
                break
            except Exception as e:
                last_err = e
                continue
        if decompressed is None:
            # fallback: treat as raw UTF-8 or latin-1 bytes
            try:
                decompressed = decrypted_data
            except Exception:
                return False, f"Unable to decompress or use raw bytes: {last_err}"

        # Step 5: Decode and parse JSON
        try:
            text = decompressed.decode('utf-8')
        except Exception:
            try:
                text = decompressed.decode('latin-1')
            except Exception as e:
                return False, f"Unable to decode content: {e}"

        try:
            json_data = json.loads(text)
            return True, json_data
        except Exception:
            # If not JSON, return raw text
            return True, text

    except Exception as e:
        return False, str(e)

def main():
    """Main function for command line execution"""
    if len(sys.argv) != 2:
        print("Usage: python3 code.py <path_to_qrcode>")
        sys.exit(1)

    filename = sys.argv[1]
    success, content = read_qr_code(filename)
    if success:
        print("QR Code content:")
        print(content)
    else:
        print("Error:", content)
