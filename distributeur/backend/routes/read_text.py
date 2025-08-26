from flask import Blueprint, jsonify, request
import base64
import sys, os

# Add the extractAll path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.scanner import extractAll

# Blueprint for reading text from an image
extract_text_bp = Blueprint("extract_text", __name__)

@extract_text_bp.route("/extractText", methods=["POST"])
def extract_text():
    """
    Objectif: Extracts text from a base64 encoded image based on the specified document type.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - base64_image: Base64 encoded image data, optionally with data URI prefix. (String, Required)
        - type: Document type to process. Must be one of: 'P' (prescription), 'R' (ID card front), 'V' (ID card back). (String, Required)

    Return Value:
        - 200: JSON response containing the extracted text data. (Object)
        - 400: JSON error response for missing parameters or invalid document type. (Object)
        - 500: JSON error response for processing failures or unexpected errors. (Object)
    """
    try:
        data = request.get_json()
        base64_image = data.get("base64_image")
        doc_type = data.get("type")

        if not base64_image or not doc_type:
            return jsonify({"error": "base64_image and type are required"}), 400

        if doc_type not in ["P", "R", "V"]:
            return jsonify({"error": "Invalid document type"}), 400

        header, encoded = base64_image.split(",", 1) if "," in base64_image else ("", base64_image)
        image_data = base64.b64decode(encoded)

        result = extractAll.main(image_data, doc_type, is_bytes=True, flip_horizontal=True)

        return jsonify(result), 200

    except Exception as e:
        print("[ERROR extract_text route]", e)
        return jsonify({"error": str(e)}), 500
