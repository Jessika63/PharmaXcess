import pytest
import json
from unittest.mock import mock_open, patch

# Mock data for testing
MOCK_MEDICINE_DATA = {
    "medicine": [
        {"id": 1, "label": "Aspirin", "price": 5.99, "size": 100},
        {"id": 2, "label": "Ibuprofen", "price": 7.50, "size": 50}
    ]
}

@pytest.mark.order(1)  # LOX n°3
def test_get_available_medicine_success(client, monkeypatch):
    """Test successful retrieval of medicine data"""
    # Mock file operations
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data=json.dumps(MOCK_MEDICINE_DATA)))

    response = client.get('/get_available_medicine')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "message" in data
    assert "medicine" in data
    assert len(data["medicine"]) == 2
    assert data["medicine"][0]["label"] == "Aspirin"

@pytest.mark.order(1)  # LOX n°3
def test_get_available_medicine_file_not_found(client, monkeypatch):
    """Test when medicine file is missing"""
    monkeypatch.setattr("os.path.exists", lambda x: False)

    response = client.get('/get_available_medicine')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["error"] == "Medicine data file not found"

@pytest.mark.order(1)  # LOX n°3
def test_get_available_medicine_unexpected_error(client, monkeypatch):
    """Test unexpected file read error"""
    def mock_error(*args, **kwargs):
        raise Exception("Disk read error")

    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_error)

    response = client.get('/get_available_medicine')
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1)  # LOX n°3
def test_get_available_medicine_json_decode_error(client, monkeypatch):
    """Test invalid JSON syntax handling"""
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data="{ invalid json }"))

    response = client.get('/get_available_medicine')
    assert response.status_code == 500
    data = json.loads(response.data)
    assert data["error"] == "Failed to parse medicine data file"
