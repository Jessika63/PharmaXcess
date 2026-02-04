
#!/usr/bin/env python3
import sys, os, re, json, tempfile, time, base64
import numpy as np
import unicodedata
import cv2
import requests
from typing import List, Dict, Any, Optional, Tuple

try:
    from doctr.models import ocr_predictor  # type: ignore
    from doctr.io import DocumentFile  # type: ignore
except Exception:
    class _MissingDoctrPredictor:
        def __call__(self, *args, **kwargs):
            raise ImportError("python-doctr is not installed")

    def ocr_predictor(*args, **kwargs):
        return _MissingDoctrPredictor()

    class DocumentFile:
        @staticmethod
        def from_images(path):
            return path

def normalize_text(text):
    """Normalise le texte pour faciliter le parsing"""
    text = text.replace(":", ": ")
    text = text.lower()
    text = ''.join(c for c in unicodedata.normalize('NFD', text) 
                   if unicodedata.category(c) != 'Mn')
    text = re.sub(r"\s+", " ", text)
    return text

def isPrescription(text):
    """Détecte si le texte correspond à une ordonnance"""
    keywords = ["RPPS", "ordonnance", "prescription", "mg", "comprimé", 
                "solution", "capsule", "Dr ", "Le ", "M.", "Mme.", "né(e)"]
    text_lower = text.lower()
    score = sum(1 for k in keywords if k in text_lower)
    return score >= 3

def isRectoID(text):
    """Détecte si le texte correspond au recto d'une carte d'identité"""
    keywords = ["Nationalité", "Nom", "Prénoms", "Sexe", "Née le", "Taille",
                "CARTE NATIONALE", "No", "Date de naissance"]
    text_lower = text.lower()
    score = sum(1 for k in keywords if k.lower() in text_lower)
    return score >= 3

def isVersoID(text):
    """Détecte si le texte correspond au verso d'une carte d'identité"""
    keywords = ["Adresse", "délivrée le", "Carte valable jusqu'au", 
                "Carte nationale", "par", "Signature de lautorité", "valable"]
    text_lower = text.lower()
    score = sum(1 for k in keywords if k.lower() in text_lower)
    return score >= 3

def extract_doctor_info(text):
    """Extraction améliorée des informations du médecin"""
    infos = {}
    
    # Pattern pour le nom du médecin
    doctor_pattern = r"Dr\s+([A-Za-zÀ-ÿ]+)\s+([A-Za-zÀ-ÿ]+)"
    doctors = re.findall(doctor_pattern, text)
    
    if doctors:
        firstname, lastname = doctors[0]
        infos["prenom"] = firstname.capitalize()
        infos["nom"] = lastname.capitalize()
        
        # Recherche de la spécialité
        # Chercher sur plusieurs lignes après le nom
        lines = text.split('\n')
        found_doctor = False
        specialty = "Médecin généraliste"  # Valeur par défaut
        
        for i, line in enumerate(lines):
            if f"Dr {firstname} {lastname}" in line or f"Dr {lastname}" in line:
                found_doctor = True
                # Chercher la spécialité dans les lignes suivantes
                for j in range(i+1, min(i+4, len(lines))):
                    specialty_line = lines[j].strip()
                    # Chercher des mots-clés de spécialité
                    specialty_keywords = {
                        "MÉDECIN GENERALISTE": "Médecin généraliste",
                        "GENERALISTE": "Médecin généraliste",
                        "CARDIOLOGUE": "Cardiologue",
                        "DERMATOLOGUE": "Dermatologue",
                        "PEDIATRE": "Pédiatre",
                        "GYNECOLOGUE": "Gynécologue",
                        "OPHTALMOLOGISTE": "Ophtalmologiste",
                        "PSYCHIATRE": "Psychiatre",
                        "RHUMATOLOGUE": "Rhumatologue",
                        "GASTRO": "Gastro-entérologue",
                        "PNEUMOLOGUE": "Pneumologue",
                        "ENDOCRINOLOGUE": "Endocrinologue"
                    }
                    
                    for key, value in specialty_keywords.items():
                        if key.lower() in specialty_line.lower():
                            specialty = value
                            break
                    if specialty != "Médecin généraliste":
                        break
        
        infos["specialite"] = specialty
    
    # Recherche du RPPS
    rpps_pattern = r"RPPS[:\s]*([0-9]{11})"
    rpps_match = re.search(rpps_pattern, text)
    if rpps_match:
        infos["rpps"] = rpps_match.group(1)
    
    # Adresse du médecin
    address_pattern = r"(\d{1,3}\s+[A-Za-zÀ-ÿ\s]+)\n(\d{5})\s+([A-Za-zÀ-ÿ\s]+)"
    address_match = re.search(address_pattern, text)
    if address_match:
        infos["adresse"] = address_match.group(1).title()
        infos["code_postal"] = address_match.group(2)
        infos["ville"] = address_match.group(3).title()
    
    return infos

