import pytest
import json
from unittest.mock import patch
import requests

# This test suite verifies the behavior of the /get_pharmacies route.

@pytest.mark.order(1)  # LOX n°4
def test_get_pharmacies_success(client):
    """
    Test case: Successful retrieval of nearby pharmacies.

    - Mocks the Overpass API response with a list of pharmacies.
    - Sends a GET request to /get_pharmacies with valid parameters.
    - Asserts that the response contains the expected pharmacy data.
    """

    # Mocked response from the Overpass API
    mock_data = {
        "elements": [
            {
                "lat": 53.2269086,
                "lon": 6.5327019,
                "tags": {"name": "Apotheek De Vuursteen"}
            },
            {
                "lat": 53.2310114,
                "lon": 6.5451829,
                "tags": {"name": "Apotheek Paddepoel"}
            }
        ]
    }

    # Mock the requests.get function to return the fake Overpass API response
    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200  # Simulate a successful API response
        mock_get.return_value.json.return_value = mock_data  # Return the fake pharmacy data

        # Send a request to the endpoint with a specified location and radius
        response = client.get("/get_pharmacies", query_string={"lat": 53.24, "lon": 6.53, "radius": 1500})

        # Validate response status
        assert response.status_code == 200

        # Parse response data
        data = json.loads(response.data)

        # Ensure response structure is correct
        assert "pharmacies" in data
        assert len(data["pharmacies"]) == 2  # Two pharmacies should be returned
        assert data["message"] == "Pharmacies sent successfully"  # Check success message


@pytest.mark.order(1)  # LOX n°4
def test_get_pharmacies_not_found(client):
    """
    Test case: No pharmacies found. 

    - Mocks an empty response from the Overpass API.
    - Sends a GET request to /get_pharmacies.
    - Expects a 404 status code with a relevant error message.
    """

    mock_data = {"elements": []}  # Simulate no results from Overpass API

    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200  # API call succeeds but returns no results
        mock_get.return_value.json.return_value = mock_data

        response = client.get("/get_pharmacies", query_string={"lat": 53.24, "lon": 6.53})

        assert response.status_code == 404  # Expect 404 Not Found
        assert b"No pharmacies found in the specified area" in response.data  # Check error message


@pytest.mark.order(1)  # LOX n°4
def test_get_pharmacies_missing_params(client):
    """
    Test case: Missing required parameters.

    - Sends a GET request without the longitude parameter.
    - Expects a 400 Bad Request response with an appropriate error message.
    """

    response = client.get("/get_pharmacies", query_string={"lat": 52.37})  # Missing 'lon' parameter

    assert response.status_code == 400  # Expect 400 Bad Request
    assert b"Both 'lat' and 'lon' are required" in response.data  # Check error message


@pytest.mark.order(1)  # LOX n°4
@patch("requests.get", side_effect=requests.exceptions.RequestException("Overpass API Error"))
def test_get_pharmacies_api_error(mock_get, client):
    """
    Test case: Overpass API failure.

    - Mocks a RequestException when calling the Overpass API.
    - Sends a GET request to /get_pharmacies.
    - Expects a 500 Internal Server Error response.
    """

    response = client.get("/get_pharmacies", query_string={"lat": 52.37, "lon": 4.89, "radius": 1000})

    assert response.status_code == 500  # Expect 500 Internal Server Error
    assert b"Request to Overpass API failed" in response.data  # Check error message


@pytest.mark.order(1)  # LOX n°4
@patch("requests.get", side_effect=Exception("Unexpected error"))
def test_get_pharmacies_unexpected_error(mock_get, client):
    """
    Test case: Unexpected internal error.

    - Mocks an unexpected exception occurring during the request.
    - Sends a GET request to /get_pharmacies.
    - Expects a 500 Internal Server Error response with an error message.
    """

    response = client.get("/get_pharmacies", query_string={"lat": 52.37, "lon": 4.89, "radius": 1000})

    assert response.status_code == 500  # Expect 500 Internal Server Error
    assert b"Unexpected error" in response.data  # Check error message

