from flask import Blueprint, jsonify, request
import base64
from scripts.scanner import extractAll

extract_text_bp = Blueprint("extract_text", __name__)

@extract_text_bp.route("/extractText", methods=["POST"])
def extract_text():
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
