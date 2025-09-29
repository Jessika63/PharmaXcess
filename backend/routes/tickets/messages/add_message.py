
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
            cursor.execute("INSERT INTO messages (discussion_id, auteur_id, message) VALUES (%s,%s,%s)",
                           (discussion_id, auteur_id, message))
            conn.commit()
            message_id = cursor.lastrowid
        return jsonify({"message": "Message added", "message_id": message_id}), 201
    finally:
        if conn:
            conn.close()
