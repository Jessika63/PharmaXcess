from flask import Blueprint, request, jsonify
from db_app import get_app_connection
from datetime import datetime
import base64
import pymysql

clickcollect_temp_images_bp = Blueprint('clickcollect_temp_images', __name__)

# -------------------------------------------------
# POST /clickcollect/upload_temp_image
# -------------------------------------------------
@clickcollect_temp_images_bp.route("/clickcollect/upload_temp_image", methods=["POST"])
def upload_temp_image():
    """
    Upload a temporary prescription image for a user (base64 encoded).
    Request JSON:
      - user_id (int, required)
      - ordonnance_id (int, optional)
      - filename (str, optional)
      - image_base64 (str, required)
      - mime_type (str, optional, default='image/png')
    """
    data = request.get_json() or {}
    user_id = data.get("user_id")
    ordonnance_id = data.get("ordonnance_id")
    filename = data.get("filename")
    image_base64 = data.get("image_base64")
    mime_type = data.get("mime_type", "image/png")

    if not user_id or not image_base64:
        return jsonify({"error": "Missing 'user_id' or 'image_base64'"}), 400

    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception:
        return jsonify({"error": "Invalid base64 image"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO ordonnance_images_temp
                (utilisateur_id, ordonnance_id, filename, image_data, mime_type, date_upload)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (user_id, ordonnance_id, filename, image_bytes, mime_type, datetime.now()))
        conn.commit()
        return jsonify({"message": "Image uploaded successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


# -------------------------------------------------
# GET /clickcollect/temp_image
# -------------------------------------------------
@clickcollect_temp_images_bp.route("/clickcollect/temp_image", methods=["GET"])
def get_temp_image():
    """
    Retrieve a temporary image (by image_id or user_id).
    Query params:
      - image_id (int, optional)
      - user_id (int, optional)
    """
    image_id = request.args.get("image_id")
    user_id = request.args.get("user_id")

    if not image_id and not user_id:
        return jsonify({"error": "Provide either 'image_id' or 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            if image_id:
                cursor.execute("""
                    SELECT id, utilisateur_id, filename, image_data, mime_type, date_upload
                    FROM ordonnance_images_temp
                    WHERE id=%s
                """, (image_id,))
            else:
                cursor.execute("""
                    SELECT id, utilisateur_id, filename, image_data, mime_type, date_upload
                    FROM ordonnance_images_temp
                    WHERE utilisateur_id=%s
                    ORDER BY date_upload DESC
                    LIMIT 1
                """, (user_id,))
            row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Image not found"}), 404

        image_base64 = base64.b64encode(row["image_data"]).decode("utf-8")
        return jsonify({
            "id": row["id"],
            "user_id": row["utilisateur_id"],
            "filename": row["filename"],
            "mime_type": row["mime_type"],
            "date_upload": row["date_upload"].isoformat() if row["date_upload"] else None,
            "image_base64": image_base64
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


# -------------------------------------------------
# DELETE /clickcollect/temp_image
# -------------------------------------------------
@clickcollect_temp_images_bp.route("/clickcollect/temp_image", methods=["DELETE"])
def delete_temp_image():
    """
    Delete a temporary image (by image_id or user_id).
    Query params:
      - image_id (int, optional)
      - user_id (int, optional)
    """
    image_id = request.args.get("image_id")
    user_id = request.args.get("user_id")

    if not image_id and not user_id:
        return jsonify({"error": "Provide either 'image_id' or 'user_id'"}), 400

    conn = None
    try:
        conn = get_app_connection()
        with conn.cursor() as cursor:
            if image_id:
                cursor.execute("DELETE FROM ordonnance_images_temp WHERE id=%s", (image_id,))
            else:
                cursor.execute("DELETE FROM ordonnance_images_temp WHERE utilisateur_id=%s", (user_id,))
        conn.commit()
        return jsonify({"message": "Image deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
