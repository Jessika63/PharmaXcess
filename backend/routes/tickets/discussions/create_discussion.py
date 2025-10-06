
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

create_discussion_bp = Blueprint('create_discussion', __name__, url_prefix='/discussions')

@create_discussion_bp.route('/create', methods=['POST'])
def create_discussion():
    data = request.json
    utilisateur_id = data.get("utilisateur_id")
    sujet = data.get("subject")
    auteur_name = data.get("name")
    question = data.get("question")
    destinataire = data.get("flag")  # "pharmacien", "medecin", or None
    region = data.get("region")

    if not utilisateur_id or not sujet or not auteur_name or not question or not region:
        return jsonify({"error": "utilisateur_id, subject, name, question and region are required"}), 400

    if destinataire not in ("pharmacien", "medecin"):
        destinataire = "all"

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO discussion (utilisateur_id, sujet, statut, destinataire, region)
                VALUES (%s, %s, 'ouvert', %s, %s)
            """, (utilisateur_id, sujet, destinataire, region))
            conn.commit()
            discussion_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO messages (discussion_id, auteur_id, auteur_name, message)
                VALUES (%s, %s, %s, %s)
            """, (discussion_id, utilisateur_id, auteur_name, question))
            conn.commit()
            message_id = cursor.lastrowid

        return jsonify({
            "message": "Discussion created with first message",
            "discussion_id": discussion_id,
            "destinataire": destinataire,
            "region": region,
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
