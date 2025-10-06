
from flask import Blueprint, jsonify
from db_app import get_app_connection

get_user_discussions_bp = Blueprint('get_user_discussions', __name__, url_prefix='/discussions')

@get_user_discussions_bp.route('/user/<int:utilisateur_id>', methods=['GET'])
def get_user_discussions(utilisateur_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM discussion WHERE utilisateur_id=%s ORDER BY date_creation DESC", (utilisateur_id,))
            discussions = cursor.fetchall()
        return jsonify(discussions)
    finally:
        if conn:
            conn.close()
