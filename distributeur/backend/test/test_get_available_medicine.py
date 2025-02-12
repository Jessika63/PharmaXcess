
import pytest
import os
import json
import shutil

@pytest.mark.order(1) # LOX n°3
def test_get_available_medicine_success(client):
    """
    Test when the JSON file exists and is read correctly.
    It checks if the response returns a 200 status code,
    contains a message, and has a list of available medicines.
    """
    response = client.get('/get_available_medicine')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "message" in data
    assert "medicine" in data
    assert isinstance(data["medicine"], list)

@pytest.mark.order(1) # LOX n°3
def test_get_available_medicine_file_not_found(client):
    """
    Test when the JSON file is missing by temporarily removing it.
    It ensures the file exists before the test, removes it,
    checks for a 404 error response, then restores the file.
    """
    json_path = os.path.join(os.path.dirname(__file__), "../medicine_available.json")
    temp_json_path = os.path.join(os.path.dirname(__file__), "../medicine_available_temp.json")

    # Ensure the file exists before proceeding
    assert os.path.exists(json_path), "medicine_available.json should exist before the test"

    # Create a backup and remove the original JSON file
    shutil.copy(json_path, temp_json_path)
    os.remove(json_path)

    try:
        response = client.get('/get_available_medicine')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert "error" in data
        assert data["error"] == "Medicine data file not found"
    finally:
        # Restore the original file to maintain test integrity
        shutil.move(temp_json_path, json_path)

@pytest.mark.order(1) # LOX n°3
def test_get_available_medicine_unexpected_error(client, monkeypatch):
    """
    Test when an unexpected error occurs while trying to read the JSON file.
    This is simulated by monkey-patching the built-in open function to raise an exception.
    It ensures the response returns a 500 status code and an appropriate error message.
    """
    def mock_open(*args, **kwargs):
        raise Exception("Unexpected error")

    # Mock the open function to raise an exception
    monkeypatch.setattr("builtins.open", mock_open)

    response = client.get('/get_available_medicine')
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data
    assert data["error"] == "Unexpected error"

@pytest.mark.order(1) # LOX n°3
def test_get_available_medicine_json_decode_error(client):
    """
    Test when the JSON file contains invalid JSON syntax.
    It temporarily writes an invalid JSON string to the file,
    verifies that a 500 error response is returned, then restores the original file.
    """
    json_path = os.path.join(os.path.dirname(__file__), "../medicine_available.json")
    temp_json_path = os.path.join(os.path.dirname(__file__), "../medicine_available_temp.json")

    # Ensure the file exists before proceeding
    assert os.path.exists(json_path), "medicine_available.json should exist before the test"
    shutil.copy(json_path, temp_json_path)

    try:
        # Write invalid JSON content to the file
        with open(json_path, "w", encoding="utf-8") as f:
            f.write("{ invalid json }")

        response = client.get('/get_available_medicine')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data
        assert data["error"] == "Failed to parse medicine data file"

    finally:
        # Restore the original JSON file after the test
        shutil.move(temp_json_path, json_path)
