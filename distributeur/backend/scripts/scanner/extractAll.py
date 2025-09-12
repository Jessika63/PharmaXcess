#!/usr/bin/env python3
import sys, os, re, json, tempfile, time, base64
import numpy as np
import unicodedata
import cv2

from doctr.models import ocr_predictor
from doctr.io import DocumentFile


def normalize_text(text):
    text = text.replace(":", ": ")
    text = text.lower()
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    text = re.sub(r"\s+", " ", text)
    return text


def isPrescription(text):
    keywords = ["RPPS", "ordonnance", "prescription", "mg", "comprimé", "solution", "capsule", "Dr "]
    score = sum(1 for k in keywords if k.lower() in text.lower())
    return score >= 2

def isRectoID(text):
    keywords = ["Nationalité", "Nom", "Prénoms", "Sexe", "Née le", "Taille"]
    score = sum(1 for k in keywords if k.lower() in text.lower())
    return score >= 3

def isVersoID(text):
    keywords = ["Adresse", "délivrée le", "Carte valable jusqu'au", "Carte nationale", "par", "Signature de lautorité"]
    score = sum(1 for k in keywords if k.lower() in text.lower())
    return score >= 3


def getInfosPrescription(text):
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

    patient_pattern = r"(?:M\.|Mme\.)[^\S\r\n]+([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ]+)[^\S\r\n]+([A-Za-zÀ-ÖØ-öø-ÿ'’-]+)"
    patient = re.search(patient_pattern, text)
    if patient:
        last_name = patient.group(1)
        first_name = patient.group(2)
        infos["patient"] = {"prenom": first_name, "nom": last_name}

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
        if not capture_started or not line:
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
    infos = {}


    text = text.replace("Mationalite", "Nationalité").replace("Francaise", "Française") \
               .replace("TM Nom:", "Nom:").replace("Prénom(s):", "Prénoms:") \
               .replace("Né(e) le", "Né(e) le:").replace("Taille", "Taille:") \
               .replace("Sexe :", "Sexe:").replace("à:", "lieu_naissance:")


    match = re.search(r"CARTE NATIONALE D'IDENTITE\s+No[:\s]*([0-9A-Z]+)", text, re.IGNORECASE)
    if match:
        infos["numero_carte"] = match.group(1).strip()


    match = re.search(r"Nationalité[:\s]*([A-Za-zéÉèàêâîç]+)", text)
    if match:
        infos["nationalite"] = match.group(1).strip()


    match = re.search(r"Nom[:\s]*([A-Z]+)", text)
    if match:
        infos["nom"] = match.group(1).capitalize()


    match = re.search(r"Prénoms[:\s]*([A-Z\s]+)", text)
    if match:
        raw = match.group(1).strip()

        prenoms = [p.capitalize() for p in raw.split() if len(p) > 1]
        infos["prenoms"] = prenoms


    match = re.search(r"Sexe[:\s]*([MF])", text)
    if match:
        infos["sexe"] = "Homme" if match.group(1) == "M" else "Femme"


    match = re.search(r"Né\(e\) le[:\s]*([0-9]{2}[./-][0-9]{2}[./-][0-9]{4})", text)
    if match:
        infos["date_naissance"] = match.group(1).replace('.', '/')


    match = re.search(r"lieu_naissance[:\s]*([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ\s\-]+)", text)
    if match:
        raw_lieu = match.group(1).strip()

        raw_lieu = re.split(r'\s*\n', raw_lieu)[0]
        infos["lieu_naissance"] = raw_lieu.title()


    match = re.search(r"Taille[:\s]*([0-9][.,]?[0-9]{1,2})", text)
    if match:
        infos["taille"] = match.group(1).replace(',', '.')
        
    return infos


