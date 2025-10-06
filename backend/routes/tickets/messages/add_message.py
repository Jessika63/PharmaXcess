
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

add_message_bp = Blueprint('add_message', __name__, url_prefix='/messages')

@add_message_bp.route('/add/<int:discussion_id>', methods=['POST'])
def add_message(discussion_id):
    data = request.json
    auteur_id = data.get("auteur_id")
    message = data.get("message")

    if not auteur_id or not message:
        return jsonify({"error": "auteur_id and message are required"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:

            # Vérifier le rôle de l'auteur
            cursor.execute("SELECT nom, prenom, role FROM utilisateurs WHERE id=%s", (auteur_id,))
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "Auteur non trouvé"}), 404

            auteur_name = None

            if user["role"] == "user":
                # On prend le nom du premier message de la discussion
                cursor.execute("""
                    SELECT auteur_name
                    FROM messages
                    WHERE discussion_id=%s
                    ORDER BY date_envoi ASC LIMIT 1
                """, (discussion_id,))
                first_msg = cursor.fetchone()
                if first_msg:
                    auteur_name = first_msg["auteur_name"]
                else:
                    return jsonify({"error": "Impossible de retrouver le nom de l'utilisateur"}), 400

            elif user["role"] == "professional":
                auteur_name = f"{user['nom']} {user['prenom']}"

                # Si c’est le premier message du pro → statut passe à "en_cours"
                cursor.execute("""
                    UPDATE discussion SET statut='en_cours'
                    WHERE id=%s AND statut='ouvert'
                """, (discussion_id,))
                conn.commit()

            # Ajouter le message
            cursor.execute("""
                INSERT INTO messages (discussion_id, auteur_id, auteur_name, message)
                VALUES (%s, %s, %s, %s)
            """, (discussion_id, auteur_id, auteur_name, message))
            conn.commit()
            message_id = cursor.lastrowid

        return jsonify({
            "message": "Message added",
            "message_id": message_id,
            "auteur_name": auteur_name
        }), 201

    finally:
        if conn:
            conn.close()
