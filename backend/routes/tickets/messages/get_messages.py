
from flask import Blueprint, jsonify
from db_app import get_app_connection

get_messages_bp = Blueprint('get_messages', __name__, url_prefix='/messages')

@get_messages_bp.route('/discussion/<int:discussion_id>', methods=['GET'])
def get_messages(discussion_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM messages WHERE discussion_id=%s ORDER BY date_envoi ASC", (discussion_id,))
            messages = cursor.fetchall()
        return jsonify(messages)
    finally:
        if conn:
            conn.close()