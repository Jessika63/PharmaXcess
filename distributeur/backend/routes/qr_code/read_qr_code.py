
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
    """
    try:
        # Vérifier si un fichier a été envoyé
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "Aucun fichier image fourni"}), 400

        file = request.files['image']

        # Vérifier si un fichier a été sélectionné
        if file.filename == '':
            return jsonify({"success": False, "error": "Aucun fichier sélectionné"}), 400

        # Sauvegarder temporairement le fichier pour le traitement
        temp_path = os.path.join('/tmp', file.filename)
        file.save(temp_path)

        # Appeler la fonction de lecture du QR code
        success, result = read_qr_code(temp_path)

        # Nettoyer le fichier temporaire
        os.remove(temp_path)

        if not success:
            return jsonify({"success": False, "error": result}), 404

        try:
            # Parser le contenu JSON
            prescription_data = json.loads(result)
            return jsonify({
                "success": True,
                "message": "QR Code décodé et déchiffré avec succès",
                "prescription": prescription_data
            }), 200
        except json.JSONDecodeError:
            return jsonify({
                "success": False,
                "error": "Le contenu du QR Code n'est pas un JSON valide",
                "raw_content": result
            }), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e) or "Une erreur inconnue s'est produite"}), 500
