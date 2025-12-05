from flask import Blueprint, request, jsonify, send_from_directory, current_app
from db_app import get_app_connection
import os
import time
from werkzeug.utils import secure_filename

documents_bp = Blueprint("documents", __name__)

# Ensure uploads folder exists and table exists
UPLOAD_ROOT = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_ROOT, exist_ok=True)

def ensure_table():
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                utilisateur_id INT NOT NULL,
                title VARCHAR(255),
                filename VARCHAR(255),
                size INT,
                date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
        conn.commit()
    finally:
        conn.close()


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
    file.save(filepath)
    size = os.path.getsize(filepath)

    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO documents (utilisateur_id, title, filename, size) VALUES (%s, %s, %s, %s)",
                (user_id, title, filename, size)
            )
            conn.commit()
            doc_id = cursor.lastrowid
        return jsonify({"id": doc_id, "title": title, "filename": filename, "size": size}), 201
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
                    cursor.execute("UPDATE documents SET title=%s, filename=%s, size=%s WHERE id=%s", (title, filename, size, doc_id))
                else:
                    cursor.execute("UPDATE documents SET filename=%s, size=%s WHERE id=%s", (filename, size, doc_id))
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
            cursor.execute("SELECT id, title, filename, size, date_ajout FROM documents WHERE utilisateur_id=%s ORDER BY date_ajout DESC", (user_id,))
            docs = cursor.fetchall()
        return jsonify(docs), 200
    finally:
        conn.close()


# Download a document
@documents_bp.route('/documents/<int:user_id>/<int:doc_id>', methods=['GET'])
def download_document(user_id, doc_id):
    conn = get_app_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT filename FROM documents WHERE id=%s AND utilisateur_id=%s", (doc_id, user_id))
            doc = cursor.fetchone()
            if not doc:
                return jsonify({"error": "Document not found"}), 404
            filename = doc['filename']
        user_folder = os.path.join(UPLOAD_ROOT, str(user_id))
        if not os.path.exists(os.path.join(user_folder, filename)):
            return jsonify({"error": "File not found on server"}), 404
        return send_from_directory(user_folder, filename, as_attachment=True)
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
