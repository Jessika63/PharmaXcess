from flask import Blueprint, request, jsonify
import stripe
import os
import json

create_payment_intent_bp = Blueprint('create_payment_intent', __name__)

@create_payment_intent_bp.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """
    Crée un Payment Intent Stripe pour un médicament
    
    Requête JSON:
        - drug_id: ID du médicament
        - amount: Montant en euros (float)
    
    Return Value:
        - 200 OK avec le client_secret
        - 400 Bad Request si données manquantes
        - 404 Not Found si médicament non disponible
        - 500 Internal Server Error pour les autres erreurs
    """
    try:
        # 1. Configuration Stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
        # 2. Vérification des données reçues
        data = request.get_json()
        if not data or 'drug_id' not in data or 'amount' not in data:
            return jsonify({"error": "Missing drug_id or amount"}), 400
        
        drug_id = data['drug_id']
        amount = data['amount']
        
        # 3. Vérifier la disponibilité du médicament
        json_path = os.path.join(os.path.dirname(__file__), "../medicine_available.json")
        
        if not os.path.exists(json_path):
            return jsonify({"error": "Medicine data file not found"}), 404
        
        with open(json_path, "r", encoding="utf-8") as file:
            medicines = json.load(file).get("medicine", [])
        
        drug = next((d for d in medicines if d["id"] == drug_id), None)
        
        if not drug:
            return jsonify({"error": "Medicament non trouvé"}), 404
        
        # 4. Convertir le montant en centimes
        amount_cents = int(amount * 100)  # Stripe utilise des centimes
        
        # 5. Créer le Payment Intent
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
