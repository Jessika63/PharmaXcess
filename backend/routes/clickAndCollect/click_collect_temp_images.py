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
    # Support both JSON payloads (base64) and multipart/form-data (file upload + form fields)
    data = {}
    image_base64 = None
    mime_type = 'image/png'

    # If this is a multipart/form-data request, fields will be in request.form
    if request.files:
        # read simple form fields
        data = request.form.to_dict() or {}
        image_base64 = None
        mime_type = data.get('mime_type', mime_type)
    else:
        data = request.get_json() or {}
        image_base64 = data.get('image_base64')
        mime_type = data.get('mime_type', mime_type)

    user_id = data.get("user_id")
    ordonnance_id = data.get("ordonnance_id")
    filename = data.get("filename")

    # Basic validation: for JSON uploads require user_id and image_base64; for file uploads require user_id
    if request.files:
        if not user_id:
            return jsonify({"error": "Missing 'user_id' in multipart form-data"}), 400
    else:
        if not user_id or not image_base64:
            return jsonify({"error": "Missing 'user_id' or 'image_base64'"}), 400

    # Debug: measure incoming size. For multipart uploads we rely on content_length; for JSON/base64 decode the payload
    try:
        content_len = request.content_length
    except Exception:
        content_len = None

    image_bytes = None
    b64_len = None
    if request.files:
        # For file uploads, we will save the file to disk and can use content length as an approximation
        img_len = content_len or 0
        print(f"[DEBUG] upload_temp_image (multipart): user_id={user_id} filename={filename} content_length={content_len}")
    else:
        # JSON/base64 payload: decode and measure
        try:
            image_bytes = base64.b64decode(image_base64)
            b64_len = len(image_base64) if image_base64 is not None else None
            img_len = len(image_bytes) if image_bytes is not None else 0
        except Exception:
            return jsonify({"error": "Invalid base64 image"}), 400
        print(f"[DEBUG] upload_temp_image (json): user_id={user_id} filename={filename} b64_len={b64_len} bytes={img_len}")

    # If image is too large, return a clear error before attempting DB write
    MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB threshold; adjust as needed
    if img_len and img_len > MAX_UPLOAD_BYTES:
        return jsonify({"error": "Image too large", "size": img_len}), 413

    conn = None
    conn = None
    try:
        # Debug: log incoming request size and form keys to help diagnose upload failures
        try:
            content_len = request.content_length
        except Exception:
            content_len = None
        try:
            form_keys = list(request.form.keys()) if request.form else []
        except Exception:
            form_keys = []
        print(f"[DEBUG] upload_temp_image request: content_length={content_len} form_keys={form_keys} files={list(request.files.keys())}")
        # Support multipart file upload (preferred) or base64 payload
        file = None
        if 'file' in request.files:
            file = request.files['file']

        if file:
            # Save uploaded file to disk (uploads/ordonnances/) to avoid large BLOBs in DB
            import os
            # Compute the backend folder relative to this file to avoid issues when the
            # process current working directory is already 'backend' (which would produce
            # a duplicated 'backend/backend/uploads' path). The file is located at:
            # backend/routes/clickAndCollect/click_collect_temp_images.py
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'ordonnances')
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            # Build a safe filename
            from werkzeug.utils import secure_filename
            safe_name = secure_filename(file.filename or filename or f"ord_{user_id}_{int(datetime.now().timestamp())}.jpg")
            saved_path = os.path.join(UPLOAD_DIR, f"{int(user_id)}_{int(datetime.now().timestamp())}_{safe_name}")
            file.save(saved_path)
            # store the saved path in filename field to reference file on disk
            stored_filename = saved_path
            stored_image_bytes = None
            stored_mime = file.mimetype or mime_type

            conn = get_app_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ordonnance_images_temp
                    (utilisateur_id, ordonnance_id, filename, image_data, mime_type, date_upload)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, ordonnance_id, stored_filename, stored_image_bytes, stored_mime, datetime.now()))
                temp_id = cursor.lastrowid
            conn.commit()
            return jsonify({"message": "File uploaded successfully", "id": temp_id, "filepath": stored_filename}), 201

        else:
            conn = get_app_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ordonnance_images_temp
                    (utilisateur_id, ordonnance_id, filename, image_data, mime_type, date_upload)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, ordonnance_id, filename, image_bytes, mime_type, datetime.now()))
                # retrieve the inserted id to return to client
                temp_id = cursor.lastrowid
            conn.commit()
            return jsonify({"message": "Image uploaded successfully", "id": temp_id}), 201
    except pymysql.err.OperationalError as oe:
        # Common when packet too large or server closed connection
        print(f"[ERROR] upload_temp_image OperationalError: {oe}")
        return jsonify({"error": "Database operational error", "detail": str(oe), "hint": "Check mysql max_allowed_packet and server status"}), 503
    except Exception as e:
        print(f"[ERROR] upload_temp_image Exception: {e}")
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

        # If image_data is stored in DB use it; otherwise, if filename points to a saved file, read it
        if row.get("image_data"):
            image_base64 = base64.b64encode(row["image_data"]).decode("utf-8")
        else:
            # try to read from filesystem if filename contains a path
            filepath = row.get("filename")
            if filepath and isinstance(filepath, str):
                try:
                    import os
                    if os.path.isabs(filepath) and os.path.exists(filepath):
                        with open(filepath, 'rb') as f:
                            image_base64 = base64.b64encode(f.read()).decode('utf-8')
                    else:
                        image_base64 = None
                except Exception:
                    image_base64 = None
            else:
                image_base64 = None

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
