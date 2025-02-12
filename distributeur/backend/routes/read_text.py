
from flask import Blueprint, jsonify, request
import subprocess
import os

# Blueprint for reading text from an image
read_text_bp = Blueprint('read_text', __name__)

@read_text_bp.route('/read_text', methods=['POST'])
def read_text():
    """
    Reads text from an image using an external Python script.

    Request JSON Body:
        - image_path (str, optional): Path to the image. If not provided, uses a default path.

    Returns:
        - 200 OK with the extracted text.
        - 400 Bad Request if the image path is invalid.
        - 500 Internal Server Error if an error occurs during execution.
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
