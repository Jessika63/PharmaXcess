
from flask import Blueprint, jsonify
from db_app import get_app_connection

delete_message_bp = Blueprint('delete_message', __name__, url_prefix='/messages')

@delete_message_bp.route('/delete/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM messages WHERE id=%s", (message_id,))
            conn.commit()
        return jsonify({"message": "Message deleted"})
    finally:
        if conn:
            conn.close()
