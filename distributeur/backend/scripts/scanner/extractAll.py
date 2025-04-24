import cv2
import numpy as np
import os
import re
import sys
from paddleocr import PaddleOCR


def add_background(img, scale_factor=1.5):
    height, width, _ = img.shape
    new_height = int(height * scale_factor)
    new_width = int(width * scale_factor)
    background = np.ones((new_height, new_width, 3), dtype=np.uint8) * 255
    start_y = (new_height - height) // 2
    start_x = (new_width - width) // 2
    background[start_y:start_y + height, start_x:start_x + width] = img
    return background


def correct_orientation(image_path):
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
    ocr = PaddleOCR(use_angle_cls=True, lang='fr')
    result = ocr.ocr(image_path, cls=True)
    output_text = []
    for line in result:
        for word_info in line:
            output_text.append(word_info[1][0])
    return "\n".join(output_text)





def getInfosPrescription(text):
    print("\n--- Infos Ordonnance ---\n")
    doctor_pattern = r"Dr\s+([A-Za-z]+)\s+([A-Za-z]+)"
    doctors = re.findall(doctor_pattern, text)
    if doctors:
        firstname, lastname = doctors[0]
        print(f"Médecin : {firstname} {lastname}")
    else:
        print("Médecin non détecté")

    rpps_pattern = r"RPPS[:\s]*([0-9]{11})"
    rpps_match = re.search(rpps_pattern, text)
    if rpps_match:
        print(f"RPPS : {rpps_match.group(1)}")

    patient_pattern = r"(?:M\.|Mme\.)\s+([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ]+)\s+([A-Za-z]+)"
    patient = re.search(patient_pattern, text)
    if patient:
        last_name, first_name = patient.groups()
        print(f"Patient : {first_name} {last_name}")

    date_pattern = r"\d{1,2}[-/]\d{1,2}[-/]\d{2,4}"
    dates = re.findall(date_pattern, text)
    if dates:
        print("Dates trouvées :", ", ".join(dates))


def getInfosRectoID(text):
    print("\n--- Infos Carte d'Identité (Recto) ---\n")

    text = text.replace("Mationalite", "Nationalité")
    text = text.replace("Francaise", "Française")
    text = text.replace("TM=Nom", "Nom")
    text = text.replace("PrenomS", "Prénoms")
    text = text.replace("Nele", "Née le")
    text = text.replace("Taille", "Taille ")
    text = text.replace("Sexe:", "Sexe:")

    # Nationalité
    match = re.search(r"Nationalité[:\s]*([A-Za-zéÉèàêâîç]+)", text)
    if match:
        print(f"Nationalité : {match.group(1)}")

    # Nom
    match = re.search(r"Nom[:\s]*([A-Z]+)", text)
    if match:
        print(f"Nom : {match.group(1).capitalize()}")

    # Prénoms
    match = re.search(r"Prénoms[:\s]*([A-Z]+)", text)
    if match:
        raw = match.group(1)
        prenoms = re.findall(r'[A-Z][a-z]*', raw.capitalize())
        print(f"Prénoms : {' '.join(prenoms)}")

    # Sexe
    match = re.search(r"Sexe[:\s]*([MF])", text)
    if match:
        print(f"Sexe : {'Homme' if match.group(1) == 'M' else 'Femme'}")

    # Date de naissance
    match = re.search(r"Née(?: le)?[:\s]*([0-9]{2}[.\-/][0-9]{2}[.\-/][0-9]{4})", text)
    if match:
        print(f"Née : {match.group(1).replace('.', '/')}")

    # Taille
    match = re.search(r"Taille\s*([0-9][.,][0-9]{2})", text)
    if match:
        print(f"Taille : {match.group(1).replace(',', '.')} m")


def getInfosVersoID(text):
    print("\n--- Infos Carte Identité Verso ---\n")

    text = text.replace("Carte valablejusqu'au", "Carte valable jusqu'au")
    text = text.replace("delivreele", "délivrée le")
    text = text.replace("Adresse.:", "Adresse:")
    text = text.replace("Adresse.", "Adresse:")
    text = text.replace("LaPrefete", "La Préfète")
    text = text.replace("Par", "par")


    address_pattern = r"Adresse[:\s]*([0-9A-Z\- ]+)"
    address_match = re.search(address_pattern, text, re.IGNORECASE)
    if address_match:
        adresse = address_match.group(1)
        adresse = re.sub(r"(\d{5})([A-Z])", r"\1 \2", adresse)
        print(f"Adresse : {adresse.strip().title()}")

    # Date de validité
    validity_pattern = r"valable.*?(\d{2}[./-]\d{2}[./-]\d{4})"
    valid_match = re.search(validity_pattern, text)
    if valid_match:
        print(f"Date de validité : {valid_match.group(1).replace('.', '/')}")

    # Date de délivrance
    issued_pattern = r"délivrée\s*le\s*(\d{2}[./-]\d{2}[./-]\d{4})"
    issued_match = re.search(issued_pattern, text)
    if issued_match:
        print(f"Délivrée le : {issued_match.group(1).replace('.', '/')}")

    # Autorité
    by_pattern = r"par\s*([A-Z\s\-]+)"
    by_match = re.search(by_pattern, text, re.IGNORECASE)
    if by_match:
        print(f"Délivrée par : {by_match.group(1).strip().title()}")





def main(image_path, doc_type):
    corrected_image = correct_orientation(image_path)
    text = extract_text_paddleocr(corrected_image)

    print("\n=== TEXTE OCR ===\n")
    print(text)

    if doc_type == "P":
        getInfosPrescription(text)
    elif doc_type == "R":
        getInfosRectoID(text)
    elif doc_type == "V":
        getInfosVersoID(text)
    else:
        print("Type inconnu. Utilisez P, R ou V.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Utilisation : python3 script.py <image_path> <P|R|V>")
        sys.exit(1)

    img_path = sys.argv[1]
    doc_type = sys.argv[2].upper()
    main(img_path, doc_type)