def getInfosVersoID(text):
    infos = {}

    text = text.replace("Carte valablejusqu'au", "Carte valable jusqu'au") \
               .replace("delivreele", "délivrée le") \
               .replace("Adresse.:", "Adresse:") \
               .replace("Adresse.", "Adresse:") \
               .replace("LaPrefete", "La Préfète") \
               .replace("LePrefet", "Le Préfèt") \
               .replace("par:", "par:") \
               .replace("Signature de lautorité", "signature_autorite")


    address_match = re.search(
        r"Adresse[:\s]*([0-9A-Z\s\-]+)\s*\n\s*(\d{5})\s*([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ\s\-]+)",
        text, re.IGNORECASE
    )
    if address_match:
        infos["adresse"] = address_match.group(1).title().strip()
        infos["code_postal"] = address_match.group(2)

        infos["ville"] = address_match.group(3).split('\n')[0].title().strip()


    valid_match = re.search(r"valable.*?(\d{2}[./-]\d{2}[./-]\d{4})", text)
    if valid_match:
        infos["date_validite"] = valid_match.group(1).replace('.', '/')


    issued_match = re.search(r"délivrée le[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})", text)
    if issued_match:
        infos["date_delivrance"] = issued_match.group(1).replace('.', '/')


    by_match = re.search(r"par[:\s]*(.+)", text, re.IGNORECASE)
    if by_match:
        autorite = by_match.group(1).split('\n')[0].strip()
        infos["autorite"] = autorite.title()


    sig_match = re.search(r"signature_autorite[:\s]*(.+)", text, re.IGNORECASE | re.DOTALL)
    if sig_match:
        signature = sig_match.group(1).strip()
        infos["signature_autorite"] = " ".join([line.strip() for line in signature.splitlines() if line.strip()])

    return infos




def flip_image(input_path, flip_code=1):
    """ Flip the image and save the result """
    image = cv2.imread(input_path)
    if image is None:
        raise FileNotFoundError(f"Could not read the image at {input_path}")
    flipped = cv2.flip(image, flip_code)
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    cv2.imwrite(tmp_file.name, flipped)
    return tmp_file.name

def verify_doctor(first_name, last_name):
    try:
        url = "http://localhost:5000/find_doctor_by_name"
        params = {"last_name": last_name}
        if first_name:
            params["first_name"] = first_name
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and data:
                return True, data
            return False, {"error": "Doctor not found", "data": data}
        return False, {"error": f"API error {resp.status_code}"}
    except Exception as e:
        return False, {"error": str(e)}




def main(image_input, doc_type, from_base64=False, flip_horizontal=False):
    """
    Extract text from image using Doctr OCR and return JSON with infos.
    """
    result = {"success": False, "raw_text": "", "infos": {}, "error": ""}

    try:

        if from_base64:
            image_data = base64.b64decode(image_input.split(",")[-1])
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            if not os.path.exists(image_input):
                result["error"] = f"File '{image_input}' does not exist"
                return result
            img = cv2.imread(image_input)

        if img is None:
            result["error"] = "Cannot read image file"
            return result

        if flip_horizontal:
            img = cv2.flip(img, 1)


        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name
            cv2.imwrite(tmp_path, img)


        predictor = ocr_predictor(pretrained=True)
        doc = DocumentFile.from_images(tmp_path)
        ocr_result = predictor(doc)

        lines = []
        for page in ocr_result.pages:
            for block in page.blocks:
                for line in block.lines:
                    line_text = " ".join([word.value for word in line.words])
                    lines.append(line_text)

        text = "\n".join(lines).strip()
        result["raw_text"] = text
        
        
        print("OCR result text:", text[:200], flush=True)


        valid = False
        infos = {}

        if doc_type.upper() == "P":
            valid = isPrescription(text)
            if valid:
                infos = getInfosPrescription(text)
        elif doc_type.upper() == "R":
            valid = isRectoID(text)
            if valid:
                infos = getInfosRectoID(text)
        elif doc_type.upper() == "V":
            valid = isVersoID(text)

            if valid:
                infos = getInfosVersoID(text)


        if not valid:
            result["error"] = f"The provided document does not match the expected type '{doc_type}'."


        result["success"] = valid
        result["infos"] = infos

        return result
        
    except Exception as e:
        result["error"] = str(e)
        print("result", result)
        return None




if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extractAll.py <image_path> <doc_type>")
        sys.exit(1)

    image_path = sys.argv[1]
    doc_type = sys.argv[2] 

    output = main(image_path, doc_type)
    print(json.dumps(output, ensure_ascii=False, indent=2))
