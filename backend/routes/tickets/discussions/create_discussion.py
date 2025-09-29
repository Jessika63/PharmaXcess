
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

create_discussion_bp = Blueprint('create_discussion', __name__, url_prefix='/discussions')

@create_discussion_bp.route('/create', methods=['POST'])
def create_discussion():
    data = request.json
    utilisateur_id = data.get("utilisateur_id")
    sujet = data.get("sujet")
    pharmacien_id = data.get("pharmacien_id")

    if not utilisateur_id or not sujet:
        return jsonify({"error": "utilisateur_id and sujet are required"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO discussion (utilisateur_id, sujet, statut, pharmacien_id)
                VALUES (%s, %s, 'ouvert', %s)
            """, (utilisateur_id, sujet, pharmacien_id))
            conn.commit()
            discussion_id = cursor.lastrowid
        return jsonify({"message": "Discussion created", "discussion_id": discussion_id}), 201
    finally:
        if conn:
            conn.close()
