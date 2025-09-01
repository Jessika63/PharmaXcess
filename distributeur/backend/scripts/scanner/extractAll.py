import cv2
import numpy as np
import os
import re
import sys
import json
from paddleocr import PaddleOCR

def add_background(img, scale_factor=1.5):
    """
    Objectif: Adds a white background around the input image to increase its dimensions while centering the original content.

    Parameters:
        - img: Original input image as a NumPy array. (numpy.ndarray)
        - scale_factor: Multiplicative factor to increase image dimensions. Defaults to 1.5. (float)

    Return Value:
        - new_image: New image with white background and original content centered. (numpy.ndarray)
    """
    if img is None:
        raise ValueError("Input image is None")

    height, width, _ = img.shape
    new_height = int(height * scale_factor)
    new_width = int(width * scale_factor)
    background = np.ones((new_height, new_width, 3), dtype=np.uint8) * 255
    start_y = (new_height - height) // 2
    start_x = (new_width - width) // 2
    background[start_y:start_y + height, start_x:start_x + width] = img
    return background

def correct_orientation(image_path):
    """
    Objectif: Corrects the skew and orientation of an image using line detection and rotates it to align with the detected median angle.

    Parameters:
        - image_path: Path to the input image file. (String)

    Return Value:
        - corrected_image_path: Path to the saved, corrected image file. (String)
    """
    img = cv2.imread(image_path)
    img = add_background(img)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)

    if lines is not None:
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
            angles.append(angle)
        median_angle = np.median(angles)
        if median_angle != 0:
            (h, w) = img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            img = cv2.warpAffine(img, M, (w, h))

    corrected_dir = "corrected"
    os.makedirs(corrected_dir, exist_ok=True)
    filename = os.path.basename(image_path)
    corrected_image_path = os.path.join(corrected_dir, f"corrected_{filename}")
    cv2.imwrite(corrected_image_path, img)
    return corrected_image_path

def extract_text_paddleocr(image_path):
    """
    Objectif: Extracts text from an image using PaddleOCR with French language support and angle classification.

    Parameters:
        - image_path: Path to the input image file. (String)

    Return Value:
        - text: Recognized text from the image, concatenated into a single string with line breaks. (String)
    """
    ocr = PaddleOCR(use_angle_cls=True, lang='fr')
    result = ocr.ocr(image_path, cls=True)
    output_text = []
    for line in result:
        for word_info in line:
            output_text.append(word_info[1][0])
    return "\n".join(output_text)

def getInfosPrescription(text):
    """
    Objectif: Extracts structured information from a prescription text, including doctor details, patient information, and prescribed medications.

    Parameters:
        - text: Raw OCR-extracted text from a prescription image. (String)

    Return Value:
        - infos: Dictionary containing structured prescription data with keys for doctor, RPPS, patient, prescription date, and medications. (Dictionary)
    """
    infos = {}
    spe = "NONE"

    doctor_pattern = r"Dr\s+([A-Za-zÀ-ÿ]+)\s+([A-Za-zÀ-ÿ]+)"
    doctors = re.findall(doctor_pattern, text)
    if doctors:
        firstname, lastname = doctors[0]
        specialty_pattern = r"(MEDECIN\s+[A-Zéèêîàç\-]+|CARDIOLOGUE|DERMATOLOGUE|PEDIATRE|GYNECOLOGUE|OPHTALMOLOGISTE|PSYCHIATRE)"
        specialty_match = re.search(specialty_pattern, text, re.IGNORECASE)
        if specialty_match:
            spe = specialty_match.group(0).strip()
        infos["medecin"] = {
            "prenom": firstname,
            "nom": lastname,
            "speciality": spe
        }

    rpps_pattern = r"RPPS[:\s]*([0-9]{11})"
    rpps_match = re.search(rpps_pattern, text)
    if rpps_match:
        infos["rpps"] = rpps_match.group(1)

    # n'autorise pas \n entre les groupes, et accepte accents/tirets/apostrophes
    patient_pattern = r"(?:M\.|Mme\.)[^\S\r\n]+([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ]+)[^\S\r\n]+([A-Za-zÀ-ÖØ-öø-ÿ'’-]+)"
    patient = re.search(patient_pattern, text)

    if patient:
        last_name = patient.group(1)
        first_name = patient.group(2)
        if last_name and first_name:
            infos["patient"] = {
                "prenom": first_name,
                "nom": last_name
            }
    # date_pattern = r"\d{1,2}[-/ ]\d{1,2}[-/ ]\d{2,4}"
    # dates = re.findall(date_pattern, text)
    # if dates:
    #     infos["dates"] = dates

    date_presc_match = re.search(r"Le\s+(\d{1,2}\s+[a-zéû]+\s+\d{4})", text, re.IGNORECASE)
    if date_presc_match:
        infos["date_prescription"] = date_presc_match.group(1)

    lines = text.splitlines()
    meds = []
    current_med = None
    capture_started = False

    for line in lines:
        line = line.strip()

        if not capture_started and re.search(r"né\(e\)|née le", line, re.IGNORECASE):
            capture_started = True
            continue

        if not capture_started:
            continue

        if not line:
            continue

        if re.search(r"[A-Z]{3,}.*\b(mg|ml|g|%|cp|comprimé|sol|solution|pulv|capsule|pommade|sirop|gelule)\b", line, re.IGNORECASE):
            current_med = {"nom": line, "posologie": ""}
            meds.append(current_med)
        elif current_med:
            current_med["posologie"] += line + " "

    for med in meds:
        med["posologie"] = med["posologie"].strip()

    if meds:
        infos["medicaments"] = meds

    return infos

