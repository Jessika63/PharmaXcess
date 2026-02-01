from flask import Blueprint, jsonify
import json
import os

# Blueprint for medicine catalog endpoint
get_available_medicine_bp = Blueprint("get_available_medicine", __name__)

# Path to the medicine catalog JSON file (Docker volume)
MEDICINE_JSON_PATH = "/data/medicine_available.json"


def _build_error(message, status_code, details=None):
    """
    Helper to format error responses consistently.
    """
    payload = {"error": message}
    if details:
        payload["details"] = details
    return jsonify(payload), status_code


def _load_medicine_catalog(json_path):
    """
    Load and validate the medicine catalog.
    Returns a list of medicines on success.
    """
    if not os.path.exists(json_path):
        raise FileNotFoundError("Medicine data file not found")

    with open(json_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError("Invalid JSON root. Expected an object.")

    medicines = data.get("medicine")
    if medicines is None:
        raise KeyError("Missing 'medicine' key in data file")
    if not isinstance(medicines, list):
        raise ValueError("Invalid 'medicine' format. Expected a list.")

    return medicines


@get_available_medicine_bp.route("/get_available_medicine", methods=["GET"])
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
        # Load catalog from disk
        medicines = _load_medicine_catalog(MEDICINE_JSON_PATH)

        # Build success response
        return jsonify({
            "message": "List sent successfully",
            "medicine": medicines
        }), 200

    except FileNotFoundError:
        return _build_error("Medicine data file not found", 404)
    except json.JSONDecodeError:
        return _build_error("Failed to parse medicine data file", 500)
    except (KeyError, ValueError) as e:
        print(f"Data format error: {e}")
        return _build_error("Invalid medicine data format", 500, str(e))
    except Exception as e:
        print(f"Error: {e}")
        return _build_error(str(e) or "An unknown error occurred", 500)