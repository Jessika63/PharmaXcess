import qrcode
import json
import os
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64
from io import BytesIO
import zlib

def get_qr_color():
    """
    Objective:
    Return the RGB color tuple corresponding to a predefined hex color for QR code generation.

    Returns:
    - tuple (int, int, int): RGB values representing the color #F57196.
    """
    # Convertir le code hexadécimal en valeurs RGB
    hex_color = "#F57196"
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

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
    """
    Objective:
    Encrypt the given data using AES encryption in ECB mode and return it as a base64-encoded string.

    Parameters:
    - data (str or bytes): The plaintext data to encrypt.
    - key (bytes): The AES encryption key. Must be 16, 24, or 32 bytes long.

    Returns:
    - str: The base64-encoded ciphertext.
    """
    cipher = AES.new(key, AES.MODE_ECB)

    if isinstance(data, str):
        data = data.encode('utf-8')

    padded_data = pad(data, AES.block_size)
    encrypted_data = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_data).decode('utf-8')

def find_unique_filename(base_name, extension=".png"):
    """
    Objective:
    Generate a unique filename by appending an incrementing counter to the base name until a non-existing file is found.

    Parameters:
    - base_name (str): The base name of the file (without number or extension).
    - extension (str, optional): The file extension. Defaults to ".png".

    Returns:
    - str: A unique filename in the format 'base_name_<counter>.<extension>'.
    """
    counter = 1
    while True:
        filename = f"{base_name}_{counter}{extension}"
        if not os.path.exists(filename):
            return filename
        counter += 1

def generate_rounded_qr_code(info, base_filename="prescription", return_buffer=False):
    """
    Objective:
    Generates a visually styled QR code containing encrypted and compressed information. The QR code features rounded modules and customizable colors.

    Parameters:
    - info (dict): The information to encode in the QR code.
    - base_filename (str, optional): Base name used to save the generated QR code file. Defaults to "prescription".
    - return_buffer (bool, optional): If True, returns an in-memory buffer (BytesIO) instead of saving the QR code to a file.

    Returns:
    - str or BytesIO: The filename of the saved QR code if return_buffer is False, otherwise a BytesIO buffer containing the QR code image.

    Notes:
    - The function compresses the data using zlib and encrypts it using AES before embedding it in the QR code.
    - The QR code is generated with automatic sizing and rounded modules for visual appeal.
    - The color of the QR code modules is determined by the get_qr_color() function.
    """
    try:
        # Convert the information into formatted JSON
        json_content = json.dumps(info, ensure_ascii=False, separators=(',', ':'))

        # Compress the data to reduce the size
        compressed_data = zlib.compress(json_content.encode('utf-8'))

        # Load the encryption key
        env_data = load_env_file(".env")
        secret_key_str = env_data["SECRET_QR_ENCRYPTION_KEY"]

        # Convert the key string to bytes and ensure it has the correct length
        secret_key = secret_key_str.encode('utf-8')

        # AES requires keys of 16, 24, or 32 bytes
        if len(secret_key) < 16:
            secret_key = secret_key.ljust(16, b'\0')
        elif len(secret_key) < 24:
            secret_key = secret_key.ljust(24, b'\0')
        elif len(secret_key) < 32:
            secret_key = secret_key.ljust(32, b'\0')
        else:
            secret_key = secret_key[:32]

        # Encrypt the compressed data
        encrypted_content = encrypt_data(compressed_data, secret_key)

        # Use an automatic version of the QR code that adapts to the size of the data
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_Q,
            box_size=10,
            border=2,
        )

        # Add the data to the QR Code
        qr.add_data(encrypted_content)
        qr.make(fit=True)

        # Generate a styled QR Code image
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=SolidFillColorMask(
                front_color=get_qr_color(),  # Couleur des modules
                back_color=(255, 255, 255)  # Couleur de fond (blanc)
            ),
        )

        if return_buffer:
            # Return an in-memory buffer
            img_buffer = BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            return img_buffer
        else:
            # Save to a file (original behavior)
            unique_filename = find_unique_filename(base_filename)
            img.save(unique_filename)
            print(f"QR Code saved as: {unique_filename}")
            return unique_filename

    except Exception as e:
        print(f"Error in generate_rounded_qr_code: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

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
