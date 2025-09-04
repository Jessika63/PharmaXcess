import cv2
import numpy as np
import re
import sys
import json
import unicodedata
import requests
import tempfile
from paddleocr import PaddleOCR

# -----------------------------
# Utilities
# -----------------------------
def add_background(img, scale_factor=1.5):
    if img is None:
        raise ValueError("Input image is None")
    h, w, _ = img.shape
    new_h = int(h * scale_factor)
    new_w = int(w * scale_factor)
    bg = np.ones((new_h, new_w, 3), dtype=np.uint8) * 255
    sy = (new_h - h) // 2
    sx = (new_w - w) // 2
    bg[sy:sy+h, sx:sx+w] = img
    return bg

def normalize_text(text):
    # Fix OCR issues with missing spaces and accents
    text = text.replace(":", ": ")
    text = text.lower()
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    text = re.sub(r"\s+", " ", text)
    return text

# -----------------------------
# Document type detection
# -----------------------------
def isPrescription(text):
    text_norm = normalize_text(text)
    keyword_groups = [
        ["rpps"], ["ordonnance", "prescription"], ["comprime", "comprimes", "cp"],
        ["capsule"], ["solution", "sol"], ["pommade"], ["sirop"], 
        ["dr ", "docteur", "medecin"], ["patient"], ["posologie"],
        ["mg", "ml", "dosage"], ["pulverisation", "pulv", "spray"]
    ]
    score = sum(1 for group in keyword_groups if any(kw in text_norm for kw in group))
    return score >= 4

def isRectoID(text):
    text_norm = normalize_text(text)
    keyword_groups = [
        ["nationalite"], ["nom"], ["prenoms", "prenom"], ["sexe"],
        ["nee le", "n6ele", "date de naissance"], ["taille"], ["carte nationale"]
    ]
    score = sum(1 for group in keyword_groups if any(kw in text_norm for kw in group))
    return score >= 3  # Plus tolérant pour l'OCR

def isVersoID(text):
    text_norm = normalize_text(text)
    keyword_groups = [
        ["adresse"], ["delivree", "delivreele", "délivrée"], ["valable"],
        ["carte"], ["par", "prefecture", "autorite", "autorité"], ["signature"]
    ]
    score = sum(1 for group in keyword_groups if any(kw in text_norm for kw in group))
    return score >= 3

# -----------------------------
# API verification
# -----------------------------
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

# -----------------------------
# Information extraction
# -----------------------------
def getInfosPrescription(text):
    infos = {}
    m_doc = re.search(r"Dr\s+([A-ZÉÈÊÂÎÔÛÄËÏÖÜ][A-Za-zÀ-ÿ'\- ]+)", text)
    if m_doc:
        parts = m_doc.group(1).split()
        infos["doctor_first_name"] = parts[0]
        infos["doctor_last_name"] = parts[-1]
    m_rpps = re.search(r"RPPS[:\s]*([0-9]{6,})", text, re.IGNORECASE)
    if m_rpps: infos["rpps"] = m_rpps.group(1)
    meds = [line.strip() for line in text.splitlines() if any(u in line.lower() for u in ["mg","g","cp","ml","sol","pulv","sirop","pommade"])]
    if meds: infos["medicaments"] = meds

    if "doctor_last_name" in infos:
        ok, data = verify_doctor(infos.get("doctor_first_name",""), infos["doctor_last_name"])
        infos["doctor_verified"] = ok
        infos["doctor_data"] = data
    else:
        infos["doctor_verified"] = False
        infos["doctor_data"] = {"error":"Doctor not detected"}
    return infos

