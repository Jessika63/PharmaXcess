
from flask import Blueprint, jsonify
from db_app import get_app_connection

get_professional_discussions_bp = Blueprint('get_professional_discussions', __name__, url_prefix='/discussions')

@get_professional_discussions_bp.route('/professional/<int:professional_id>', methods=['GET'])
def get_professional_discussions(professional_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM discussion WHERE pharmacien_id=%s ORDER BY date_creation DESC", (professional_id,))
            discussions = cursor.fetchall()
        return jsonify(discussions)
    finally:
        if conn:
            conn.close()
