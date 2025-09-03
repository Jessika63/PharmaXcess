
from flask import Blueprint, request, jsonify
import json
import sys
import os

# Ajouter le chemin des scripts pour pouvoir les importer
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from scripts.qrcode.qrCodeLect import read_qr_code

# Blueprint pour lire un QR code
read_qr_bp = Blueprint('read_qr', __name__)

@read_qr_bp.route('/read_prescription_qr', methods=['POST'])
def read_prescription_qr():
    """
    Objectif: Lit et déchiffre un QR Code contenant des informations de prescription.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - image: Fichier image contenant le QR Code (File, Required)

    Return Value:
        - 200: JSON response contenant les informations de prescription déchiffrées
        - 400: JSON error response si aucun fichier n'est fourni
        - 404: JSON error response si aucun QR Code n'est détecté
        - 500: JSON error response en cas d'erreur de traitement
    """
    try:
        # Vérifier si un fichier a été envoyé
        if 'image' not in request.files:
            return jsonify({"error": "Aucun fichier image fourni"}), 400

        file = request.files['image']

        # Vérifier si un fichier a été sélectionné
        if file.filename == '':
            return jsonify({"error": "Aucun fichier sélectionné"}), 400

        # Sauvegarder temporairement le fichier pour le traitement
        temp_path = os.path.join('/tmp', file.filename)
        file.save(temp_path)

        # Appeler la fonction de lecture du QR code
        decrypted_content = read_qr_code(temp_path)

        # Nettoyer le fichier temporaire
        os.remove(temp_path)

        if decrypted_content:
            # Parser le contenu JSON
            prescription_data = json.loads(decrypted_content)

            return jsonify({
                "message": "QR Code décodé et déchiffré avec succès",
                "prescription": prescription_data
            }), 200
        else:
            return jsonify({"error": "Aucun QR Code valide n'a pu être déchiffré"}), 404

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e) or "Une erreur inconnue s'est produite"}), 500
