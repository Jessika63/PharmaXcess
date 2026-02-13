
from flask import Blueprint, request, jsonify
import tempfile, os, json
from db_app import get_app_connection
from scripts.qrcode.qrCodeLect import read_qr_code, decrypt_and_parse_raw_content
import os


read_qr_bp = Blueprint('read_qr', __name__)

VALID_SCAN_ROLES = {"distributeur", "medecin", "pharmacien"}

@read_qr_bp.route('/read_prescription_qr', methods=['POST'])
def read_prescription_qr():
    """
    Objective: Reads and decrypts a prescription QR code image, retrieves the linked prescription from the database.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - image: Image file of the QR code to read (File, Required)

    Process:
        - Validates that a file is provided
        - Temporarily saves the uploaded image and reads its QR code content
        - Parses the QR code content as JSON to get the QR record ID
        - Looks up the corresponding QR code entry in `qrcodes_ordonnances`
        - Retrieves the linked prescription from `ordonnances` table

    Return Value:
        - 200: JSON response with the prescription details if successful
        - 400: JSON error response if no file is provided or QR code decoding fails
        - 404: JSON error response if no matching QR code entry is found
        - 500: JSON error response in case of database or server error
    """

    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    success, content = read_qr_code(tmp_path)
    os.unlink(tmp_path)
    if not success:
        return jsonify({"error": content}), 400

    conn = None
    try:
        data = json.loads(content)
        qr_id = data.get("id")

        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_ordonnances WHERE id=%s", (qr_id,))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code not found"}), 404

            cursor.execute("SELECT * FROM ordonnances WHERE id=%s", (qr_entry['ordonnance_id'],))
            ordonnance = cursor.fetchone()

        return jsonify({"success": True, "ordonnance": ordonnance})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@read_qr_bp.route('/read_direction_qr', methods=['POST'])
def read_direction_qr():
    """
    Objective: Reads and decrypts a direction QR code image, retrieves the linked data from the database,
    and invalidates the QR code after use.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (multipart/form-data):
        - image: Image file of the QR code to read (File, Required)

    Process:
        - Validates that a file is provided
        - Temporarily saves the uploaded image and reads its QR code content
        - Parses the QR code content as JSON to get the QR record ID
        - Looks up the corresponding QR code entry in `qrcodes_maps`
        - Deletes the QR code entry from the database (one-time use)

    Return Value:
        - 200: JSON response with the QR code data if successful
        - 400: JSON error response if no file is provided, QR code decoding fails, or QR code is invalid
        - 404: JSON error response if no matching QR code entry is found
        - 500: JSON error response in case of database or server error
    """

    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    success, content = read_qr_code(tmp_path)
    os.unlink(tmp_path)
    if not success:
        return jsonify({"error": content}), 400

    conn = None
    try:
        data = json.loads(content)
        qr_id = data.get("id")
        if not qr_id:
            return jsonify({"error": "Invalid QR code"}), 400

        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_maps WHERE id=%s", (qr_id,))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code not found"}), 404

            cursor.execute("DELETE FROM qrcodes_maps WHERE id=%s", (qr_entry['id'],))
            conn.commit()

        return jsonify({
            "success": True,
            "qrcode": qr_entry['data']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@read_qr_bp.route('/read_profile_qr', methods=['POST'])
def read_profile_qr():
    """
    Objective: Reads a profile QR code image and returns filtered user information based on the provided scan_role.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (multipart/form-data):
        - image: Image file of the QR code to read (File, Required)
        - scan_role: Role of the scanner determining which information to return
                    (String, Required, must be one of 'distributeur', 'medecin', 'pharmacien')

    Process:
        - Validates that a file is provided and that `scan_role` is valid
        - Temporarily saves the uploaded image and reads its QR code content
        - Parses the QR code content as JSON to get the QR record ID
        - Looks up the corresponding QR code entry in `qrcodes_profiles`
        - Retrieves the linked user profile from the `utilisateurs` table
        - Filters returned information based on the `scan_role`:
            - 'distributeur': limited fields (nom, prenom, telephone, adresse)
            - 'medecin' or 'pharmacien': full user profile

    Return Value:
        - 200: JSON response with the filtered user profile if successful
        - 400: JSON error response if no file is provided, QR code is invalid, or `scan_role` is missing/invalid
        - 404: JSON error response if no matching QR code entry is found
        - 500: JSON error response in case of database or server error
    """
    # Vérifier la présence du fichier
    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    scan_role = request.form.get('scan_role')
    if not scan_role or scan_role not in VALID_SCAN_ROLES:
        return jsonify({"error": f"scan_role is required and must be one of {list(VALID_SCAN_ROLES)}"}), 400

    file = request.files['image']

    # Sauvegarder temporairement le fichier pour le traitement
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        # Lire le QR code
        success, content = read_qr_code(tmp_path)
    finally:
        os.unlink(tmp_path)  # Clean up the temporary file

    if not success:
        return jsonify({"error": content}), 400

    conn = None
    try:
        data = json.loads(content)
        qr_id = data.get("id")
        if not qr_id:
            return jsonify({"error": "Invalid QR code"}), 400

        conn = get_app_connection()
        with conn.cursor() as cursor:
            # Récupérer le QR code dans la DB
            cursor.execute("SELECT * FROM qrcodes_profiles WHERE id=%s", (qr_id,))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code not found"}), 404

            # Récupérer l'utilisateur
            cursor.execute("SELECT * FROM utilisateurs WHERE id=%s", (qr_entry['utilisateur_id'],))
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

        # Filtrer les infos selon le rôle
        if scan_role == "distributeur":
            filtered = {
                "nom": user['nom'],
                "prenom": user['prenom'],
                "telephone": user['telephone'],
                "adresse": user['adresse']
            }
        else:  # medecin ou pharmacien
            filtered = user

        return jsonify({"success": True, "profile": filtered})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@read_qr_bp.route('/read_prescription_qr_content', methods=['POST'])
def read_prescription_qr_content():
    """
    Objective: Reads and processes the JSON content directly extracted from a prescription QR code. Decrypts and parses the QR code content, then retrieves the corresponding prescription record from the database.

    Request JSON Body:
    - content (str): The raw JSON content extracted from the QR code.

    Return Value:
    - JSON response (Flask jsonify):
        - On success: {"success": True, "ordonnance": <prescription_record>}
        - On failure: {"error": <error_message>} with appropriate HTTP status codes (400, 404, 500)
    """
    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "content is required"}), 400

    content = data["content"]
    conn = None

    try:
        success, result = decrypt_and_parse_raw_content(content)

        if not success:
            return jsonify({"error": result}), 400

        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_ordonnances WHERE id=%s", (result['id'],))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code not found"}), 404

            cursor.execute("SELECT * FROM ordonnances WHERE id=%s", (qr_entry['ordonnance_id'],))
            ordonnance = cursor.fetchone()

        return jsonify({"success": True, "ordonnance": ordonnance})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@read_qr_bp.route('/read_direction_qr_content', methods=['POST'])
