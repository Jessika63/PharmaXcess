
from flask import Blueprint, request, jsonify
from db_app import get_app_connection

traitements_bp = Blueprint('traitements', __name__)

# CREATE
@traitements_bp.route('/traitements', methods=['POST'])
def create_traitement():
    data = request.get_json()
    maladie_id = data.get("maladie_id")
    nom = data.get("nom")

    if not maladie_id or not nom:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO traitements (maladie_id, nom, debut, fin, dosage, duree, effets_secondaires)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            maladie_id, nom, data.get("debut"), data.get("fin"),
            data.get("dosage"), data.get("duree"), data.get("effets_secondaires")
        ))
        conn.commit()
        traitement_id = cursor.lastrowid
    return jsonify({"message": "Traitement ajouté", "id": traitement_id}), 201


# GET ALL
@traitements_bp.route('/traitements/<int:maladie_id>', methods=['GET'])
def get_all_traitements(maladie_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM traitements WHERE maladie_id=%s", (maladie_id,))
        traitements = cursor.fetchall()
    return jsonify(traitements), 200


# GET UNIQUE
@traitements_bp.route('/traitement/<int:traitement_id>', methods=['GET'])
def get_traitement(traitement_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM traitements WHERE id=%s", (traitement_id,))
        traitement = cursor.fetchone()
    if not traitement:
        return jsonify({"error": "Traitement non trouvé"}), 404
    return jsonify(traitement), 200


# UPDATE
@traitements_bp.route('/traitement/<int:traitement_id>', methods=['PUT'])
def update_traitement(traitement_id):
    data = request.get_json()
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE traitements
            SET nom=%s, debut=%s, fin=%s, dosage=%s, duree=%s, effets_secondaires=%s
            WHERE id=%s
        """, (
            data.get("nom"), data.get("debut"), data.get("fin"),
            data.get("dosage"), data.get("duree"), data.get("effets_secondaires"),
            traitement_id
        ))
        conn.commit()
    return jsonify({"message": "Traitement mis à jour"}), 200


# DELETE
@traitements_bp.route('/traitement/<int:traitement_id>', methods=['DELETE'])
def delete_traitement(traitement_id):
    conn = get_app_connection()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM traitements WHERE id=%s", (traitement_id,))
        conn.commit()
    return jsonify({"message": "Traitement supprimé"}), 200