def getInfosRectoID(text: str) -> dict:
    """
    Extracts key information from the front of a French ID card.
    Returns a dictionary with fields and identity verification status.
    """
    infos = {}

    # Normalize OCR text a bit more for extraction
    text = text.replace(":", ": ").replace("\n", " ")

    # Nationality
    m_nat = re.search(r"Nationalit[eé]\s*[:]? ?([A-Za-z]+)", text, re.IGNORECASE)
    if m_nat:
        infos["nationalite"] = m_nat.group(1).capitalize()

    # Last name
    m_nom = re.search(r"Nom\s*[:]? ?([A-Z][A-Z\-]+)", text)
    if m_nom:
        infos["nom"] = m_nom.group(1).strip()

    # First name(s) (allowing hyphens and uppercase letters)
    m_prenoms = re.search(r"Prenom\(s\)?\s*[:]? ?([A-Z\-]+)", text)
    if m_prenoms:
        infos["prenoms"] = m_prenoms.group(1).replace("-", "")

    # Birth date (OCR-tolerant)
    m_dn = re.search(r"N[6eé]\(?.*?\)?le\s*[:]? ?(\d{2}[./]\d{2}[./]\d{4})", text, re.IGNORECASE)
    if m_dn:
        infos["nee_le"] = m_dn.group(1)

    # Sex
    m_sexe = re.search(r"Sexe\s*[:]? ?(M|F)", text)
    if m_sexe:
        infos["sexe"] = m_sexe.group(1)

    # Birth place (OCR-tolerant)
    m_lieu = re.search(r"a\s*[:]? ?([A-Z\- ]+)", text)
    if m_lieu:
        infos["lieu"] = m_lieu.group(1).title()

    # Height
    m_taille = re.search(r"Taille[^\d]*(\d\.\d{2}m)", text)
    if m_taille:
        infos["taille"] = m_taille.group(1)

    # Fill identity_verified
    required_fields = ["nom", "prenoms", "nee_le", "sexe"]
    infos["identity_verified"] = all(f in infos for f in required_fields)

    return infos

def getInfosVersoID(text: str) -> dict:
    infos = {}
    match_addr = re.search(r"^(\d+\s*[A-Z\s]+)", text, re.MULTILINE)
    infos["adresse_complete"] = match_addr.group(1).strip() if match_addr else ""
    match_cp_ville = re.search(r"(\d{5})([A-Z\- ]+)", text)
    if match_cp_ville:
        infos["code_postal"] = match_cp_ville.group(1)
        infos["ville"] = match_cp_ville.group(2).strip()
    else:
        infos["code_postal"] = ""
        infos["ville"] = ""
    match_val = re.search(r"Carte valable.*?(\d{2}\.\d{2}\.\d{4})", text)
    if match_val: infos["valable_jusquau"] = match_val.group(1)
    match_deliv = re.search(r"delivreele\s*(\d{2}\.\d{2}\.\d{4})", text, re.IGNORECASE)
    if match_deliv: infos["delivree_le"] = match_deliv.group(1)
    match_auth = re.search(r"Par\s*([A-Z\s\-0-9]+)", text)
    if match_auth: infos["autorite"] = match_auth.group(1).strip()
    return infos

# -----------------------------
# Main pipeline
# -----------------------------
def main(image_input, doc_type, is_bytes=False, flip_horizontal=False):
    import cv2
    import numpy as np
    import tempfile
    from paddleocr import PaddleOCR

    # --- Load image ---
    if is_bytes:
        nparr = np.frombuffer(image_input, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        img = cv2.imread(image_input)
    if flip_horizontal:
        img = cv2.flip(img, 1)

    # --- Add white background and resize ---
    img = add_background(img)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    # --- Orientation correction ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(gray, 50, 150, 3)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=100, maxLineGap=10)
    if lines is not None:
        angles = [np.arctan2(y2-y1, x2-x1) * 180 / np.pi for x1, y1, x2, y2 in lines[:, 0]]
        median_angle = np.median(angles)
        if median_angle != 0:
            h, w = img.shape[:2]
            M = cv2.getRotationMatrix2D((w // 2, h // 2), median_angle, 1.0)
            img = cv2.warpAffine(img, M, (w, h))

    # --- OCR ---
    ocr = PaddleOCR(lang='fr')

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        cv2.imwrite(tmp.name, img)
        tmp_path = tmp.name

    res = ocr.ocr(tmp_path)

    # --- Parsing text ---
    text = "\n".join([word_info[1][0] for line in res for word_info in line])

    # --- Document type detection ---
    infos = {}
    valid = False
    if doc_type == "P":
        valid = isPrescription(text)
        infos = getInfosPrescription(text) if valid else {}
    elif doc_type == "R":
        valid = isRectoID(text)
        infos = getInfosRectoID(text) if valid else {}
    elif doc_type == "V":
        valid = isVersoID(text)
        infos = getInfosVersoID(text) if valid else {}

    if not valid:
        return {"raw_text": text, "error": f"The provided document does not match the expected type '{doc_type}'."}
    return {"raw_text": text, "infos": infos}


# -----------------------------
# CLI
# -----------------------------
if __name__=="__main__":
    if len(sys.argv) != 3: sys.exit(1)
    img_path = sys.argv[1]
    doc_type = sys.argv[2].upper()
    result = main(img_path, doc_type)
    print(json.dumps(result, ensure_ascii=False, indent=2))
