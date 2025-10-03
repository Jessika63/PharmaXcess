
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

create_discussion_bp = Blueprint('create_discussion', __name__, url_prefix='/discussions')

@create_discussion_bp.route('/create', methods=['POST'])
def create_discussion():
    data = request.json
    utilisateur_id = data.get("utilisateur_id")
    sujet = data.get("subject")       # title
    auteur_name = data.get("name")    # user full name
    question = data.get("question")   # first message
    pharmacien_id = data.get("pharmacien_id")  # optional

    if not utilisateur_id or not sujet or not auteur_name or not question:
        return jsonify({"error": "utilisateur_id, subject, name and question are required"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            # Create discussion (default status "ouvert")
            cursor.execute("""
                INSERT INTO discussion (utilisateur_id, sujet, statut, pharmacien_id)
                VALUES (%s, %s, 'ouvert', %s)
            """, (utilisateur_id, sujet, pharmacien_id))
            conn.commit()
            discussion_id = cursor.lastrowid

            # Insert first message automatically
            cursor.execute("""
                INSERT INTO messages (discussion_id, auteur_id, auteur_name, message)
                VALUES (%s, %s, %s, %s)
            """, (discussion_id, utilisateur_id, auteur_name, question))
            conn.commit()
            message_id = cursor.lastrowid

        return jsonify({
            "message": "Discussion created with first message",
            "discussion_id": discussion_id,
            "first_message": {
                "message_id": message_id,
                "auteur_id": utilisateur_id,
                "auteur_name": auteur_name,
                "message": question
            }
        }), 201

    finally:
        if conn:
            conn.close()
