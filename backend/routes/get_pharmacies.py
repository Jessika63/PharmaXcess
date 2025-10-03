
from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql

get_pharmacies_bp = Blueprint('get_pharmacies', __name__)

@get_pharmacies_bp.route('/get_pharmacies', methods=['GET'])
def get_pharmacies():
    """
    Objectif: Récupérer les 10 distributeurs les plus proches
              en fonction d'une latitude et d'une longitude.
    """

    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Both 'lat' and 'lon' are required"}), 400

    try:
        conn = get_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            query = """
            SELECT
                id,
                nom,
                adresse,
                latitude,
                longitude,
                (
                    6371 * acos(
                        cos(radians(%s))
                        * cos(radians(latitude))
                        * cos(radians(longitude) - radians(%s))
                        + sin(radians(%s))
                        * sin(radians(latitude))
                    )
                ) AS distance_km
            FROM distributeurs
            ORDER BY distance_km ASC
            LIMIT 10;
            """
            cursor.execute(query, (lat, lon, lat))
            results = cursor.fetchall()

        conn.close()

        # ✅ Remap "nom" -> "name"
        pharmacies = []
        for row in results:
            pharmacies.append({
                "id": row["id"],
                "name": row["nom"],  # 👈 renommé
                "adresse": row["adresse"],
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "distance_km": row["distance_km"],
            })

        return jsonify({
            "pharmacies": pharmacies,
            "message": "Distributeurs sent successfully"
        }), 200

    except Exception as e:
        print(f"DB Error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