def extract_patient_info(text):
    """Extraction améliorée des informations du patient"""
    infos = {}
    
    # Pattern pour le patient
    patient_pattern = r"(?:M\.|Mme\.|M\s|Mme\s)[^\S\r\n]*([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ-]+)[^\S\r\n]+([A-Za-zÀ-ÖØ-öø-ÿ'’-]+)"
    patient_match = re.search(patient_pattern, text)
    
    if patient_match:
        last_name = patient_match.group(1)
        first_name = patient_match.group(2)
        infos["nom"] = last_name.capitalize()
        infos["prenom"] = first_name.capitalize()
    
    # Date de naissance
    birth_pattern = r"Ne?e?\(?e?\)?\s*le\s*[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{4})"
    birth_match = re.search(birth_pattern, text, re.IGNORECASE)
    if birth_match:
        infos["date_naissance"] = birth_match.group(1).replace('.', '/')
    
    # Taille et poids
    taille_pattern = r"(\d{3})\s*cm"
    poids_pattern = r"(\d{2,3})\s*kg"
    
    taille_match = re.search(taille_pattern, text)
    poids_match = re.search(poids_pattern, text)
    
    if taille_match:
        infos["taille"] = f"{taille_match.group(1)} cm"
    if poids_match:
        infos["poids"] = f"{poids_match.group(1)} kg"
    
    return infos

def extract_medications(text):
    """Extraction améliorée des médicaments"""
    medications = []
    
    # Normaliser le texte pour le parsing
    normalized = text.replace('\n', ' ').replace('  ', ' ')
    
    # Pattern pour détecter les médicaments (plus robuste)
    # Cherche des combinaisons de mots en majuscules suivis de dosages
    medication_patterns = [
        r'([A-Z][A-Z\s-]{3,}?\d+[\s-]*(?:mg|g|ml|µg|UI|%|cp|comprimé|gelule|capsule|suppositoire|ampoule))\s+(.*?)(?=(?:[A-Z][A-Z\s-]{3,}?\d+|$))',
        r'([A-Z][A-Za-z\s-]{3,}?)\s+(\d+[\s-]*(?:mg|g|ml|µg|UI|%).*?)(?=(?:[A-Z][A-Za-z\s-]{3,}|$))',
        r'^([A-Z][A-Za-z\s-]{10,})\s+(.*)'
    ]
    
    for pattern in medication_patterns:
        matches = re.findall(pattern, normalized, re.IGNORECASE)
        for match in matches:
            if len(match) == 2:
                nom, posologie = match
                
                # Nettoyer le nom du médicament
                nom = re.sub(r'\s+', ' ', nom).strip()
                # Enlever les mentions entre parenthèses (nom commercial)
                nom = re.sub(r'\([^)]*\)', '', nom).strip()
                # Garder seulement la partie avant le dosage si présente
                nom = re.split(r'\d+[\s-]*(?:mg|g|ml|µg|UI|%)', nom)[0].strip()
                
                # Nettoyer la posologie
                posologie = re.sub(r'\s+', ' ', posologie).strip()
                # Extraire la fréquence si disponible
                freq_patterns = [
                    r'(\d+\s+fois\s+par\s+(?:jour|semaine|mois))',
                    r'(matin\s+et\s+soir)',
                    r'(par\s+(?:jour|semaine|mois))',
                    r'(\d+\s+(?:comprimé|cp|goutte|sachet|gelule|dose))'
                ]
                
                frequency = ""
                for freq_pattern in freq_patterns:
                    freq_match = re.search(freq_pattern, posologie, re.IGNORECASE)
                    if freq_match:
                        frequency = freq_match.group(1)
                        break
                
                # Si pas de fréquence trouvée, prendre les premiers mots
                if not frequency and len(posologie.split()) > 0:
                    words = posologie.split()
                    frequency = ' '.join(words[:min(4, len(words))])
                
                # Filtrer les faux positifs
                if len(nom) < 3 or nom.isdigit():
                    continue
                
                # Éviter les doublons
                existing = any(m['nom'] == nom for m in medications)
                if not existing:
                    medications.append({
                        'nom': nom,
                        'posologie': frequency or posologie[:50]
                    })
    
    # Si peu de médicaments trouvés, utiliser une méthode alternative
    if len(medications) < 2:
        # Chercher des lignes contenant des noms de médicaments connus
        known_meds = ['PARACETAMOL', 'IBUPROFENE', 'AMOXICILLINE', 'DICLOFENAC',
                     'LORATADINE', 'DESLORATADINE', 'OMEPRAZOLE', 'SIMVASTATINE',
                     'METFORMINE', 'INSULINE', 'PREDNISONE', 'DEXAMETHASONE',
                     'SPASFON', 'SMECTA', 'DOLIPRANE', 'EFFERALGAN']
        
        lines = text.split('\n')
        for line in lines:
            line_upper = line.upper()
            for med in known_meds:
                if med in line_upper:
                    # Extraire la posologie
                    pos_match = re.search(r'(\d+[\s-]*(?:mg|g|ml|cp|comprimé).*?)', line, re.IGNORECASE)
                    posologie = pos_match.group(1) if pos_match else ""
                    
                    medications.append({
                        'nom': med.capitalize(),
                        'posologie': posologie[:50] if posologie else ""
                    })
                    break
    
    # Dédupliquer
    unique_meds = []
    seen = set()
    for med in medications:
        if med['nom'] not in seen:
            seen.add(med['nom'])
            unique_meds.append(med)
    
    return unique_meds[:10]  # Limiter à 10 médicaments