def read_direction_qr_content():
    """
    Objective: Reads and processes the JSON content directly extracted from a direction QR code. Decrypts and parses the QR code content, retrieves the corresponding map QR code entry from the database, and deletes it after reading.

    Request JSON Body:
    - content (str): The raw JSON content extracted from the QR code.

    Return Value:
    - JSON response (Flask jsonify):
        - On success: {"success": True, "qrcode": <map_qr_data>}
        - On failure: {"error": <error_message>} with appropriate HTTP status codes (400, 404, 500)
    """

    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "content is required"}), 400

    content = data["content"]
    conn = None
    try:

        success, result = decrypt_and_parse_raw_content(content)

        if not success:
            return jsonify({"error": result}), 400

        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_maps WHERE id=%s", (result['id'],))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code not found"}), 404

            cursor.execute("DELETE FROM qrcodes_maps WHERE id=%s", (qr_entry['id'],))
            conn.commit()

        return jsonify({"success": True, "qrcode": qr_entry['data']})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@read_qr_bp.route('/read_profile_qr_content', methods=['POST'])
def read_profile_qr_content():
    """
    Objective: Reads and processes the JSON content directly extracted from a profile QR code. Decrypts and parses the QR code content, retrieves the corresponding user profile from the database, and filters the information based on the scanning role.

    Request JSON Body:
    - content (str): The raw JSON content extracted from the QR code.
    - scan_role (str): The role of the scanner; must be one of "distributeur", "medecin", or "pharmacien".

    Return Value:
    - JSON response (Flask jsonify):
        - On success: {"success": True, "profile": <filtered_user_data>}
        - On failure: {"error": <error_message>} with appropriate HTTP status codes (400, 404, 500)
    """

    data = request.get_json()
    if not data or "content" not in data or "scan_role" not in data:
        return jsonify({"error": "content and scan_role are required"}), 400

    scan_role = data["scan_role"]
    if scan_role not in VALID_SCAN_ROLES:
        return jsonify({"error": f"scan_role must be one of {list(VALID_SCAN_ROLES)}"}), 400

    content = data["content"]
    conn = None
    try:
        success, result = decrypt_and_parse_raw_content(content)

        if not success:
            return jsonify({"error": result}), 400

        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_profiles WHERE id=%s", (result['id'],))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code not found"}), 404

            cursor.execute("SELECT * FROM utilisateurs WHERE id=%s", (qr_entry['utilisateur_id'],))
            user = cursor.fetchone()

        # filtrer les infos selon le rôle
        if scan_role == "distributeur":
            filtered = {
                "nom": user['nom'],
                "prenom": user['prenom'],
                "telephone": user['telephone'],
                "adresse": user['adresse']
            }
        else:  # medecin ou pharmacien
            filtered = user

        return jsonify({"success": True, "profile": filtered})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
