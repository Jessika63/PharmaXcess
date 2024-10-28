from flask import Blueprint, jsonify
import subprocess

# Route pour lire du texte dans une image avec un argument codé en dur
read_text_bp = Blueprint('read_text', __name__)

@read_text_bp.route('/read_text', methods=['POST'])
def read_text():
    """
    Reads text from an image using an external Python script with a hard-coded argument.

    Return Value:
        - 200 OK with the read text.
        - 500 Internal Server Error if an error occurs during the script execution.
    """
    try:
        # Définir le chemin de l'image à lire
        image_path = "path/to/image.jpg"

        # Appeler le script Python avec l'argument codé en dur
        result = subprocess.run(
            ['python3', 'scripts/read_text.py', image_path],
            capture_output=True, text=True
        )

        if result.returncode == 0:
            return jsonify({"message": "Text read successfully", "output": result.stdout.strip()}), 200
        else:
            return jsonify({"error": result.stderr.strip()}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
