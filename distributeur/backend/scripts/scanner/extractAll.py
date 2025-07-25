import cv2
import numpy as np
import os
import re
import sys
import json
from paddleocr import PaddleOCR

def add_background(img, scale_factor=1.5):
    """
    Adds a white background around the input image to increase its size.

    Parameters:
    - img (numpy.ndarray): Original image.
    - scale_factor (float): Scale factor to increase image dimensions.

    Returns:
    - numpy.ndarray: New image with a white background.
    """
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
    Corrects the skew of an image using line detection and rotates it if needed.

    Parameters:
    - image_path (str): Path to the input image.

    Returns:
    - str: Path to the saved, corrected image.
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
    Extracts text from an image using PaddleOCR.

    Parameters:
    - image_path (str): Path to the input image.

    Returns:
    - str: Recognized text from the image.
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
    Extracts structured data from a prescription text.

    Parameters:
    - text (str): Raw OCR-extracted text.

    Returns:
    - dict: Extracted information including doctor, RPPS, patient, and dates.
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

    patient_pattern = r"(?:M\.|Mme\.)\s+([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ]+)\s+([A-Za-z]+)"
    patient = re.search(patient_pattern, text)
    if patient:
        last_name, first_name = patient.groups()
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
    Extracts structured data from the front of a French ID card.

    Parameters:
    - text (str): Raw OCR-extracted text.

    Returns:
    - dict: Extracted information including name, nationality, sex, etc.
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
    Extracts structured data from the back of a French ID card.

    Parameters:
    - text (str): Raw OCR-extracted text.

    Returns:
    - dict: Extracted information including address, authority, delivery and validity dates.
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

def main(image_path, doc_type):
    """
    Main function to process an image: correct orientation, extract text, and parse data.

    Parameters:
    - image_path (str): Path to the input image.
    - doc_type (str): Type of document ('P' = prescription, 'R' = recto ID, 'V' = verso ID).

    Returns:
    - dict: Parsed information extracted from the image.
    """
    corrected_image = correct_orientation(image_path)
    text = extract_text_paddleocr(corrected_image)

    print("\n=== TEXTE OCR ===\n")
    print(text)

    data = {}

    if doc_type == "P":
        data = getInfosPrescription(text)
    elif doc_type == "R":
        data = getInfosRectoID(text)
    elif doc_type == "V":
        data = getInfosVersoID(text)
    else:
        print("Unknown. Use P, R, V.")
        return

    print("\n=== INFOS JSON ===\n")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    return data

if __name__ == "__main__":
    """
    Entry point for command-line usage.

    Usage:
        python3 script.py <image_path> <P|R|V>
    """
    if len(sys.argv) != 3:
        print("Usage: python3 extractAll.py <image_path> <P|R|V>")
        sys.exit(1)

    img_path = sys.argv[1]
    doc_type = sys.argv[2].upper()
    main(img_path, doc_type)
