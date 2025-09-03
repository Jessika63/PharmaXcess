
from flask import Blueprint, request, jsonify, send_file
import json
from io import BytesIO
import sys
import os

# Ajouter le chemin des scripts pour pouvoir les importer
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from scripts.qrcode.qrCodeGen import generate_rounded_qr_code

# Blueprint pour générer un QR code
generate_qr_bp = Blueprint('generate_qr', __name__)

@generate_qr_bp.route('/generate_prescription_qr', methods=['POST'])
def generate_prescription_qr():
    """
    Objectif: Génère un QR code chiffré contenant les informations de prescription.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - doctor: Objet contenant les informations du médecin (Object, Required)
        - patient: Objet contenant les informations du patient (Object, Required)
        - date: Date de la prescription (String, Required)
        - content: Contenu de la prescription (Array, Required)

    Return Value:
        - 200: Fichier image du QR code généré
        - 400: JSON error response si des champs requis sont manquants
        - 500: JSON error response en cas d'erreur de génération
    """
    try:
        data = request.get_json()

        # Validation des champs requis
        required_fields = ['doctor', 'patient', 'date', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Le champ '{field}' est requis"}), 400

        # Modification de la fonction generate_rounded_qr_code pour retourner l'image en mémoire
        # Au lieu de la sauvegarder dans un fichier
        json_content = json.dumps(data, ensure_ascii=False, indent=4)

        # Appel de la fonction modifiée (voir explication ci-dessous)
        img_buffer = generate_rounded_qr_code(data, return_buffer=True)

        return send_file(img_buffer, mimetype='image/png', as_attachment=True, download_name='prescription_qr.png')

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e) or "Une erreur inconnue s'est produite"}), 500

@generate_qr_bp.route('/generate_direction_qr', methods=['POST'])
def generate_direction_qr():
    """
    Objectif: Génère un QR code contenant les informations de direction.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - pharmacy: Objet contenant les informations de la pharmacie (Object, Required)
        - transport: Mode de transport (String, Required)
        - userCoords: Coordonnées de l'utilisateur (Array, Required)
        - routeCoords: Coordonnées de l'itinéraire (Array, Optional)

    Return Value:
        - 200: Fichier image du QR code généré
        - 400: JSON error response si des champs requis sont manquants
        - 500: JSON error response en cas d'erreur de génération
    """
    try:
        data = request.get_json()

        # Validation des champs requis
        required_fields = ['pharmacy', 'transport', 'userCoords']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Le champ '{field}' est requis"}), 400

        # Générer le QR code avec ces données
        img_buffer = generate_rounded_qr_code(data, return_buffer=True)

        return send_file(img_buffer, mimetype='image/png', as_attachment=True, download_name='direction_qr.png')

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e) or "Une erreur inconnue s'est produite"}), 500
