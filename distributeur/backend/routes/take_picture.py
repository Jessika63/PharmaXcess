
from flask import Blueprint, jsonify
import subprocess

# Route to take a picture
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
        # Call the Python script to take a picture
        result = subprocess.run(
            ['python3', 'scripts/take_picture.py'],
            capture_output=True, text=True
        )

        # Check the result of the script execution
        if result.returncode == 0:
            return jsonify({"message": "Picture taken successfully", "image_path": result.stdout.strip()}), 200
        else:
            # If the script produces an error, return stderr
            return jsonify({"error": result.stderr.strip()}), 500

    except Exception as e:
        # Catch any unexpected errors and log them
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
