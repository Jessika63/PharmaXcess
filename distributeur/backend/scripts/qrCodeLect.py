import cv2
from pyzbar.pyzbar import decode
import unicodedata
import requests
import json
import sys

def lire_qr_code(nom_fichier_qr):
    """
    Lit et décode un QR Code à partir d'une image, en gérant les caractères spéciaux.

    :param nom_fichier_qr: Le chemin vers le fichier contenant le QR Code.
    :return: Le contenu décodé du QR Code (en JSON ou texte brut).
    """
    # Charger l'image contenant le QR Code
    image = cv2.imread(nom_fichier_qr)

    if image is None:
        print(f"Erreur : Impossible de charger l'image '{nom_fichier_qr}'.")
        return None

    # Décoder les QR Codes présents dans l'image
    qr_codes = decode(image)

    if not qr_codes:
        print("Aucun QR Code détecté dans l'image.")
        return None

    # Traiter chaque QR Code détecté
    for qr_code in qr_codes:
        # Décodage initial avec gestion explicite des erreurs
        raw_data = qr_code.data
        try:
            # Tenter de décoder directement en UTF-8
            data = raw_data.decode("utf-8")
        except UnicodeDecodeError:
            # Normaliser et remplacer les caractères incorrects si nécessaire
            data = raw_data.decode("latin1").encode("utf-8").decode("utf-8")

        # Normaliser le texte (utile si des formes combinées Unicode sont présentes)
        data = unicodedata.normalize("NFKC", data)

        print("Contenu du QR Code :")
        print(data)
        return data

    return None

def verifier_medecin(contenu_qr):
    """
    Vérifie les informations du médecin via une API.

    :param contenu_qr: Contenu décodé du QR Code (JSON ou texte brut).
    """
    try:
        # Supposons que le contenu est en JSON, sinon, cela provoquera une exception.

        infos = json.loads(contenu_qr)
        medecin = infos.get("medecin", {})
        prenom = medecin.get("prenom")
        nom = medecin.get("nom")

        if not prenom or not nom:
            print("Les informations du médecin sont manquantes dans le QR Code.")
            return

        # Construire l'URL de l'API avec les paramètres
        url = f"http://localhost:5000/find_doctor_by_name?first_name={prenom}&last_name={nom}"

        # Effectuer la requête GET
        response = requests.get(url)

        if response.status_code == 200:
            print("Résultat de l'API :")
            print(response.json())
        else:
            print(f"Erreur API : {response.status_code} - {response.text}")

    except json.JSONDecodeError:
        print("Le contenu du QR Code n'est pas en format JSON valide.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 code.py <chemin_du_qrcode>")
        sys.exit(1)

    nom_fichier = sys.argv[1]
    contenu = lire_qr_code(nom_fichier)
    if contenu:
        verifier_medecin(contenu)
