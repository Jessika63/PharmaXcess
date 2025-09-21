
from flask import Blueprint, request, jsonify
import os
import tempfile

# Blueprint pour lire un QR code
read_qr_bp = Blueprint('read_qr', __name__)

@read_qr_bp.route('/read_prescription_qr', methods=['POST'])
def read_prescription_qr():
    """
    Objectif: Lit et déchiffre un QR Code contenant des informations de prescription.
    """
    # Vérifier si un fichier a été envoyé
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "Aucun fichier image fourni"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "Aucun fichier sélectionné"}), 400

    try:
        # Sauvegarder temporairement le fichier
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name

        # Appeler la fonction de lecture du QR code
        from scripts.qrcode.qrCodeLect import read_qr_code
        success, result = read_qr_code(temp_path)

        # Nettoyer le fichier temporaire
        os.unlink(temp_path)

        if not success:
            return jsonify({"success": False, "error": result}), 400

        # Essayer de parser le JSON
        try:
            import json
            prescription_data = json.loads(result)
            return jsonify({
                "success": True,
                "message": "QR Code décodé avec succès",
                "prescription": prescription_data
            }), 200
        except json.JSONDecodeError:
            # Si ce n'est pas du JSON, retourner le contenu brut
            return jsonify({
                "success": True,
                "message": "QR Code décodé (contenu non-JSON)",
                "raw_content": result
            }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
