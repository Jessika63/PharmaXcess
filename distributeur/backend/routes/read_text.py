from flask import Blueprint, jsonify, request
import subprocess
import base64
import uuid
import os
import json

extract_all_bp = Blueprint('extract_all', __name__)

@extract_all_bp.route('/extractAll', methods=['POST'])
def extract_all():
    try:
        data = request.get_json()
        base64_image = data.get("base64_image")
        doc_type = data.get("type")

        if not base64_image or not doc_type:
            return jsonify({"error": "base64_image and type are required"}), 400

        if doc_type not in ['P', 'R', 'V']:
            return jsonify({"error": "Invalid document type"}), 400

        header, encoded = base64_image.split(",", 1) if "," in base64_image else ("", base64_image)
        image_data = base64.b64decode(encoded)

        filename = f"/tmp/captured_{uuid.uuid4().hex}.jpg"
        with open(filename, "wb") as f:
            f.write(image_data)

        result = subprocess.run(
            ["python3", "scripts/scanner/extractAll.py", filename, doc_type],
            capture_output=True,
            text=True
        )

        os.remove(filename)

        if result.returncode == 0:
            parsed_data = json.loads(result.stdout.strip())
            return jsonify({
                "message": "Text extracted successfully",
                "output": parsed_data
            }), 200
        else:
            return jsonify({"error": result.stderr.strip()}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