def extract_prescription_date(text):
    """Extrait la date de prescription"""
    date_patterns = [
        r"Le\s+(\d{1,2}\s+[a-zéû]+\s+\d{4})",
        r"Le\s+(\d{1,2}[./-]\d{1,2}[./-]\d{4})",
        r"Date[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{4})"
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return ""

def filter_invalid_medications(medicaments):
    """Filter out invalid medications (common OCR errors)"""
    filtered = []
    invalid_keywords = [
        "selarl", "sarl", "sas", "eurl", "dr ", "docteur", "cabinet",
        "neurologie", "cardiologie", "dermatologie", "ophtalmologie",
        "médecin", "medecin", "chirurgien", "hopital", "clinique",
        "rue ", "avenue", "boulevard", "place ", "centre", "rcs",
        "honoraires", "contact", "tel", "mail", "fax", "email",
        "règlement", "carte", "chèque", "doctolib"
    ]
    
    for med in medicaments:
        nom = (med.get("nom") or "").strip()
        posologie = (med.get("posologie") or "").strip()
        
        # Skip if no name OR no posology
        if not nom or not posologie:
            continue
            
        # Skip if it looks like a doctor's name, company name, or address
        if any(kw in nom.lower() for kw in invalid_keywords):
            continue
            
        filtered.append(med)
    
    return filtered

def getInfosPrescription(text):
    """Extraction principale des informations d'ordonnance"""
    infos = {}
    
    # 1. Informations du médecin
    doctor_info = extract_doctor_info(text)
    if doctor_info:
        infos["medecin"] = doctor_info
    
    # 2. Date de prescription
    prescription_date = extract_prescription_date(text)
    if prescription_date:
        infos["date_prescription"] = prescription_date
    
    # 3. Informations du patient
    patient_info = extract_patient_info(text)
    if patient_info:
        infos["patient"] = patient_info
    
    # 4. Médicaments
    medications = extract_medications(text)
    if medications:
        # Filter out invalid medications
        medications = filter_invalid_medications(medications)
        infos["medicaments"] = medications
    
    # 5. Spécialité (récupérée du médecin)
    if "medecin" in infos and "specialite" in infos["medecin"]:
        infos["specialite"] = infos["medecin"]["specialite"]
    
    return infos

def getInfosRectoID(text):
    """Extraction améliorée des informations du recto de la carte d'identité"""
    infos = {}
    
    # Nettoyage du texte
    text = text.replace("Mationalite", "Nationalité") \
               .replace("Francaise", "Française") \
               .replace("TM Nom:", "Nom:") \
               .replace("Prénom(s):", "Prénoms:") \
               .replace("Né(e) le", "Né(e) le:") \
               .replace("Taille", "Taille:") \
               .replace("Sexe :", "Sexe:") \
               .replace("à:", "lieu_naissance:")
    
    # Numéro de carte
    match = re.search(r"CARTE NATIONALE D'IDENTITE\s+No[:\s]*([0-9A-Z]+)", text, re.IGNORECASE)
    if match:
        infos["numero_carte"] = match.group(1).strip()
    
    # Nationalité
    match = re.search(r"Nationalité[:\s]*([A-Za-zéÉèàêâîç]+)", text)
    if match:
        infos["nationalite"] = match.group(1).strip()
    
    # Nom
    match = re.search(r"Nom[:\s]*([A-Z]+)", text)
    if match:
        infos["nom"] = match.group(1).capitalize()
    
    # Prénoms
    match = re.search(r"Prénoms[:\s]*([A-Z\s]+)", text)
    if match:
        raw = match.group(1).strip()
        prenoms = [p.capitalize() for p in raw.split() if len(p) > 1]
        infos["prenoms"] = prenoms
    
    # Sexe
    match = re.search(r"Sexe[:\s]*([MF])", text)
    if match:
        infos["sexe"] = "Homme" if match.group(1) == "M" else "Femme"
    
    # Date de naissance
    match = re.search(r"Né\(e\) le[:\s]*([0-9]{2}[./-][0-9]{2}[./-][0-9]{4})", text)
    if match:
        infos["date_naissance"] = match.group(1).replace('.', '/')
    
    # Lieu de naissance
    match = re.search(r"lieu_naissance[:\s]*([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ\s\-]+)", text)
    if match:
        raw_lieu = match.group(1).strip()
        raw_lieu = re.split(r'\s*\n', raw_lieu)[0]
        infos["lieu_naissance"] = raw_lieu.title()
    
    # Taille
    match = re.search(r"Taille[:\s]*([0-9][.,]?[0-9]{1,2})", text)
    if match:
        infos["taille"] = match.group(1).replace(',', '.')
    
    return infos

def getInfosVersoID(text):
    """Extraction améliorée des informations du verso de la carte d'identité"""
    infos = {}
    
    # Nettoyage du texte
    text = text.replace("Carte valablejusqu'au", "Carte valable jusqu'au") \
               .replace("delivreele", "délivrée le") \
               .replace("Adresse.:", "Adresse:") \
               .replace("Adresse.", "Adresse:") \
               .replace("LaPrefete", "La Préfète") \
               .replace("LePrefet", "Le Préfèt") \
               .replace("par:", "par:") \
               .replace("Signature de lautorité", "signature_autorite")
    
    # Adresse
    address_match = re.search(
        r"Adresse[:\s]*([0-9A-Z\s\-]+)\s*\n\s*(\d{5})\s*([A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ\s\-]+)",
        text, re.IGNORECASE
    )
    if address_match:
        infos["adresse"] = address_match.group(1).title().strip()
        infos["code_postal"] = address_match.group(2)
        infos["ville"] = address_match.group(3).split('\n')[0].title().strip()
    
    # Date de validité
    valid_match = re.search(r"valable.*?(\d{2}[./-]\d{2}[./-]\d{4})", text)
    if valid_match:
        infos["date_validite"] = valid_match.group(1).replace('.', '/')
    
    # Date de délivrance
    issued_match = re.search(r"délivrée le[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})", text)
    if issued_match:
        infos["date_delivrance"] = issued_match.group(1).replace('.', '/')
    
    # Autorité
    by_match = re.search(r"par[:\s]*(.+)", text, re.IGNORECASE)
    if by_match:
        autorite = by_match.group(1).split('\n')[0].strip()
        infos["autorite"] = autorite.title()
    
    # Signature
    sig_match = re.search(r"signature_autorite[:\s]*(.+)", text, re.IGNORECASE | re.DOTALL)
    if sig_match:
        signature = sig_match.group(1).strip()
        infos["signature_autorite"] = " ".join([line.strip() for line in signature.splitlines() if line.strip()])
    
    return infos

def main(image_input, doc_type, from_base64=False, flip_horizontal=False):
    """
    Extract text from image using Doctr OCR and return JSON with infos.
    """
    result = {"success": False, "raw_text": "", "infos": {}, "error": ""}
    
    try:
        # Chargement de l'image
        if from_base64:
            if isinstance(image_input, (bytes, bytearray)):
                image_data = bytes(image_input)
            elif isinstance(image_input, str):
                b64_payload = image_input.split(",")[-1]
                image_data = base64.b64decode(b64_payload)
            else:
                raise TypeError("Unsupported image_input type for base64 mode")
            
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
        
        # Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name
            cv2.imwrite(tmp_path, img)
        
        # OCR avec Doctr
        predictor = ocr_predictor(pretrained=True)
        doc = DocumentFile.from_images(tmp_path)
        ocr_result = predictor(doc)
        
        # Extraction du texte
        lines = []
        for page in ocr_result.pages:
            for block in page.blocks:
                for line in block.lines:
                    line_text = " ".join([word.value for word in line.words])
                    lines.append(line_text)
        
        text = "\n".join(lines).strip()
        result["raw_text"] = text
        
        # Validation et extraction selon le type de document
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
        
        # Gestion des erreurs
        if not text or text == "\n":
            result["error"] = "Veuillez insérer votre document."
        elif not valid:
            result["error"] = "Le document inséré est invalide ou ne correspond pas au type attendu."
        
        result["success"] = valid
        result["infos"] = infos
        
        # Nettoyage du fichier temporaire
        try:
            os.unlink(tmp_path)
        except:
            pass
        
        return result
        
    except Exception as e:
        result["error"] = str(e)
        import traceback
        print(f"Error in main: {traceback.format_exc()}")
        return result

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extractAll.py <image_path> <doc_type>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    doc_type = sys.argv[2]
    
    output = main(image_path, doc_type)
    print(json.dumps(output, ensure_ascii=False, indent=2))
