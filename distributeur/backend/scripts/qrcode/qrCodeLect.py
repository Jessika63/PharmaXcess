import cv2
from pyzbar.pyzbar import decode
import unicodedata
import requests
import json
import sys

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

        print("QR Code content:")
        print(data)
        return data

    return None

def verify_doctor(qr_content):
    """
    Verifies doctor information via an API.

    :param qr_content: Decoded content of the QR Code (JSON or plain text).
    """
    try:
        # Assume the content is in JSON; otherwise, this will raise an exception.
        infos = json.loads(qr_content)
        doctor = infos.get("doctor", {})
        first_name = doctor.get("first_name")
        last_name = doctor.get("last_name")

        if not first_name or not last_name:
            print("Doctor information is missing in the QR Code.")
            return

        # Build the API URL with query parameters
        url = f"http://localhost:5000/find_doctor_by_name?first_name={first_name}&last_name={last_name}"

        # Perform the GET request
        response = requests.get(url)

        if response.status_code == 200:
            print("API result:")
            print(response.json())
        else:
            print(f"API error: {response.status_code} - {response.text}")

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