def getInfosRectoID(text):
    """
    Objectif: Extracts structured data from the front of a French ID card using OCR-extracted text.

    Parameters:
        - text: Raw OCR-extracted text from the front of a French ID card. (String)

    Return Value:
        - infos: Dictionary containing extracted ID information including name, nationality, gender, birth date, and height. (Dictionary)
    """
    infos = {}
    text = text.replace("Mationalite", "Nationalité").replace("Francaise", "Française") \
                .replace("TM=Nom", "Nom").replace("PrenomS", "Prénoms") \
                .replace("Nele", "Née le").replace("Taille", "Taille ") \
                .replace("Sexe:", "Sexe:")

    match = re.search(r"Nationalité[:\s]*([A-Za-zéÉèàêâîç]+)", text)
    if match:
        infos["nationalite"] = match.group(1)

    match = re.search(r"Nom[:\s]*([A-Z]+)", text)
    if match:
        infos["nom"] = match.group(1).capitalize()

    match = re.search(r"Prénoms[:\s]*([A-Z]+)", text)
    if match:
        raw = match.group(1)
        prenoms = re.findall(r'[A-Z][a-z]*', raw.capitalize())
        infos["prenoms"] = prenoms

    match = re.search(r"Sexe[:\s]*([MF])", text)
    if match:
        infos["sexe"] = "Homme" if match.group(1) == "M" else "Femme"

    match = re.search(r"Née(?: le)?[:\s]*([0-9]{2}[.\-/][0-9]{2}[.\-/][0-9]{4})", text)
    if match:
        infos["date_naissance"] = match.group(1).replace('.', '/')

    match = re.search(r"Taille\s*([0-9][.,][0-9]{2})", text)
    if match:
        infos["taille"] = match.group(1).replace(',', '.')

    return infos

