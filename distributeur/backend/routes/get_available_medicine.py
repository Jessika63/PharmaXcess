
from flask import Blueprint, jsonify
import json
import os

get_available_medicine_bp = Blueprint('get_available_medicine', __name__)

@get_available_medicine_bp.route('/get_available_medicine', methods=['GET'])
def get_available_medicine():
    """
    Retrieves the list of available medicines.

    Return Value:
        - 200 OK with the list of medicines.
        - 404 Not Found if the file does not exist.
        - 500 Internal Server Error if the file cannot be read or parsed.
    """
    try:
        json_path = os.path.join(os.path.dirname(__file__), "../medicine_available.json")

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
