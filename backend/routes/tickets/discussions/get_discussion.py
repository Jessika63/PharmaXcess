
from flask import Blueprint, jsonify
from db_app import get_app_connection

get_discussion_bp = Blueprint('get_discussion', __name__, url_prefix='/discussions')

@get_discussion_bp.route('/<int:discussion_id>', methods=['GET'])
def get_discussion(discussion_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM discussion WHERE id=%s", (discussion_id,))
            discussion = cursor.fetchone()
        if not discussion:
            return jsonify({"error": "Discussion not found"}), 404
        return jsonify(discussion)
    finally:
        if conn:
            conn.close()