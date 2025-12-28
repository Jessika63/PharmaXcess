from flask import Blueprint, request, jsonify
from db_app import get_app_connection
import pymysql
from datetime import datetime
import base64

ordonnances_bp = Blueprint('ordonnances', __name__)

# -------------------------------
# 🟢 CREATE Ordonnance
# -------------------------------
@ordonnances_bp.route("/ordonnances/create", methods=["POST"])
def create_ordonnance():
    """
    Crée une ordonnance à partir d'une image temporaire (ordonnance_images_temp)
    """
    data = request.get_json()
    user_id = data.get("user_id")
    description = data.get("description")
    medecin_nom = data.get("medecin_nom")
    date_prescription = data.get("date_prescription")
    date_expiration = data.get("date_expiration")
    medicaments = data.get("medicaments")
    temp_image_id = data.get("temp_image_id")

    if not user_id:
        return jsonify({"error": "Missing 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:

            fichier = None

            if temp_image_id:
                cursor.execute(
                    "SELECT * FROM ordonnance_images_temp WHERE id = %s AND utilisateur_id = %s",
                    (temp_image_id, user_id)
                )
                temp_img = cursor.fetchone()
                if not temp_img:
                    return jsonify({"error": "Temporary image not found or unauthorized"}), 404
                fichier = temp_img["filename"]

            cursor.execute("""
                INSERT INTO ordonnances (
                    utilisateur_id, description, fichier, medecin_nom, 
                    date_prescription, date_expiration, medicaments, date_ajout
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                description,
                fichier,
                medecin_nom,
                date_prescription,
                date_expiration,
                medicaments,
                datetime.now()
            ))
            ordonnance_id = cursor.lastrowid

            if temp_image_id:
                cursor.execute("""
                    UPDATE ordonnance_images_temp
                    SET ordonnance_id = %s
                    WHERE id = %s
                """, (ordonnance_id, temp_image_id))

            conn.commit()

        return jsonify({
            "message": "Ordonnance créée avec succès",
            "ordonnance_id": ordonnance_id
        }), 201

    except Exception as e:
        print(f"[ERROR] create_ordonnance: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


# -------------------------------
# 🟡 GET Ordonnances d'un utilisateur
# -------------------------------
@ordonnances_bp.route("/ordonnances", methods=["GET"])
def get_ordonnances():
    user_id = request.args.get("user_id")
    include_images = request.args.get("include_images", "0")
    if not user_id:
        return jsonify({"error": "Missing 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            # Fetch metadata only by default to keep payload small and fast for clients.
            # If client explicitly requests images (include_images=1) we will include base64 blobs.
            if include_images == '1':
                cursor.execute("""
                    SELECT o.*, t.id AS temp_image_id, t.mime_type, t.image_data
                    FROM ordonnances o
                    LEFT JOIN ordonnance_images_temp t 
                        ON o.id = t.ordonnance_id
                    WHERE o.utilisateur_id = %s
                    ORDER BY o.date_ajout DESC
                """, (user_id,))
                ordonnances = cursor.fetchall()
                for o in ordonnances:
                    if o.get("image_data"):
                        o["image_base64"] = base64.b64encode(o["image_data"]).decode("utf-8")
                    else:
                        o["image_base64"] = None
                    o.pop("image_data", None)
            else:
                cursor.execute("""
                    SELECT o.*, t.id AS temp_image_id, t.mime_type, t.filename, t.date_upload
                    FROM ordonnances o
                    LEFT JOIN ordonnance_images_temp t 
                        ON o.id = t.ordonnance_id
                    WHERE o.utilisateur_id = %s
                    ORDER BY o.date_ajout DESC
                """, (user_id,))
                ordonnances = cursor.fetchall()

        return jsonify({"ordonnances": ordonnances}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()



# -------------------------------
# 🔴 DELETE Ordonnance
# -------------------------------
@ordonnances_bp.route("/ordonnances/delete", methods=["DELETE"])
def delete_ordonnance():
    data = request.get_json()
    ordonnance_id = data.get("ordonnance_id")
    user_id = data.get("user_id")

    if not ordonnance_id or not user_id:
        return jsonify({"error": "Missing 'ordonnance_id' or 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM ordonnances WHERE id=%s AND utilisateur_id=%s",
                (ordonnance_id, user_id)
            )
            if not cursor.fetchone():
                return jsonify({"error": "Ordonnance not found or unauthorized"}), 404

            cursor.execute(
                "DELETE FROM ordonnance_images_temp WHERE ordonnance_id=%s",
                (ordonnance_id,)
            )

            cursor.execute(
                "DELETE FROM ordonnances WHERE id=%s",
                (ordonnance_id,)
            )
            conn.commit()

        return jsonify({"message": "Ordonnance supprimée avec succès"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
