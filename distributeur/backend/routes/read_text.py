from flask import Blueprint, jsonify, request
import subprocess
import base64
import uuid
import os
import json

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

        filename = f"/tmp/captured_{uuid.uuid4().hex}.jpg"
        with open(filename, "wb") as f:
            f.write(image_data)

        print(f"[DEBUG] Image saved to {filename}")

        result = subprocess.run(
            ["python3", "scripts/scanner/extractAll.py", filename, doc_type],
            capture_output=True,
            text=True
        )

        print("[DEBUG] STDOUT:", result.stdout)
        print("[DEBUG] STDERR:", result.stderr)

        os.remove(filename)

        if result.returncode != 0:
            return jsonify({
                "error": result.stderr.strip() or "Unknown error"
            }), 500

        stdout_clean = result.stdout.strip()
        try:
            parsed = json.loads(stdout_clean)
            return jsonify({
                "output": parsed
            }), 200
        except Exception:
            return jsonify({
                "output": stdout_clean
            }), 200

    except Exception as e:
        print("[ERROR]", e)
        return jsonify({"error": str(e)}), 500
