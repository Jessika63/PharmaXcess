
from flask import Blueprint, jsonify
import json
import os

get_available_medicine_bp = Blueprint('get_available_medicine', __name__)

@get_available_medicine_bp.route('/get_available_medicine', methods=['GET'])
def get_available_medicine():
    """
    Objectif: Retrieve and return the list of available medicines from a JSON data file.

    Parameters:
        - None

    Query parameters:
        - None

    Return Value:
        - 200: JSON response containing the list of medicines and a success message (Object)
        - 404: JSON error response if the medicine data file is not found (Object)
        - 500: JSON error response if the file cannot be read, parsed, or an unknown error occurs (Object)
    """
    try:
        json_path = '/data/medicine_available.json'

        if not os.path.exists(json_path):
            return jsonify({"error": "Medicine data file not found"}), 404

        with open(json_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        return jsonify(
            {
                "message": "List sent successfully",
                "medicine": data.get("medicine", [])
            }
        ), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse medicine data file"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e) or "An unknown error occurred"}), 500
