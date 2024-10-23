from flask import Blueprint, jsonify
import subprocess

# Route pour prendre une photo
take_picture_bp = Blueprint('take_picture', __name__)

@take_picture_bp.route('/take_picture', methods=['POST'])
def take_picture():
    """
    Takes a picture using an external Python script.

    Return Value:
        - 200 OK with a success message and image path.
        - 500 Internal Server Error if an error occurs during the script execution.
    """
    try:
        # Appeler le script Python pour prendre une photo
        result = subprocess.run(['python3', 'scripts/take_picture.py'], capture_output=True, text=True)

        if result.returncode == 0:
            return jsonify({"message": "Picture taken successfully", "output": result.stdout.strip()}), 200
        else:
            return jsonify({"error": result.stderr.strip()}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
