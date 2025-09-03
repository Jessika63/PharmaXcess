
import cv2
from pyzbar.pyzbar import decode
import unicodedata
import requests
import json
import sys
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from launch_distributeur.helpers.env_functions.load_env_file import load_env_file

def decrypt_data(encrypted_data, key):
    """Déchiffre les données avec AES"""
    cipher = AES.new(key, AES.MODE_ECB)
    decrypted_data = cipher.decrypt(base64.b64decode(encrypted_data))
    return unpad(decrypted_data, AES.block_size).decode()

def read_qr_code(qr_filename):
    """
    Reads and decodes a QR Code from an image, handling special characters.

    :param qr_filename: Path to the file containing the QR Code.
    :return: The decoded content of the QR Code (in JSON or plain text).
    """
    # Load the image containing the QR Code
    image = cv2.imread(qr_filename)

    if image is None:
        print(f"Error: Unable to load the image '{qr_filename}'.")
        return None

    # Decode QR Codes present in the image
    qr_codes = decode(image)

    if not qr_codes:
        print("No QR Code detected in the image.")
        return None

    # Process each detected QR Code
    for qr_code in qr_codes:
        # Initial decoding with explicit error handling
        raw_data = qr_code.data
        try:
            # Try decoding directly as UTF-8
            data = raw_data.decode("utf-8")
        except UnicodeDecodeError:
            # Normalize and replace incorrect characters if needed
            data = raw_data.decode("latin1").encode("utf-8").decode("utf-8")

        # Normalize text (useful if Unicode combined forms are present)
        data = unicodedata.normalize("NFKC", data)

        print("QR Code content (chiffré):")
        print(data)

        try:
            env_data = load_env_file(".env")
            secret_key_str = env_data["SECRET_QR_ENCRYPTION_KEY"]
            
            # Convertir la clé string en bytes et s'assurer qu'elle a la bonne longueur
            secret_key = secret_key_str.encode('utf-8')
            
            # AES nécessite des clés de 16, 24 ou 32 octets
            # Si la clé n'a pas la bonne longueur, on l'ajuste
            if len(secret_key) < 16:
                # Remplir avec des zéros si trop courte
                secret_key = secret_key.ljust(16, b'\0')
            elif len(secret_key) < 24:
                secret_key = secret_key.ljust(24, b'\0')
            elif len(secret_key) < 32:
                secret_key = secret_key.ljust(32, b'\0')
            else:
                # Tronquer si trop longue
                secret_key = secret_key[:32]

            # Déchiffrer les données
            decrypted_content = decrypt_data(data, secret_key)
            print("QR Code content (déchiffré):")
            print(decrypted_content)
            return decrypted_content  # Retourner le contenu au lieu de juste l'afficher
        except Exception as e:
            print(f"Erreur de déchiffrement: {e}")
            return None

    return None

def verify_doctor(qr_content):
    """
    Verifies doctor information via an API.

    :param qr_content: Decrypted content of the QR Code (JSON).
    """
    try:
        # Le contenu est déjà déchiffré, il suffit de le parser en JSON
        infos = json.loads(qr_content)
        doctor = infos.get("doctor", {})
        first_name = doctor.get("first_name")
        last_name = doctor.get("last_name")

        if not first_name or not last_name:
            print("Doctor information is missing in the QR Code.")
            return

        # Build the API URL with query parameters
        url = f"http://localhost:5000/find_doctor_by_name?first_name={first_name}&last_name={last_name}"

        try:
            # Perform the GET request
            response = requests.get(url)

            if response.status_code == 200:
                print("API result:")
                print(response.json())
            else:
                print(f"API error: {response.status_code} - {response.text}")

        except requests.exceptions.ConnectionError:
            print("Error: Unable to connect to the API. Please ensure the server is running on localhost:5000")
        except requests.exceptions.RequestException as e:
            print(f"An error occurred during the API request: {e}")

    except json.JSONDecodeError:
        print("The QR Code content is not valid JSON.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 code.py <path_to_qrcode>")
        sys.exit(1)

    filename = sys.argv[1]
    content = read_qr_code(filename)
    if content:
        verify_doctor(content)
