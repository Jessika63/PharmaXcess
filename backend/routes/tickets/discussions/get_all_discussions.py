
from flask import Blueprint, jsonify
from db_app import get_app_connection

get_all_discussions_bp = Blueprint('get_all_discussions', __name__, url_prefix='/discussions')

@get_all_discussions_bp.route('/all', methods=['GET'])
def get_all_discussions():
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM discussion ORDER BY date_creation DESC")
            discussions = cursor.fetchall()
        return jsonify(discussions)
    finally:
        if conn:
            conn.close()
