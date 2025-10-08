
from flask import Blueprint, jsonify
from db_app import get_app_connection

delete_discussion_bp = Blueprint('delete_discussion', __name__, url_prefix='/discussions')

@delete_discussion_bp.route('/delete/<int:discussion_id>', methods=['DELETE'])
def delete_discussion(discussion_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM discussion WHERE id=%s", (discussion_id,))
            conn.commit()
        return jsonify({"message": "Discussion deleted"})
    finally:
        if conn:
            conn.close()
