import qrcode
import json
import os
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask

def trouver_nom_fichier_unique(base_nom, extension=".png"):
    """
    Trouve un nom de fichier unique en incrémentant un compteur si nécessaire.

    :param base_nom: Le nom de base du fichier (sans numéro ni extension).
    :param extension: L'extension du fichier.
    :return: Un nom de fichier unique sous la forme base_nom_num.extension.
    """
    compteur = 1
    while True:
        nom_fichier = f"{base_nom}_{compteur}{extension}"
        if not os.path.exists(nom_fichier):
            return nom_fichier
        compteur += 1

def generer_qr_code_arrondi(informations, base_nom_fichier="ordonnance"):
    """
    Génère un QR code contenant les informations d'une ordonnance, avec des modules arrondis.

    :param informations: Dictionnaire contenant les informations de l'ordonnance.
    :param base_nom_fichier: Le nom de base pour enregistrer le QR code final.
    """
    # Convertir les informations en JSON formaté
    contenu_json = json.dumps(informations, ensure_ascii=False, indent=4)

    # Créer un objet QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,  # Bonne correction d'erreur
        box_size=10,
        border=2,
    )

    # Ajouter les données au QR Code
    qr.add_data(contenu_json)
    qr.make(fit=True)

    # Générer une image stylisée pour le QR Code
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),  # Modules arrondis
        color_mask=RadialGradiantColorMask(  # Couleurs avec un gradient radial
            center_color=(0, 120, 215),  # Bleu foncé au centre
            edge_color=(135, 206, 250)   # Bleu clair vers les bords
        ),
    )

    # Trouver un nom de fichier unique
    nom_fichier_unique = trouver_nom_fichier_unique(base_nom_fichier)

    # Sauvegarder le QR Code généré
    img.save(nom_fichier_unique)
    print(f"QR Code sauvegardé sous le nom : {nom_fichier_unique}")

# Exemple d'informations d'ordonnance
informations_ordonnance = {
    "medecin": {
        "prenom": "MEDECIN",
        "nom": "TRES",
        "code_rpps": "213456345227625",
        "lieu": "QUELQUE PART"
    },
    "patient": {
        "nom": "TOI OUI",
        "age": 2155
    },
    "date": "2024-02-28",
    "contenu": [
        "Paracétamol 500mg - 1 comprimé toutes les 6 heures",
        "Amoxicilline 500mg - 1 gélule matin et soir pendant 7 jours"
    ]
}

# Générer le QR Code arrondi pour l'ordonnance
generer_qr_code_arrondi(informations_ordonnance)
