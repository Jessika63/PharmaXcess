
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

delete_qr_bp = Blueprint('delete_qr', __name__)

@delete_qr_bp.route('/delete_prescription_qr_list', methods=['POST'])
def delete_prescription_qr_list():
    """
    Objective: Deletes multiple prescription QR code entries from the database based on a list of IDs.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - ids: List of QR code entry IDs to delete (Array of Integers, Required)

    Process:
        - Validates that a list of IDs is provided
        - Deletes all corresponding entries from the `qrcodes_ordonnances` table
        - Returns the number of entries deleted

    Return Value:
        - 200: JSON response with the number of deleted entries
        - 400: JSON error response if the `ids` list is missing or invalid
        - 500: JSON error response in case of database or server error
    """

    data = request.get_json()
    ids = data.get('ids')
    if not ids or not isinstance(ids, list):
        return jsonify({"error": "La liste d'ids est requise"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            format_strings = ','.join(['%s'] * len(ids))
            cursor.execute(f"DELETE FROM qrcodes_ordonnances WHERE id IN ({format_strings})", tuple(ids))
            conn.commit()

        return jsonify({"success": True, "deleted_count": cursor.rowcount})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@delete_qr_bp.route('/delete_map_qr_list', methods=['POST'])
def delete_map_qr_list():
    """
    Objective: Deletes multiple direction/map QR code entries from the database based on a list of IDs.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - ids: List of QR code entry IDs to delete (Array of Integers, Required)

    Process:
        - Validates that a list of IDs is provided
        - Deletes all corresponding entries from the `qrcodes_maps` table
        - Returns the number of entries deleted

    Return Value:
        - 200: JSON response with the number of deleted entries
        - 400: JSON error response if the `ids` list is missing or invalid
        - 500: JSON error response in case of database or server error
    """

    data = request.get_json()
    ids = data.get('ids')
    if not ids or not isinstance(ids, list):
        return jsonify({"error": "La liste d'ids est requise"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            format_strings = ','.join(['%s'] * len(ids))
            cursor.execute(f"DELETE FROM qrcodes_maps WHERE id IN ({format_strings})", tuple(ids))
            conn.commit()

        return jsonify({"success": True, "deleted_count": cursor.rowcount})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@delete_qr_bp.route('/delete_profile_qr_list', methods=['POST'])
def delete_profile_qr_list():
    """
    Objective: Deletes multiple profile QR code entries from the database based on a list of IDs.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body (JSON):
        - ids: List of QR code entry IDs to delete (Array of Integers, Required)

    Process:
        - Validates that a list of IDs is provided
        - Deletes all corresponding entries from the `qrcodes_profiles` table
        - Returns the number of entries deleted

    Return Value:
        - 200: JSON response with the number of deleted entries
        - 400: JSON error response if the `ids` list is missing or invalid
        - 500: JSON error response in case of database or server error
    """
    data = request.get_json()
    ids = data.get('ids')
    if not ids or not isinstance(ids, list):
        return jsonify({"error": "La liste d'ids est requise"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            format_strings = ','.join(['%s'] * len(ids))
            cursor.execute(f"DELETE FROM qrcodes_profiles WHERE id IN ({format_strings})", tuple(ids))
            conn.commit()

        return jsonify({"success": True, "deleted_count": cursor.rowcount})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
