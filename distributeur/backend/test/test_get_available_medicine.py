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
    """
    Objectif: Test the successful retrieval of medicine data from the /get_available_medicine endpoint.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /get_available_medicine endpoint when the medicine data file is not found.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    monkeypatch.setattr("os.path.exists", lambda x: False)

    response = client.get('/get_available_medicine')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["error"] == "Medicine data file not found"

@pytest.mark.order(1)  # LOX n°3
def test_get_available_medicine_unexpected_error(client, monkeypatch):
    """
    Objectif: Test the /get_available_medicine endpoint when an unexpected error occurs during file reading.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    def mock_error(*args, **kwargs):
        """
        Objectif: Mock function that raises an exception to simulate a disk read error during testing.

        Parameters:
            - *args: Variable length argument list. (Any)
            - **kwargs: Arbitrary keyword arguments. (Any)

        Return Value:
            - None: This function does not return and always raises an Exception. (NoneType)
        """
        raise Exception("Disk read error")

    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_error)

    response = client.get('/get_available_medicine')
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1)  # LOX n°3
def test_get_available_medicine_json_decode_error(client, monkeypatch):
    """
    Objectif: Test the /get_available_medicine endpoint when the medicine data file contains invalid JSON syntax.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    """Test invalid JSON syntax handling"""
    monkeypatch.setattr("os.path.exists", lambda x: True)
    monkeypatch.setattr("builtins.open", mock_open(read_data="{ invalid json }"))

    response = client.get('/get_available_medicine')
    assert response.status_code == 500
    data = json.loads(response.data)
    assert data["error"] == "Failed to parse medicine data file"
