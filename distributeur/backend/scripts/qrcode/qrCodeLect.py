
import cv2
import numpy as np
from pyzbar.pyzbar import decode, ZBarSymbol
import unicodedata
import json
import sys
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import os
from dotenv import load_dotenv
import zlib

# Charger les variables d'environnement
load_dotenv()

def decrypt_and_decompress(encrypted_base64_text, key):
    """Déchiffre (AES-ECB) puis décompresse (zlib) et renvoie une string UTF-8.

    Retourne None si l'opération échoue.
    """
    try:
        cipher = AES.new(key, AES.MODE_ECB)
        decrypted_padded = cipher.decrypt(base64.b64decode(encrypted_base64_text))
        raw_bytes = unpad(decrypted_padded, AES.block_size)
        # Tenter la décompression zlib/gzip avec différentes options
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
        # Si aucune décompression ne fonctionne, tenter un décodage direct
        try:
            return raw_bytes.decode('utf-8')
        except Exception:
            try:
                return raw_bytes.decode('latin-1')
            except Exception:
                raise last_error or Exception('Unable to decompress or decode payload')
    except Exception as e:
        print(f"Erreur lors du déchiffrement/décompression: {e}")
        return None

def super_enhance_image(image):
    """Améliore l'image de manière agressive pour la détection de QR code"""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Liste pour stocker toutes les versions améliorées de l'image
    enhanced_versions = []

    # 1. Image originale
    enhanced_versions.append(gray)

    # 2. Égalisation d'histogramme CLAHE
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced_versions.append(clahe.apply(gray))

    # 3. Variation de seuillage adaptatif
    for block_size in [11, 15, 21]:
        for c_val in [2, 5, 10]:
            try:
                t = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                           cv2.THRESH_BINARY, block_size, c_val)
                enhanced_versions.append(t)
            except:
                pass

    # 4. Seuillage d'Otsu
    _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    enhanced_versions.append(thresh_otsu)

    # 5. Flou médian pour réduire le bruit
    median_blur = cv2.medianBlur(gray, 5)
    enhanced_versions.append(median_blur)

    # 6. Flou gaussien + seuillage d'Otsu
    gaussian_blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh_gauss = cv2.threshold(gaussian_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    enhanced_versions.append(thresh_gauss)

    # 7. Dilatation pour renforcer les motifs
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(gray, kernel, iterations=1)
    enhanced_versions.append(dilated)

    # 8. Érosion pour réduire le bruit
    eroded = cv2.erode(gray, kernel, iterations=1)
    enhanced_versions.append(eroded)

    # 9. Ouverture morphologique (érosion suivie de dilatation)
    opening = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
    enhanced_versions.append(opening)

    # 10. Fermeture morphologique (dilatation suivie d'érosion)
    closing = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
    enhanced_versions.append(closing)

    # 11. Filtre bilatéral pour lisser tout en préservant les bords
    try:
        bilateral = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
        enhanced_versions.append(bilateral)
    except:
        pass

    # 12. Netteté (unsharp masking)
    try:
        gaussian = cv2.GaussianBlur(gray, (0, 0), 3)
        unsharp = cv2.addWeighted(gray, 1.5, gaussian, -0.5, 0)
        enhanced_versions.append(unsharp)
    except:
        pass

    # 13. Correction gamma
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
    """Détecte les QR codes de manière agressive avec différentes techniques"""
    all_detected_data = []

    # Essayer différentes échelles, y compris agrandissements pour écrans de téléphone
    scales = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]

    def try_opencv_qr(img_variant, collector):
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
            # Redimensionner l'image
            if scale != 1.0:
                resized = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            else:
                resized = image

            # Améliorer l'image
            enhanced_images = super_enhance_image(resized)

            # Essayer chaque version améliorée
            for enhanced_img in enhanced_images:
                # D'abord tenter avec l'API OpenCV
                try_opencv_qr(enhanced_img, all_detected_data)

                # Générer des candidats par correction de perspective
                candidates = warp_perspective_candidates(enhanced_img)

                # Détecter les QR codes avec différentes configurations
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

                # Essayer aussi avec une rotation de l'image (pour les QR codes inclinés)
                for angle in [0, 90, 180, 270]:
                    if angle != 0:
                        # Calculer la matrice de rotation
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
    Lit et décode un QR Code avec des techniques de détection ultra-robustes.
    """
    try:
        # Charger l'image
        image = cv2.imread(qr_filename)
        if image is None:
            return False, f"Impossible de charger l'image: {qr_filename}"

        # Détection agressive des QR codes
        all_detected_data = detect_qr_codes_aggressively(image)

        # Si on a trouvé des données, prendre la plus longue (généralement la bonne)
        if all_detected_data:
            # Trier par longueur (les vrais QR codes ont généralement plus de données)
            all_detected_data.sort(key=len, reverse=True)
            most_likely_data = all_detected_data[0]

            # Déchiffrer si nécessaire
            try:
                secret_key_str = os.getenv("SECRET_QR_ENCRYPTION_KEY")
                if not secret_key_str:
                    return False, "Clé de chiffrement manquante"

                # Préparer la clé
                secret_key = secret_key_str.encode('utf-8')
                if len(secret_key) < 16:
                    secret_key = secret_key.ljust(16, b'\0')
                elif 16 < len(secret_key) < 24:
                    secret_key = secret_key.ljust(24, b'\0')
                elif 24 < len(secret_key) < 32:
                    secret_key = secret_key.ljust(32, b'\0')
                elif len(secret_key) > 32:
                    secret_key = secret_key[:32]

                # Déchiffrer
                decrypted_content = decrypt_and_decompress(most_likely_data, secret_key)
                if decrypted_content:
                    return True, decrypted_content
                else:
                    # Peut-être que les données ne sont pas chiffrées
                    return True, most_likely_data
            except Exception as e:
                print(f"Erreur de déchiffrement: {e}")
                # Peut-être que les données ne sont pas chiffrées
                return True, most_likely_data

        return False, "Aucun QR code détecté après plusieurs tentatives"

    except Exception as e:
        return False, f"Erreur lors de la lecture du QR code: {str(e)}"

def main():
    """Fonction principale pour l'exécution en ligne de commande"""
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
