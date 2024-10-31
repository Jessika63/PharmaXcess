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
    # Get Med Name
    doctor_pattern = r"Dr\s+([A-Za-z]+)\s+([A-Za-z]+)"
    doctors = re.findall(doctor_pattern, text)
    if not doctors:
        print("ERROR DOCTOR")
        return

    firstname, lastname = doctors[0]
    print(f"Doctor's Name: {firstname} {lastname}")

    # Check if the Med exist (name)
    doctor_url = f"http://localhost:5000/find_doctor_by_name?first_name={firstname}&last_name={lastname}"
    doctor_response = requests.get(doctor_url)
    
    doctor_data = doctor_response.json()
    print("API Response for doctor by name:", doctor_data)
    
    if doctor_response.status_code == 200 and isinstance(doctor_data, list) and len(doctor_data) > 0 and len(doctor_data[0]) > 0:
        print("Doctor exists by name.")
    else:
        print("Doctor not found by name.")

    # Get RPPS
    frpp_pattern = r"RPPS:\s*(\d+)|(\d{11})"
    frpp_match = re.search(frpp_pattern, text)
    
    if frpp_match:
        frpp_code = frpp_match.group(0)
        print(f"FRPP Code: {frpp_code}")
        
        # Check if the Med exist
        frpp_url = f"http://localhost:5000/find_doctor_by_frpp?frpp={frpp_code}"
        frpp_response = requests.get(frpp_url)
        
        if frpp_response.status_code == 200:
            print("Doctor exists by FRPP code.")
        else:
            print("Doctor not found by FRPP code.")
    else:
        print("No FRPP code found.")

    # Get Phone Med
    phone_pattern = r"Tél\. :\s+(\d{2} \d{2} \d{2} \d{2} \d{2})"
    phone = re.search(phone_pattern, text)
    if phone:
        print(f"Phone: {phone.group(1)}")

    # Get Patient Name
    patient_pattern = r"(?:M\.|Mme\.)\s+([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ]+)\s+([A-Za-z]+)"
    patient = re.search(patient_pattern, text)
    
    if patient:
        last_name, first_name = patient.groups()
        print(f"Patient's Name: {first_name} {last_name}")

    # Get Date
    date_pattern = (
        r"(?:(?:Le|Date:?|date:?)\s*)?"
        r"(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}"
        r"|\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)"
        r"\s+\d{2,4})"
    )
    dates = re.findall(date_pattern, text, re.IGNORECASE)
    
    if dates:
        print("Dates found:")
        for date in dates:
            date_str = ' '.join(date) if isinstance(date, tuple) else date
            print(f"- {date_str}")



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
