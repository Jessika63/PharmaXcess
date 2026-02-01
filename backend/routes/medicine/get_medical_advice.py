from flask import Blueprint, jsonify
import json
import os

# Blueprint for medical advice endpoint
get_medical_advice_bp = Blueprint("get_medical_advice", __name__)

# Path to the medicine catalog JSON file
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


def _extract_medicine_id(medicine):
    """
    Safely extract the medicine id as an integer.
    Returns None when invalid.
    """
    if not isinstance(medicine, dict):
        return None

    raw_id = medicine.get("id")
    try:
        return int(raw_id)
    except (TypeError, ValueError):
        return None


@get_medical_advice_bp.route("/medicine/<int:medicine_id>/medical-advice", methods=["GET"])
def get_medical_advice(medicine_id):
    """
    Objectif: Retrieve medical advice associated with a given medicine.

    Parameters:
        - medicine_id (int): medicine identifier
    
    Query parameters:
        - None

    Returns:
        - 200: JSON response containing the medical advice for the specified medicine (Object)
        - 404: JSON error response if the medicine or its advice is not found (Object)
        - 500: JSON error response if an internal error occurs (Object)
    """
    try:
        # Load the catalog from disk
        medicines = _load_medicine_catalog(MEDICINE_JSON_PATH)

        # Find the medicine by id (robust to string ids)
        medicine = next(
            (m for m in medicines if _extract_medicine_id(m) == medicine_id),
            None
        )

        if not medicine:
            return _build_error("Medicine not found", 404)

        # Retrieve the medical advice
        medical_advice = medicine.get("medicalAdvice")
        if not medical_advice:
            return _build_error("Medical advice not available for this medicine", 404)

        # Build success response
        response_data = {
            "medicineId": medicine_id,
            "label": medicine.get("label"),
            "medicalAdvice": medical_advice
        }

        return jsonify(response_data), 200

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
