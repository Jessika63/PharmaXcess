from flask import Blueprint, request, jsonify
import stripe
import os
import json

create_payment_intent_bp = Blueprint('create_payment_intent', __name__)

@create_payment_intent_bp.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """
    Objectif: Creates a Stripe Payment Intent for purchasing a specific medication.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - drug_id: The unique identifier of the medication to be purchased. (String, Required)

    Return Value:
        - 200: JSON response containing the Payment Intent client secret for completing the payment. (Object)
        - 400: JSON error response if the drug_id is missing or invalid. (Object)
        - 404: JSON error response if the medication is not found. (Object)
        - 500: JSON error response for Stripe API errors, missing API key, or other internal errors. (Object)
    """
    try:
        # 1. Check that the API key is loaded correctly
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe.api_key:
            return jsonify({"error": "Stripe API key not configured"}), 500

        # 2. Validate the input data
        data = request.get_json()
        if not data or 'drug_id' not in data not in data:
            return jsonify({"error": "Missing drug_id"}), 400

        drug_id = data['drug_id']

        # 3. Load the medications
        json_path = '/data/medicine_available.json'

        if not os.path.exists(json_path):
            return jsonify({"error": "Medicine data file not found"}), 404

        with open(json_path, "r", encoding="utf-8") as file:
            medicines = json.load(file).get("medicine", [])

        drug = next((d for d in medicines if d["id"] == drug_id), None)

        if not drug:
            return jsonify({"error": "Medicament non trouvé"}), 404

        # 4. Check the amount
        try:
            amount = float(drug['price'])

            # Convert to cents
            amount_cents = int(amount * 100)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid amount format"}), 400

        # 5. Create the Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='eur',
            metadata={
                'drug_id': drug_id,
                'drug_name': drug['label'],
                'category': drug['category']
            },
            automatic_payment_methods={
                'enabled': True,
            },
        )

        return jsonify({
            "message": "Payment Intent créé",
            "clientSecret": payment_intent.client_secret
        }), 200

    except stripe.error.StripeError as e:
        return jsonify({"error": f"Erreur Stripe: {str(e)}"}), 500
    except Exception as e:
        print(f"Erreur: {e}")
        return jsonify({"error": str(e) or "Erreur inconnue"}), 500
