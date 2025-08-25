
from flask import Blueprint, request, jsonify, current_app
import stripe
import json
import os

update_stock_bp = Blueprint('update-stock', __name__)

@update_stock_bp.route('/update-stock', methods=['POST'])
def update_stock():
    """
    Objectif: Decrements the stock count of a specific medication by one unit.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - drug_id: The unique identifier of the medication whose stock needs to be updated. (String/Integer, Required)

    Return Value:
        - 200: JSON response confirming successful stock update. (Object)
        - 400: JSON error response if drug_id is missing or stock is already depleted. (Object)
        - 404: JSON error response if the medicine data file is not found. (Object)
        - 500: JSON error response for file operation failures or other internal errors. (Object)
    """
    try:
        data = request.get_json()
        drug_id = data.get('drug_id')

        if not drug_id:
            return jsonify({"error": "Missing drug_id"}), 400

        json_path = '/data/medicine_available.json'

        if not os.path.exists(json_path):
            return jsonify({"error": "Medicine data file not found"}), 404

        # Read and update the file
        with open(json_path, 'r+', encoding='utf-8') as file:
            medicines_data = json.load(file)
            medicines = medicines_data.get("medicine", [])

            # Find the medicine and decrement the stock
            for med in medicines:
                if med["id"] == int(drug_id):
                    if med["size"] > 0:
                        med["size"] -= 1
                    else:
                        return jsonify({"error": "Stock épuisé"}), 400
                    break

            # Rewrite the file
            file.seek(0)
            json.dump(medicines_data, file, indent=4)
            file.truncate()

        return jsonify({"message": "Stock mis à jour avec succès"}), 200

    except Exception as e:
        print(f"Erreur: {e}")
        return jsonify({"error": str(e) or "Erreur inconnue"}), 500
