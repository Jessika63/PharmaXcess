
from flask import Blueprint, jsonify
from db_app import get_app_connection

delete_message_bp = Blueprint('delete_message', __name__, url_prefix='/messages')

@delete_message_bp.route('/delete/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:

            # Récupérer discussion_id du message
            cursor.execute("SELECT discussion_id, date_envoi FROM messages WHERE id=%s", (message_id,))
            msg = cursor.fetchone()
            if not msg:
                return jsonify({"error": "Message not found"}), 404

            discussion_id = msg["discussion_id"]

            # Vérifier si c’est le premier message de la discussion
            cursor.execute("""
                SELECT id FROM messages
                WHERE discussion_id=%s
                ORDER BY date_envoi ASC LIMIT 1
            """, (discussion_id,))
            first_msg = cursor.fetchone()

            if first_msg and first_msg["id"] == message_id:
                # Supprimer la discussion entière
                cursor.execute("DELETE FROM discussion WHERE id=%s", (discussion_id,))
                conn.commit()
                return jsonify({"message": "First message deleted -> Discussion deleted"})

            # Sinon on supprime juste le message
            cursor.execute("DELETE FROM messages WHERE id=%s", (message_id,))
            conn.commit()
            return jsonify({"message": "Message deleted"})

    finally:
        if conn:
            conn.close()
