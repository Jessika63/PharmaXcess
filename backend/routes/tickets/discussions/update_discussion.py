
from flask import Blueprint, request, jsonify
from datetime import datetime
from db_app import get_app_connection

update_discussion_bp = Blueprint('update_discussion', __name__, url_prefix='/discussions')

@update_discussion_bp.route('/update/<int:discussion_id>', methods=['PUT'])
def update_discussion(discussion_id):
    data = request.json
    statut = data.get("statut")
    professionnel_id = data.get("professionnel_id")

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM discussion WHERE id=%s", (discussion_id,))
            discussion = cursor.fetchone()
            if not discussion:
                return jsonify({"error": "Discussion not found"}), 404

            updates = []
            values = []

            if statut:
                updates.append("statut=%s")
                values.append(statut)
                if statut == "ferme":
                    updates.append("date_fermeture=%s")
                    values.append(datetime.now())
            if professionnel_id:
                updates.append("professionnel_id=%s")
                values.append(professionnel_id)

            if not updates:
                return jsonify({"error": "Nothing to update"}), 400

            values.append(discussion_id)
            sql = f"UPDATE discussion SET {', '.join(updates)} WHERE id=%s"
            cursor.execute(sql, tuple(values))
            conn.commit()
        return jsonify({"message": "Discussion updated"})
    finally:
        if conn:
            conn.close()