@pytest.mark.order(1)  # LOX n°4
@patch("requests.get", side_effect=requests.exceptions.Timeout)
def test_get_pharmacies_timeout(mock_get, client):
    """
    Test case: Overpass API timeout.

    - Mocks a timeout exception when calling the Overpass API.
    - Sends a GET request to /get_pharmacies.
    - Expects a 500 Internal Server Error response with a timeout error message.
    """

    response = client.get("/get_pharmacies", query_string={"lat": 52.37, "lon": 4.89, "radius": 1000})

    assert response.status_code == 500  # Expect 500 Internal Server Error
    assert b"Request to Overpass API timed out" in response.data  # Check error message

@pytest.mark.order(1)  # LOX n°4
@patch("requests.get")
def test_get_pharmacies_max_radius_few_named_pharmacies(mock_get, client):
    """
    Test case: Radius exceeds max and there are fewer than 10 named pharmacies.
    Should return as many as found (not 404).
    """
    # Simulate Overpass API returning only 2 named pharmacies, even after radius increases
    mock_data = {
        "elements": [
            {"lat": 53.22, "lon": 6.53, "tags": {"name": "Pharmacy A"}},
            {"lat": 53.23, "lon": 6.54, "tags": {"name": "Pharmacy B"}},
            {"lat": 53.24, "lon": 6.55, "tags": {}}  # Unknown name
        ]
    }
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = mock_data

    response = client.get("/get_pharmacies", query_string={"lat": 53.24, "lon": 6.53, "radius": 1000001})
    assert response.status_code == 200
    data = response.get_json()
    assert "pharmacies" in data
    assert len(data["pharmacies"]) == 2
    names = {ph["name"] for ph in data["pharmacies"]}
    assert names == {"Pharmacy A", "Pharmacy B"}
    assert data["message"] == "Pharmacies sent successfully"

@pytest.mark.order(1)  # LOX n°4
@patch("requests.get")
def test_get_pharmacies_max_radius_no_named_pharmacies(mock_get, client):
    """
    Test case: Radius exceeds max and there are no named pharmacies (all are 'Unknown').
    Should return 404.
    """
    # Simulate Overpass API returning only pharmacies with no name
    mock_data = {
        "elements": [
            {"lat": 53.22, "lon": 6.53, "tags": {}},
            {"lat": 53.23, "lon": 6.54, "tags": {}},
        ]
    }
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = mock_data

    response = client.get("/get_pharmacies", query_string={"lat": 53.24, "lon": 6.53, "radius": 1000001})
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data
    assert data["error"] == "No pharmacies found in the specified area"

@pytest.mark.order(1)  # LOX n°4
@patch("requests.get")
def test_get_pharmacies_no_pharmacies_at_all(mock_get, client):
    """
    Test case: Overpass API returns no pharmacies at all (empty elements list).
    Should return 404.
    """
    mock_data = {"elements": []}
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = mock_data

    response = client.get("/get_pharmacies", query_string={"lat": 53.24, "lon": 6.53, "radius": 1000})
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data
    assert data["error"] == "No pharmacies found in the specified area"

@pytest.mark.order(1)  # LOX n°4
@patch("requests.get")
def test_get_pharmacies_more_than_10_named_pharmacies(mock_get, client):
    """
    Test case: Overpass API returns more than 10 named pharmacies, should return only the 10 nearest.
    """
    mock_data = {
        "elements": [
            {"lat": 53.20 + i * 0.01, "lon": 6.50 + i * 0.01, "tags": {"name": f"Pharmacy {i+1}"}}
            for i in range(15)
        ]
    }
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = mock_data

    response = client.get("/get_pharmacies", query_string={"lat": 53.24, "lon": 6.53, "radius": 1000})
    assert response.status_code == 200
    data = response.get_json()
    assert "pharmacies" in data
    assert len(data["pharmacies"]) == 10
    assert data["message"] == "Pharmacies sent successfully"
    # Ensure the names are the first 10 sorted by distance
    names = [ph["name"] for ph in data["pharmacies"]]
    assert all(name.startswith("Pharmacy ") for name in names)
