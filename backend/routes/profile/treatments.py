
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from .profile_access import (
    get_current_user_id,
    profile_access_condition,
    is_target_accessible,
)

traitements_bp = Blueprint('traitements', __name__)

# CREATE
@traitements_bp.route('/treatments', methods=['POST'])
def create_traitement():
    """
    Objective:
    Create a new treatment entry associated with a specific disease in the database.

    Endpoint: POST /treatments

    Parameters:
    - maladie_id (int): The ID of the disease the treatment is associated with.
    - nom (str): The name of the treatment.
    - debut (str, optional): Start date of the treatment.
    - fin (str, optional): End date of the treatment.
    - dosage (str, optional): Dosage information.
    - duree (str, optional): Duration of the treatment.
    - effets_secondaires (str, optional): Possible side effects.

    Response:
    - 201 Created: Confirmation message with the ID of the newly created treatment.
    - 400 Bad Request: If required fields (maladie_id or nom) are missing.
    - 500 Internal Server Error: If a database error occurs during insertion.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    maladie_id = data.get("maladie_id")
    nom = data.get("nom")

    if not maladie_id or not nom:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Fetch the maladie owner and verify accessibility
            cursor.execute("SELECT utilisateur_id FROM maladies WHERE id = %s", (maladie_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": "Maladie not found"}), 404

            owner_id = row['utilisateur_id']
            # owner must be accessible by current user (main can access subs; sub only self)
            if not is_target_accessible(cursor, owner_id, 'id'):
                return jsonify({"error": "No permission to add treatment for this disease"}), 403

            cursor.execute("""
                INSERT INTO traitements (maladie_id, nom, debut, fin, dosage, duree, effets_secondaires)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                maladie_id, nom, data.get("debut"), data.get("fin"),
                data.get("dosage"), data.get("duree"), data.get("effets_secondaires")
            ))
            conn.commit()
            traitement_id = cursor.lastrowid
        return jsonify({"message": "Traitement ajouté", "id": traitement_id}), 201
    finally:
        conn.close()


# GET ALL
@traitements_bp.route('/treatments/<int:maladie_id>', methods=['GET'])
def get_all_traitements(maladie_id):
    """
    Objective:
    Retrieve all treatment entries associated with a specific disease.

    Endpoint: GET /treatments/<maladie_id>

    Parameters:
    - maladie_id (int): The ID of the disease for which to fetch treatments.

    Response:
    - 200 OK: Returns a JSON array of treatment records for the specified disease.
    - 404 Not Found: If no treatments are found for the given disease ID.
    - 500 Internal Server Error: If a database error occurs during the query.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    # For listing traitements linked to a maladie, check the maladie owner
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"""
                SELECT t.*
                FROM traitements t
                JOIN maladies m ON t.maladie_id = m.id
                WHERE t.maladie_id=%s AND {condition}
            """, (maladie_id, current_user_id, current_user_id))
            traitements = cursor.fetchall()
        return jsonify(traitements), 200
    finally:
        conn.close()


# GET UNIQUE
@traitements_bp.route('/treatments/entry/<int:traitement_id>', methods=['GET'])
def get_traitement(traitement_id):
    """
    Objective:
    Retrieve a specific treatment entry by its ID.

    Endpoint: GET /treatments/entry/<traitement_id>

    Parameters:
    - traitement_id (int): The ID of the treatment to retrieve.

    Response:
    - 200 OK: Returns a JSON object containing the treatment details.
    - 404 Not Found: If no treatment exists with the given ID.
    - 500 Internal Server Error: If a database error occurs during the query.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    # For single traitement retrieval, ensure the linked maladie owner is accessible
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"""
                SELECT t.*
                FROM traitements t
                JOIN maladies m ON t.maladie_id = m.id
                WHERE t.id=%s AND {condition}
            """, (traitement_id, current_user_id, current_user_id))
            traitement = cursor.fetchone()
        if not traitement:
            return jsonify({"error": "Traitement non trouvé"}), 404
        return jsonify(traitement), 200
    finally:
        conn.close()


# UPDATE
@traitements_bp.route('/treatments/entry/<int:traitement_id>', methods=['PUT'])
def update_traitement(traitement_id):
    """
    Objective:
    Update an existing treatment entry in the database by its ID.

    Endpoint: PUT /treatments/entry/<traitement_id>

    Parameters:
    - traitement_id (int): The ID of the treatment to update.
    - JSON body: Contains any of the following fields to update:
        - nom (str): Name of the treatment.
        - debut (str): Start date of the treatment.
        - fin (str): End date of the treatment.
        - dosage (str): Dosage information.
        - duree (str): Duration of the treatment.
        - effets_secondaires (str): Side effects of the treatment.

    Response:
    - 200 OK: Returns a message confirming the update.
    - 400 Bad Request: If required fields are missing or invalid.
    - 500 Internal Server Error: If a database error occurs during the update.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    data = request.get_json()
    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"""
                UPDATE traitements t
                JOIN maladies m ON t.maladie_id = m.id
                SET t.nom=%s, t.debut=%s, t.fin=%s, t.dosage=%s, t.duree=%s, t.effets_secondaires=%s
                WHERE t.id=%s AND {condition}
            """, (
                data.get("nom"), data.get("debut"), data.get("fin"),
                data.get("dosage"), data.get("duree"), data.get("effets_secondaires"),
                traitement_id,
                current_user_id,
                current_user_id
            ))
            if cursor.rowcount == 0:
                return jsonify({"error": "Traitement non trouvé ou pas d'autorisation"}), 404
            conn.commit()
        return jsonify({"message": "Traitement mis à jour"}), 200
    finally:
        conn.close()


# DELETE
@traitements_bp.route('/treatments/entry/<int:traitement_id>', methods=['DELETE'])
def delete_traitement(traitement_id):
    """
    Objective:
    Delete an existing treatment entry from the database by its ID.

    Endpoint: DELETE /treatments/entry/<traitement_id>

    Parameters:
    - traitement_id (int): The ID of the treatment to delete.

    Response:
    - 200 OK: Returns a message confirming successful deletion.
    - 404 Not Found: If the treatment ID does not exist.
    - 500 Internal Server Error: If a database error occurs during deletion.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition('m.utilisateur_id')

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"""
                DELETE t FROM traitements t
                JOIN maladies m ON t.maladie_id = m.id
                WHERE t.id=%s AND {condition}
            """, (traitement_id, current_user_id, current_user_id))
            if cursor.rowcount == 0:
                return jsonify({"error": "Traitement non trouvé ou pas d'autorisation"}), 404
            conn.commit()
        return jsonify({"message": "Traitement supprimé"}), 200
    finally:
        conn.close()
