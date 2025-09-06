from flask import Blueprint, request, jsonify
import sys
import os
import base64
import tempfile
import cv2
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), '../scripts/scanner'))
from extractAll import main

extract_text_bp = Blueprint("extract_text", __name__)

@extract_text_bp.route("/extractText", methods=["POST"])
def extract_text():
    try:
        if "image" not in request.files or "doc_type" not in request.form:
            return jsonify({"success": False, "error": "Missing parameters"}), 400

        file = request.files["image"]
        doc_type = request.form["doc_type"]

        file_bytes = file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"success": False, "error": "Decoded image is None"}), 400

        tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        cv2.imwrite(tmp_file.name, img)

        result = main(tmp_file.name, doc_type, from_base64=False, flip_horizontal=True)

        print("DEBUG: Result from OCR main():", result, flush=True)

        if result.get("success", False):
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
