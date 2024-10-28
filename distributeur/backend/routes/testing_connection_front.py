from flask import Blueprint, request, jsonify
from db import get_connection  # Importer la fonction de connexion

testFrontPost_bp = Blueprint('testFrontPost', __name__)
testFrontGet_bp = Blueprint('testFrontGet', __name__)
testFrontDelete_bp = Blueprint('testFrontDelete', __name__)
testFrontPut_bp = Blueprint('testFrontPut', __name__)


@testFrontPost_bp.route('/testFrontPost', methods=['POST'])
def testFrontPost():
    """
    Her to test front post

    Request body (JSON):
        - value: a value just to test

    Return Value:
        - 200 worked.
        - 400 Bad Request if required fields are missing.
        - 500 Internal Server Error if database or other error.
    """

    data = request.get_json()
    value = data.get('value')

    if not value:
        return jsonify({"error": "Value not provided"}), 400

    connection = None  # Initialiser ici

    try:
        connection = get_connection()  # Établir la connexion ici
        with connection.cursor() as cursor:

            # bla bla bla

            return jsonify({"message": "routes worked"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if connection:
            connection.close()  # Vérifier avant de fermer


@testFrontGet_bp.route('/testFrontGet', methods=['GET'])
def testFrontGet():
    """
    Her to test front get

    Request body (JSON):
        - value: a value just to test

    Return Value:
        - 200 worked.
        - 400 Bad Request if required fields are missing.
        - 500 Internal Server Error if database or other error.
    """

    value = request.args.get('value')

    if not value:
        return jsonify({"error": "Value not provided"}), 400

    try:
        connection = get_connection()  # Établir la connexion ici
        with connection.cursor() as cursor:

            # bla bla bla

            if value:
                return jsonify({"message": "routes worked"}), 200
            else:
                return jsonify({"error": "routes not worked"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        connection.close()  # Fermer la connexion


@testFrontDelete_bp.route('/testFrontDelete', methods=['DELETE'])
def testFrontDelete():
    """
    Her to test front delete

    Request body (JSON):
        - value: a value just to test

    Return Value:
        - 200 worked.
        - 400 Bad Request if required fields are missing.
        - 500 Internal Server Error if database or other error.
    """

    value = request.args.get('value')

    if not value:
        return jsonify({"error": "Value not provided"}), 400

    try:
        connection = get_connection()  # Établir la connexion ici
        with connection.cursor() as cursor:

            # bla bla bla

            if value:
                return jsonify({"message": "routes worked"}), 200
            else:
                return jsonify({"error": "routes not worked"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        connection.close()  # Fermer la connexion


@testFrontPut_bp.route('/testFrontPut', methods=['PUT'])
def testFrontPut():
    """
    Here to test front put

    Request body (JSON):
        - value: the new value to update
        - id: the ID of the record to update

    Return Value:
        - 200 worked.
        - 400 Bad Request if required fields are missing.
        - 500 Internal Server Error if database or other error.
    """

    data = request.get_json()
    value = data.get('value')

    if not value:
        return jsonify({"error": "Value not provided"}), 400

    connection = None  # Initialiser la connexion

    try:
        connection = get_connection()  # Établir la connexion ici
        with connection.cursor() as cursor:

            # bla bla bla

            if value:
                return jsonify({"message": "routes worked"}), 200
            else:
                return jsonify({"error": "routes not worked"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if connection:
            connection.close()  # Fermer la connexion
