
from flask import Blueprint, jsonify, request
import subprocess
import os

# Blueprint for reading text from an image
read_text_bp = Blueprint('read_text', __name__)

@read_text_bp.route('/read_text', methods=['POST'])
def read_text():
    """
    Objectif: Reads text from an image using an external Python script.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - image_path: Path to the image file. If not provided, a default path is used. (String, Optional)

    Return Value:
        - 200: JSON response containing the extracted text and a success message. (Object)
        - 400: JSON error response if the image path is invalid. (Object)
        - 500: JSON error response if an error occurs during execution or the external script fails. (Object)
    """

    try:
        image_path = "path/to/image.jpg"

        # Run the external script
        result = subprocess.run(
            ['python3', 'scripts/read_text.py', image_path],
            capture_output=True, text=True
        )

        if result.returncode == 0:
            return jsonify({"message": "Text read successfully", "output": result.stdout.strip()}), 200
        else:
            return jsonify({"error": result.stderr.strip()}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
