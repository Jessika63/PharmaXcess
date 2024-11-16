import pytesseract
from PIL import Image
import cv2
import numpy as np
import os
import requests
import sys
import re

def check_orientation_with_tesseract(image_path):
    """
    Checks the orientation of the image using Tesseract's OS detection.
    Returns the corrected image if orientation is wrong, or the original image if no correction is needed.
    """
    img = cv2.imread(image_path)

    try:
        # Get the OS (Orientation and Script Detection) information
        osd = pytesseract.image_to_osd(img)

        # Extract the rotation angle
        rotation_angle = int(re.search(r"(?<=Rotate: )\d+", osd).group(0))

        # Correct the orientation if needed
        if rotation_angle != 0:
            (h, w) = img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, -rotation_angle, 1.0)
            img = cv2.warpAffine(img, M, (w, h))

            # Save the re-corrected image
            corrected_dir = "corrected"
            os.makedirs(corrected_dir, exist_ok=True)
            corrected_image_path = os.path.join(corrected_dir, f"corrected_{os.path.basename(image_path)}")
            cv2.imwrite(corrected_image_path, img)

            return corrected_image_path

    except pytesseract.TesseractError as e:
        # Handle the case where Tesseract cannot process the image
        return image_path

    # If no correction is needed, return the original path
    return image_path

def add_background(img, scale_factor=1.5):
    """
    Adds a white background (padding) around the image to avoid cropping.
    The scale_factor allows you to adjust the size of the background.
    """
    height, width, _ = img.shape

    # Calculate new dimensions with a safety margin
    new_height = int(height * scale_factor)
    new_width = int(width * scale_factor)

    # Create a white image of the enlarged size
    background = np.ones((new_height, new_width, 3), dtype=np.uint8) * 255

    # Center the image on the new background
    start_y = (new_height - height) // 2
    start_x = (new_width - width) // 2
    background[start_y:start_y + height, start_x:start_x + width] = img

    return background

def correct_orientation(image_path):
    # Read the image with OpenCV
    img = cv2.imread(image_path)

    # Add a white background to avoid cropping
    img = add_background(img)

    # Resize the image for better OCR results
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    # Convert the image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply blur to reduce noise
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # Detect edges
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)

    # Find lines in the image
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)

    if lines is not None:
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
            angles.append(angle)

        # Calculate the median angle
        median_angle = np.median(angles)

        # Correct the image orientation
        if median_angle != 0:
            (h, w) = img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            img = cv2.warpAffine(img, M, (w, h))

    # Create 'corrected' folder if it doesn't exist
    corrected_dir = "corrected"
    os.makedirs(corrected_dir, exist_ok=True)

    # Get the original filename
    filename = os.path.basename(image_path)

    # Generate the corrected image path
    corrected_image_path = os.path.join(corrected_dir, f"corrected_{filename}")

    # Save the corrected image
    cv2.imwrite(corrected_image_path, img)

    return corrected_image_path

def read_image(image_path):
    # Correct the image orientation with line detection
    corrected_image_path = correct_orientation(image_path)

    # Check orientation with Tesseract and further correct if necessary
    final_image_path = check_orientation_with_tesseract(corrected_image_path)

    # Open the final corrected image
    img = Image.open(final_image_path)

    try:
        custom_config = r'--oem 3 --psm 6 -l fra+eng'  # French + English

        # Run Tesseract OCR with a more flexible configuration
        text = pytesseract.image_to_string(img, config=custom_config)

        # If the text is empty, skip reading
        if not text.strip():
            return "No text detected."

    except pytesseract.TesseractError as e:
        # Skip if Tesseract cannot process the image
        return "No text could be extracted from the image."

    return text

def getInfos(text):
    # Get Last and First Name
    name_pattern = r"Nom:\s*([A-Z]+)\s*\nPrénom\(s\):\s*([A-Z]+)"
    name_match = re.search(name_pattern, text)
    if name_match:
        last_name, first_name = name_match.groups()
        print(f"Nom: {last_name}")
        print(f"Prénom: {first_name}")
    else:
        print("ERROR: Nom ou prénom incorrect.")

    # Get Date of Birth
    birth_date_pattern = r"le:\s*(\d{2}\.\d{2}\.\d{4})"
    birth_date_match = re.search(birth_date_pattern, text)
    if birth_date_match:
        birth_date = birth_date_match.group(1)
        print(f"Date de naissance: {birth_date}")
    else:
        print("ERROR: Date de naissance incorrect.")

    # Get Place of Birth
    birth_place_pattern = r"à:\s*([A-Z\s0-9]+)"
    birth_place_match = re.search(birth_place_pattern, text)
    if birth_place_match:
        birth_place = birth_place_match.group(1)
        print(f"Lieu de naissance: {birth_place}")
    else:
        print("ERROR: Lieu de naissance incorrect.")

    # Get Sex
    sex_pattern = r"Sexe:\s*([MF])"
    sex_match = re.search(sex_pattern, text)
    if sex_match:
        sex = "Femme" if sex_match.group(1) == "F" else "Homme"
        print(f"Sexe: {sex}")
    else:
        print("ERROR: Sexe incorrect.")

    # Get Height (if available)
    height_pattern = r"Taille;\s*([0-9]+(?:\.[0-9]+)?)"
    height_match = re.search(height_pattern, text)
    if height_match:
        height = height_match.group(1)
        print(f"Taille: {height} cm")
    else:
        print("ERROR: Taille incorrect.")

def main(image_path):
    if not os.path.isfile(image_path):
        print(f"Error: The file '{image_path}' does not exist.")
        sys.exit(1)

    text = read_image(image_path)

    if text == "No text detected." or text == "No text could be extracted from the image.":
        print(text)
    else:
        # print(text)

        # Check information of the prescription
        getInfos(text)

        with open('prescription_text.txt', 'w', encoding='utf-8') as file:
            file.write(text)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python read_image.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    main(image_path)
