from flask import Blueprint, request, jsonify, send_from_directory, current_app
from db_app import get_app_connection
import os
import time
import pymysql
from werkzeug.utils import secure_filename

SECRET_HEADER_KEY = os.getenv('CORS_SECRET_KEY')

documents_bp = Blueprint("documents", __name__)

# Ensure uploads folder exists and table exists
UPLOAD_ROOT = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_ROOT, exist_ok=True)

# Upload a document for a user
@documents_bp.route('/documents/<int:user_id>', methods=['POST'])
def upload_document(user_id):
    # Accept multipart/form-data with file under 'file' and optional 'title'
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    title = request.form.get('title') or file.filename

    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = f"{user_id}_{int(time.time())}_{secure_filename(file.filename)}"
    user_folder = os.path.join(UPLOAD_ROOT, str(user_id))
    os.makedirs(user_folder, exist_ok=True)
    filepath = os.path.join(user_folder, filename)
    # Save uploaded file quickly
    file.save(filepath)
    size = os.path.getsize(filepath)

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            # Insert with status 'processing' so frontend can close immediately
            cursor.execute(
                "INSERT INTO documents (utilisateur_id, title, filename, size, status) VALUES (%s, %s, %s, %s, %s)",
                (user_id, title, filename, size, 'processing')
            )
            conn.commit()
            doc_id = cursor.lastrowid

        # Return 202 Accepted to indicate processing is ongoing (frontend can close the page)
        return jsonify({"id": doc_id, "title": title, "filename": filename, "size": size, "status": "processing", "message": "Votre image est en cours de traitement. Elle sera disponible dans les plus brefs délais."}), 202
    except Exception as e:
        # cleanup file on error
        try:
            os.remove(filepath)
        except Exception:
            pass
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# Update a document (metadata or replace file)
@documents_bp.route('/documents/<int:user_id>/<int:doc_id>', methods=['PUT'])
def update_document(user_id, doc_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM documents WHERE id=%s AND utilisateur_id=%s", (doc_id, user_id))
            doc = cursor.fetchone()
            if not doc:
                return jsonify({"error": "Document not found"}), 404

        title = request.form.get('title')
        replace_file = 'file' in request.files

        # If replacing file, save new one and remove old
        if replace_file:
            file = request.files['file']
            filename = f"{user_id}_{int(time.time())}_{secure_filename(file.filename)}"
            user_folder = os.path.join(UPLOAD_ROOT, str(user_id))
            os.makedirs(user_folder, exist_ok=True)
            filepath = os.path.join(user_folder, filename)
            file.save(filepath)
            size = os.path.getsize(filepath)

            # remove old file if exists
            old_path = os.path.join(UPLOAD_ROOT, str(user_id), doc['filename']) if doc.get('filename') else None
            try:
                if old_path and os.path.exists(old_path):
                    os.remove(old_path)
            except Exception:
                pass

            with conn.cursor() as cursor:
                if title:
                    cursor.execute("UPDATE documents SET title=%s, filename=%s, size=%s, status=%s WHERE id=%s", (title, filename, size, 'processing', doc_id))
                else:
                    cursor.execute("UPDATE documents SET filename=%s, size=%s, status=%s WHERE id=%s", (filename, size, 'processing', doc_id))
                conn.commit()
        else:
            if title:
                with conn.cursor() as cursor:
                    cursor.execute("UPDATE documents SET title=%s WHERE id=%s", (title, doc_id))
                    conn.commit()

        return jsonify({"message": "Document updated"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# List all documents for a user
@documents_bp.route('/documents/<int:user_id>', methods=['GET'])
def list_documents(user_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, title, filename, size, date_ajout, status FROM documents WHERE utilisateur_id=%s ORDER BY date_ajout DESC", (user_id,))
            docs = cursor.fetchall()

            # Fix rows that were marked 'processing' by migration but whose files exist on disk:
            # If file exists, mark status as 'done' in DB so UI shows correct state after re-login.
            updated = False
            user_folder = os.path.join(UPLOAD_ROOT, str(user_id))
            for d in docs:
                filename = d.get('filename') if isinstance(d, dict) else None
                status = d.get('status') if isinstance(d, dict) else None
                if filename and status and status != 'done':
                    file_path = os.path.join(user_folder, filename)
                    try:
                        if os.path.exists(file_path):
                            cursor.execute("UPDATE documents SET status=%s WHERE id=%s", ('done', d['id']))
                            d['status'] = 'done'
                            updated = True
                    except Exception:
                        # ignore file check/update errors
                        pass

            if updated:
                conn.commit()

        return jsonify(docs), 200
    finally:
        conn.close()


# Download a document
@documents_bp.route('/documents/<int:user_id>/<int:doc_id>', methods=['GET'])
def download_document(user_id, doc_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT filename, status FROM documents WHERE id=%s AND utilisateur_id=%s", (doc_id, user_id))
            doc = cursor.fetchone()
            if not doc:
                return jsonify({"error": "Document not found"}), 404
            filename = doc['filename']
            status = doc.get('status') if isinstance(doc, dict) else None
        user_folder = os.path.join(UPLOAD_ROOT, str(user_id))
        file_path = os.path.join(user_folder, filename)
        # If file exists on disk, allow download and ensure DB marks it 'done'
        if os.path.exists(file_path):
            try:
                with conn.cursor() as cursor:
                    if status != 'done':
                        cursor.execute("UPDATE documents SET status=%s WHERE id=%s", ('done', doc_id))
                        conn.commit()
            except Exception:
                pass
            return send_from_directory(user_folder, filename, as_attachment=True)

        # File not present — respect processing status
        if status and status != 'done':
            return jsonify({"error": "Document en cours de traitement", "message": "Le document est en cours de traitement. Réessayez plus tard."}), 202
        return jsonify({"error": "File not found on server"}), 404
    finally:
        conn.close()


# Endpoint to check background processing status
@documents_bp.route('/documents/status/<int:doc_id>', methods=['GET'])
def document_status(doc_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, title, filename, size, date_ajout, status FROM documents WHERE id=%s", (doc_id,))
            doc = cursor.fetchone()
            if not doc:
                return jsonify({"error": "Document not found"}), 404
        return jsonify(doc), 200
    finally:
        conn.close()


@documents_bp.route('/documents/<int:user_id>/<int:doc_id>/status', methods=['POST'])
def set_document_status(user_id, doc_id):
    """Set status to 'done' or 'failed'. Protected by X-Secret-Key header matching CORS_SECRET_KEY."""
    received = request.headers.get('X-Secret-Key')
    if SECRET_HEADER_KEY and received != SECRET_HEADER_KEY:
        return jsonify({"error": "Unauthorized - Invalid secret key"}), 401

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ('done', 'failed'):
        return jsonify({"error": "Invalid status; must be 'done' or 'failed'"}), 400

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM documents WHERE id=%s AND utilisateur_id=%s", (doc_id, user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Document not found"}), 404
            cursor.execute("UPDATE documents SET status=%s WHERE id=%s", (new_status, doc_id))
            conn.commit()
        return jsonify({"id": doc_id, "status": new_status}), 200
    finally:
        conn.close()


# Delete a document
@documents_bp.route('/documents/<int:user_id>/<int:doc_id>', methods=['DELETE'])
def delete_document(user_id, doc_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT filename FROM documents WHERE id=%s AND utilisateur_id=%s", (doc_id, user_id))
            doc = cursor.fetchone()
            if not doc:
                return jsonify({"error": "Document not found"}), 404
            filename = doc['filename']
            cursor.execute("DELETE FROM documents WHERE id=%s", (doc_id,))
            conn.commit()

        # remove file
        try:
            path = os.path.join(UPLOAD_ROOT, str(user_id), filename)
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass

        return jsonify({"message": "Document deleted"}), 200
    finally:
        conn.close()
