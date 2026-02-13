
from flask import Blueprint, jsonify
from db_app import get_app_connection

reopen_discussion_bp = Blueprint('reopen_discussion', __name__, url_prefix='/discussions')

@reopen_discussion_bp.route('/reopen/<int:discussion_id>', methods=['PUT'])
def reopen_discussion(discussion_id):
    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE discussion SET statut='ouvert', date_fermeture=NULL WHERE id=%s", (discussion_id,))
            conn.commit()
        return jsonify({"message": "Discussion reopened"})
    finally:
        if conn:
            conn.close()
