from flask import Blueprint, jsonify
from db_app import get_app_connection
import pymysql

from routes.profile.profile_access import get_current_user_id

get_non_verified_ordonnances_bp = Blueprint(
    "get_non_verified_ordonnances",
    __name__
)

@get_non_verified_ordonnances_bp.route("/ordonnances/non_verifiees", methods=["GET"])
def get_non_verified_ordonnances():
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    conn = get_app_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT *
                FROM ordonnances
                WHERE statut = 'non_verifiee'
            """)
            ordonnances = cursor.fetchall()
    finally:
        conn.close()

    return jsonify(ordonnances), 200
