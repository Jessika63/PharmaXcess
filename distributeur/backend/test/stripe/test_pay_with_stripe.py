import pytest
import json
import stripe
from unittest.mock import mock_open, patch
import os

MOCK_MEDICINE_DATA = {
    "medicine": [
        {"id": 1, "label": "Aspirin", "price": 5.99, "size": 100, "category": "painkiller"},
        {"id": 2, "label": "Ibuprofen", "price": 7.50, "size": 50, "category": "painkiller"}
    ]
}

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_intent_success(client, monkeypatch):
    """Test successful creation of a payment intent with valid drug ID and Stripe configuration"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    monkeypatch.setattr("stripe.PaymentIntent.create", lambda **kwargs:
        type('obj', (object,), {'client_secret': 'secret_123', 'id': 'pi_123'}))

    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(MOCK_MEDICINE_DATA)))

    response = client.post('/create-payment-intent', json={'drug_id': 1})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "clientSecret" in data
    assert data["message"] == "Payment Intent créé"

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_stripe_error(client, monkeypatch):
    """Test handling of Stripe card errors during payment intent creation"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(MOCK_MEDICINE_DATA)))

    def mock_stripe_error(**kwargs):
        raise stripe.error.CardError("Card declined", param=None, code="card_declined")

    monkeypatch.setattr("stripe.PaymentIntent.create", mock_stripe_error)

    response = client.post('/create-payment-intent', json={'drug_id': 1})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "Erreur Stripe" in data["error"]

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_json_error(client, monkeypatch):
    """Test handling of invalid JSON data in medicine file"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data="{ invalid json }"))

    response = client.post('/create-payment-intent', json={'drug_id': 1})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_invalid_drug_id(client, monkeypatch):
    """Test handling of invalid drug ID parameter"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(MOCK_MEDICINE_DATA)))

    response = client.post('/create-payment-intent', json={'drug_id': 'invalid'})
    assert response.status_code == 404
    data = json.loads(response.data)
    assert "error" in data
    assert "Medicament non trouvé" in data["error"]

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_missing_price(client, monkeypatch):
    """Test handling of missing price field in medicine data"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    invalid_medicine = {
        "medicine": [{"id": 1, "label": "Aspirin", "size": 100, "category": "painkiller"}]
    }
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(invalid_medicine)))

    response = client.post('/create-payment-intent', json={'drug_id': 1})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_negative_price(client, monkeypatch):
    """Test handling of negative price values in medicine data"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    invalid_medicine = {
        "medicine": [{"id": 1, "label": "Aspirin", "price": -5.99, "size": 100, "category": "painkiller"}]
    }
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(invalid_medicine)))

    response = client.post('/create-payment-intent', json={'drug_id': 1})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_missing_stripe_key(client, monkeypatch):
    """Test handling of missing Stripe API key configuration"""
    # Save current key to restore after test
    original_key = os.getenv("STRIPE_SECRET_KEY")

    # Remove API key
    monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)

    # Mock file operations
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(MOCK_MEDICINE_DATA)))

    response = client.post('/create-payment-intent', json={'drug_id': 1})

    # Restore API key
    if original_key:
        monkeypatch.setenv("STRIPE_SECRET_KEY", original_key)

    assert response.status_code == 500
    data = json.loads(response.data)
    assert data["error"] == "Stripe API key not configured"

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_missing_drug_id(client, monkeypatch):
    """Test handling of missing drug_id parameter in request"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(MOCK_MEDICINE_DATA)))

    # Send request without drug_id
    response = client.post('/create-payment-intent', json={})

    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["error"] == "Missing drug_id"

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_medicine_file_not_found(client, monkeypatch):
    """Test handling of missing medicine data file"""
    monkeypatch.setattr("os.path.exists", lambda x: False)
    response = client.post('/create-payment-intent', json={'drug_id': 1})
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["error"] == "Medicine data file not found"

@pytest.mark.order(2)  # LOX n°5
def test_create_payment_invalid_amount_format(client, monkeypatch):
    """Test handling of invalid price format in medicine data"""
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_valid_key")

    # Create data with invalid price
    invalid_medicine = {
        "medicine": [
            {"id": 1, "label": "Aspirin", "price": "invalid_price", "size": 100, "category": "painkiller"}
        ]
    }

    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(invalid_medicine)))

    response = client.post('/create-payment-intent', json={'drug_id': 1})

    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["error"] == "Invalid amount format"
