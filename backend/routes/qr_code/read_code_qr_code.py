
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

read_code_qr_bp = Blueprint('read_code_qr', __name__)

@read_code_qr_bp.route('/read_prescription_qr_by_code', methods=['POST'])
def read_prescription_qr_by_code():
    """
    Objective: Reads a prescription QR code by its unique code, retrieves the linked prescription from the database, 
    and invalidates the QR code after use.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - code_unique: The unique code associated with the prescription QR entry (String, Required)

    Process:
        - Validates that a unique code is provided
        - Looks up the corresponding QR code entry in the `qrcodes_ordonnances` table
        - Retrieves the linked prescription from the `ordonnances` table
        - Deletes the QR code entry from the database (one-time use)

    Return Value:
        - 200: JSON response with prescription details if found
        - 400: JSON error response if `code_unique` is missing
        - 404: JSON error response if no matching QR code entry is found
        - 500: JSON error response in case of database or server error
    """

    data = request.get_json()
    code = data.get("code_unique") if data else None
    if not code:
        return jsonify({"error": "code_unique requis"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_ordonnances WHERE code_unique=%s", (code,))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code introuvable"}), 404

            cursor.execute("SELECT * FROM ordonnances WHERE id=%s", (qr_entry['ordonnance_id'],))
            ordonnance = cursor.fetchone()
            cursor.execute("DELETE FROM qrcodes_ordonnances WHERE id=%s", (qr_entry['id'],))
            conn.commit()

        return jsonify({"success": True, "ordonnance": ordonnance})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@read_code_qr_bp.route('/read_direction_qr_by_code', methods=['POST'])
def read_direction_qr_by_code():
    """
    Objective: Reads a direction QR code by its unique code, retrieves the linked data from the database,
    and invalidates the QR code after use.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - code_unique: The unique code associated with the direction QR entry (String, Required)

    Process:
        - Validates that a unique code is provided
        - Looks up the corresponding QR code entry in the `qrcodes_maps` table
        - Deletes the QR code entry from the database (one-time use)
        - Returns the stored direction data

    Return Value:
        - 200: JSON response with the QR code data if found
        - 400: JSON error response if `code_unique` is missing
        - 404: JSON error response if no matching QR code entry is found
        - 500: JSON error response in case of database or server error
    """

    data = request.get_json()
    code = data.get("code_unique") if data else None
    if not code:
        return jsonify({"error": "code_unique requis"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM qrcodes_maps WHERE code_unique=%s", (code,))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code introuvable"}), 404

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

VALID_SCAN_ROLES = {"distributeur", "medecin", "pharmacien"}

@read_code_qr_bp.route('/read_profile_qr_by_code', methods=['POST'])
def read_profile_qr_by_code():
    """
    Objective: Reads a profile QR code by its unique code and returns filtered user information 
    based on the provided scan_role.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - code_unique: The unique code associated with the profile QR entry (String, Required)
        - scan_role: Role of the scanner determining which information to return 
                    (String, Required, must be one of 'distributeur', 'medecin', 'pharmacien')

    Process:
        - Validates that both `code_unique` and a valid `scan_role` are provided
        - Looks up the corresponding QR code entry in the `qrcodes_profiles` table
        - Retrieves the linked user profile from the `utilisateurs` table
        - Filters returned information based on the `scan_role`:
            - 'distributeur': limited fields (nom, prenom, telephone, adresse)
            - 'medecin' or 'pharmacien': full user profile

    Return Value:
        - 200: JSON response with the filtered user profile if successful
        - 400: JSON error response if `code_unique` is missing or `scan_role` is invalid
        - 404: JSON error response if no matching QR code entry is found
        - 500: JSON error response in case of database or server error
    """

    data = request.get_json() or {}
    code = data.get('code_unique')
    scan_role = data.get('scan_role')

    if not code:
        return jsonify({"error": "code_unique requis"}), 400
    if not scan_role or scan_role not in VALID_SCAN_ROLES:
        return jsonify({"error": f"scan_role requis et doit être l'un de {list(VALID_SCAN_ROLES)}"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            # Récupérer le QR code
            cursor.execute("SELECT * FROM qrcodes_profiles WHERE code_unique=%s", (code,))
            qr_entry = cursor.fetchone()
            if not qr_entry:
                return jsonify({"error": "QR code introuvable"}), 404

            # Récupérer les infos de l'utilisateur
            cursor.execute("SELECT * FROM utilisateurs WHERE id=%s", (qr_entry['utilisateur_id'],))
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "Utilisateur introuvable"}), 404

            # Supprimer le QR code (one-time use)
            cursor.execute("DELETE FROM qrcodes_profiles WHERE id=%s", (qr_entry['id'],))
            conn.commit()

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
