import pytest
import json
from unittest.mock import mock_open, patch

@pytest.mark.order(3)  # LOX n°5
def test_update_stock_success(client, monkeypatch):
    """Test successful stock update"""
    mock_medicine = [
        {"id": 1, "label": "Aspirin", "price": 5.99, "size": 100},
        {"id": 2, "label": "Ibuprofen", "price": 7.50, "size": 50}
    ]

    # Mock file operations
    monkeypatch.setattr("os.path.exists", lambda x: True)
    m = mock_open(read_data=json.dumps({"medicine": mock_medicine}))
    m.return_value.__enter__ = m
    monkeypatch.setattr("builtins.open", m)

    response = client.post('/update-stock', json={'drug_id': 1})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["message"] == "Stock mis à jour avec succès"

@pytest.mark.order(3)  # LOX n°5
def test_update_stock_missing_drug_id(client):
    """Test missing drug_id parameter"""
    response = client.post('/update-stock', json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["error"] == "Missing drug_id"

@pytest.mark.order(3)  # LOX n°5
def test_update_stock_out_of_stock(client, monkeypatch):
    """Test updating out-of-stock item"""
    mock_medicine = [{"id": 1, "label": "Aspirin", "price": 5.99, "size": 0}]
    monkeypatch.setattr("os.path.exists", lambda x: True)
    m = mock_open(read_data=json.dumps({"medicine": mock_medicine}))
    m.return_value.__enter__ = m
    monkeypatch.setattr("builtins.open", m)

    response = client.post('/update-stock', json={'drug_id': 1})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["error"] == "Stock épuisé"

@pytest.mark.order(3)  # LOX n°5
def test_update_stock_file_not_found(client, monkeypatch):
    """Test when medicine file is missing"""
    monkeypatch.setattr("os.path.exists", lambda x: False)

    response = client.post('/update-stock', json={'drug_id': 1})
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["error"] == "Medicine data file not found"

@pytest.mark.order(3)  # LOX n°5
def test_update_stock_general_error(client, monkeypatch):
    """Test unexpected errors"""
    def mock_error(*args, **kwargs):
        raise Exception("File write error")

    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_error)

    response = client.post('/update-stock', json={'drug_id': 1})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(3)  # LOX n°5
def test_update_stock_json_error(client, monkeypatch):
    """Test invalid JSON in medicine file"""
    monkeypatch.setattr("os.path.exists", lambda x: True)
    m = mock_open(read_data="{ invalid json }")
    m.return_value.__enter__ = m
    monkeypatch.setattr("builtins.open", m)

    response = client.post('/update-stock', json={'drug_id': 1})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data
