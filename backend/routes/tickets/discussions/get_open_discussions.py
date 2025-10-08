
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from pymysql.cursors import DictCursor

get_open_discussions_bp = Blueprint('get_open_discussions', __name__, url_prefix='/discussions')

@get_open_discussions_bp.route('/open', methods=['GET'])
def get_open_discussions():
    sector = request.args.get("sector")   # "pharmacien", "medecin", "all"
    region = request.args.get("region")

    if not sector or not region:
        return jsonify({"error": "sector and region are required"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(DictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM discussion
                WHERE statut='ouvert'
                  AND region=%s
                  AND (destinataire=%s OR destinataire='all')
            """, (region, sector))
            discussions = cursor.fetchall()
        return jsonify({"open_discussions": discussions})
    finally:
        if conn:
            conn.close()