def getInfosVersoID(text):
    """
    Objectif: Extracts structured data from the back of a French ID card using OCR-extracted text.

    Parameters:
        - text: Raw OCR-extracted text from the back of a French ID card. (String)

    Return Value:
        - infos: Dictionary containing extracted information including address, delivery date, validity date, and issuing authority. (Dictionary)
    """
    infos = {}
    text = text.replace("Carte valablejusqu'au", "Carte valable jusqu'au") \
                .replace("delivreele", "délivrée le") \
                .replace("Adresse.:", "Adresse:") \
                .replace("Adresse.", "Adresse:") \
                .replace("LaPrefete", "La Préfète") \
                .replace("Par", "par")

    address_pattern = r"Adresse[:\s]*([0-9A-Z\- ]+)"
    address_match = re.search(address_pattern, text, re.IGNORECASE)
    if address_match:
        adresse = address_match.group(1)
        adresse = re.sub(r"(\d{5})([A-Z])", r"\1 \2", adresse)
        infos["adresse"] = adresse.strip().title()

    validity_pattern = r"valable.*?(\d{2}[./-]\d{2}[./-]\d{4})"
    valid_match = re.search(validity_pattern, text)
    if valid_match:
        infos["date_validite"] = valid_match.group(1).replace('.', '/')

    issued_pattern = r"délivrée\s*le\s*(\d{2}[./-]\d{2}[./-]\d{4})"
    issued_match = re.search(issued_pattern, text)
    if issued_match:
        infos["date_delivrance"] = issued_match.group(1).replace('.', '/')

    by_pattern = r"par\s*([A-Z\s\-]+)"
    by_match = re.search(by_pattern, text, re.IGNORECASE)
    if by_match:
        infos["autorite"] = by_match.group(1).strip().title()

    return infos


def flip_image(input_path, output_path, flip_code):
    """
    Objectif: Flips an image vertically, horizontally, or both and saves the result to a specified path.

    Parameters:
        - input_path: Path to the input image file. (String)
        - output_path: Path where the flipped image will be saved. (String)
        - flip_code: Integer code specifying the flip direction:
            - 0: Vertical flip
            - 1: Horizontal flip
            - -1: Both vertical and horizontal flip

    Return Value:
        - None: This function does not return a value but saves the flipped image to disk and prints status messages.
    """
    image = cv2.imread(input_path)

    if image is None:
        print(f"Could not read the image at {input_path}")
        return

    flipped = cv2.flip(image, flip_code)
    cv2.imwrite(output_path, flipped)
    print(f"Flipped image saved to {output_path}")


def main(image_input, doc_type, is_bytes=False, flip_horizontal=False):
    """
    Objectif: Processes an image to correct its orientation, extract text using OCR, and parse the extracted text based on the document type.

    Parameters:
        - image_input: Path to the input image file or raw image bytes. (String or Bytes)
        - doc_type: Type of document to process ('P' for prescription, 'R' for ID card front, 'V' for ID card back). (String)
        - is_bytes: Indicates whether image_input is raw bytes (True) or a file path (False). Defaults to False. (Boolean)
        - flip_horizontal: If True, flips the image horizontally before processing. Defaults to False. (Boolean)

    Return Value:
        - result: Dictionary containing:
            - raw_text: The full OCR-extracted text from the image. (String)
            - infos: Structured information parsed from the text based on the document type. (Dictionary)
    """
    if is_bytes:
        nparr = np.frombuffer(image_input, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        img = cv2.imread(image_input)

    if flip_horizontal:
        img = cv2.flip(img, 1)
        
    img = add_background(img)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)

    if lines is not None:
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
            angles.append(angle)
        median_angle = np.median(angles)
        if median_angle != 0:
            (h, w) = img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            img = cv2.warpAffine(img, M, (w, h))

    ocr = PaddleOCR(use_angle_cls=True, lang='fr')
    result_ocr = ocr.ocr(img, cls=True)
    text = "\n".join([word[1][0] for line in result_ocr for word in line])

    if doc_type == "P":
        infos = getInfosPrescription(text)
    elif doc_type == "R":
        infos = getInfosRectoID(text)
    elif doc_type == "V":
        infos = getInfosVersoID(text)
    else:
        infos = {}

    return {
        "raw_text": text,
        "infos": infos
    }


if __name__ == "__main__":
    """
    Objectif: Command-line entry point for extracting text and structured information from an image of a document.

    Command-line parameters:
        - argv[1]: Path to the input image file. (String)
        - argv[2]: Document type, must be one of: 'P' (prescription), 'R' (ID card front), 'V' (ID card back). (String)

    Return Value:
        - None: This script does not return a value but prints the extracted information as a JSON string to stdout.
    """
    if len(sys.argv) != 3:
        sys.exit(1)

    img_path = sys.argv[1]
    doc_type = sys.argv[2].upper()
    result = main(img_path, doc_type)
    print(json.dumps(result, ensure_ascii=False))
