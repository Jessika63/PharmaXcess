import qrcode
import json
import os
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask

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

def generate_rounded_qr_code(info, base_filename="prescription"):
    """
    Generates a QR code containing prescription information, with rounded modules.

    :param info: Dictionary containing the prescription information.
    :param base_filename: The base name used to save the final QR code.
    """
    # Convert the information into formatted JSON
    json_content = json.dumps(info, ensure_ascii=False, indent=4)

    # Create a QR Code object
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,  # Good error correction
        box_size=10,
        border=2,
    )

    # Add the data to the QR Code
    qr.add_data(json_content)
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

    # Find a unique filename
    unique_filename = find_unique_filename(base_filename)

    # Save the generated QR Code
    img.save(unique_filename)
    print(f"QR Code saved as: {unique_filename}")

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
