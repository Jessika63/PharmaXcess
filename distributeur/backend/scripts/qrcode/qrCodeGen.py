import qrcode
import json
import os
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64
from io import BytesIO

def load_env_file(env_file_path):
    """
    Objectif: Loads environment variables from a .env file and returns them as a dictionary.

    Parameters:
        - env_file_path: Path to the .env file to load. (String)

    Return Value:
        - env_data: Dictionary containing key-value pairs parsed from the .env file. (Dictionary)

    Raises:
        - FileNotFoundError: If the specified .env file does not exist.
        - ValueError: If the .env file contains invalid lines without an equals sign.
    """
    env_data = {}

    # Check if the file exists
    if not os.path.exists(env_file_path):
        raise FileNotFoundError(f"The file '{env_file_path}' does not exist in {os.getcwd()}.")

    # Read the file and parse its content
    with open(env_file_path, "r") as file:
        for line in file:
            # Ignore comments and empty lines
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if "=" not in line:
                raise ValueError(f"Invalid line in .env file: {line}")

            key, value = line.split("=", 1)
            env_data[key.strip()] = value.strip()
    return env_data

def encrypt_data(data, key):
    """Chiffre les données avec AES"""
    cipher = AES.new(key, AES.MODE_ECB)
    padded_data = pad(data.encode(), AES.block_size)
    encrypted_data = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_data).decode()

def find_unique_filename(base_name, extension=".png"):
    """
    Finds a unique filename by incrementing a counter if necessary.

    :param base_name: The base name of the file (without number or extension).
    :param extension: The file extension.
    :return: A unique filename in the format base_name_num.extension.
    """
    counter = 1
    while True:
        filename = f"{base_name}_{counter}{extension}"
        if not os.path.exists(filename):
            return filename
        counter += 1

def generate_rounded_qr_code(info, base_filename="prescription", return_buffer=False):
    """
    Generates a QR code containing information, with rounded modules.

    :param info: Dictionary containing the information.
    :param base_filename: The base name used to save the final QR code.
    :param return_buffer: Si True, retourne un buffer mémoire au lieu de sauvegarder dans un fichier.
    """
    # Convert the information into formatted JSON
    json_content = json.dumps(info, ensure_ascii=False, indent=4)

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

    # Chiffrer les données
    encrypted_content = encrypt_data(json_content, secret_key)

    # Create a QR Code object
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,  # Good error correction
        box_size=10,
        border=2,
    )

    # Add the data to the QR Code
    qr.add_data(encrypted_content)
    qr.make(fit=True)

    # Generate a styled QR Code image
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),  # Rounded modules
        color_mask=RadialGradiantColorMask(   # Colors with a radial gradient
            center_color=(0, 120, 215),  # Dark blue at the center
            edge_color=(135, 206, 250)   # Light blue towards the edges
        ),
    )

    if return_buffer:
        # Retourner un buffer mémoire
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        return img_buffer
    else:
        # Sauvegarder dans un fichier (comportement original)
        unique_filename = find_unique_filename(base_filename)
        img.save(unique_filename)
        print(f"QR Code saved as: {unique_filename}")
        return unique_filename

# Example prescription information
prescription_info = {
    "doctor": {
        "first_name": "DOCTOR",
        "last_name": "VERY",
        "rpps_code": "213456345227625",
        "location": "SOMEWHERE"
    },
    "patient": {
        "last_name": "YOU YES",
        "age": 2155
    },
    "date": "2024-02-28",
    "content": [
        "Paracetamol 500mg - 1 tablet every 6 hours",
        "Amoxicillin 500mg - 1 capsule in the morning and evening for 7 days"
    ]
}

# Generate the rounded QR Code for the prescription
generate_rounded_qr_code(prescription_info)
