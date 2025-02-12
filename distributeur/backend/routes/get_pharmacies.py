
from flask import Blueprint, request, jsonify
import requests

# Define a Flask Blueprint to handle pharmacy search requests
get_pharmacies_bp = Blueprint('get_pharmacies', __name__)

# URL of the Overpass API (used to query OpenStreetMap data)
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

@get_pharmacies_bp.route('/get_pharmacies', methods=['GET'])
def get_pharmacies():
    """
    Searches for pharmacies near a given latitude and longitude.

    Query parameters:
        - lat: Latitude of the search location (required).
        - lon: Longitude of the search location (required).
        - radius: Search radius in meters (optional, default: 1000m).

    Return Value:
        - 200 OK with a list of nearby pharmacies and a success message.
        - 400 Bad Request, if lat or lon is missing.
        - 404 Not Found, if no pharmacies are found.
        - 500 Internal Server Error, if Overpass API or other error.
    """

    # Retrieve query parameters from the request URL
    lat = request.args.get("lat", type=float)  # Get latitude (must be a float)
    lon = request.args.get("lon", type=float)  # Get longitude (must be a float)
    radius = request.args.get("radius", default=1000, type=int)  # Get search radius (default: 1000m)

    # Validate that latitude and longitude are provided
    if lat is None or lon is None:
        return jsonify({"error": "Both 'lat' and 'lon' are required"}), 400  # Return 400 Bad Request if missing

    try:
        # Construct the Overpass API query
        query = f"""
        [out:json];
        node["amenity"="pharmacy"](around:{radius},{lat},{lon});
        out body;
        """

        # Send request to Overpass API
        response = requests.get(OVERPASS_URL, params={"data": query})
        response.raise_for_status()  # Raise an exception for HTTP errors (e.g., 404, 500)

        # Parse the response JSON
        data = response.json()

        # Extract relevant pharmacy information (name, latitude, longitude)
        pharmacies = [
            {
                "name": node.get("tags", {}).get("name", "Unknown"),  # Use "Unknown" if no name is provided
                "latitude": node["lat"],
                "longitude": node["lon"]
            }
            for node in data.get("elements", [])  # Iterate through the 'elements' list in the API response
        ]

        # Return pharmacies if any are found
        if pharmacies:
            return jsonify(
                {
                    "pharmacies": pharmacies,
                    "message": "Pharmacies sent successfully"
                }
            ), 200  # 200 OK response

        # If no pharmacies were found, return a 404 response
        return jsonify({"error": "No pharmacies found in the specified area"}), 404

    except requests.exceptions.RequestException as e:
        # Handle network-related errors (e.g., timeout, connection error)
        print(f"Error: {e}")  # Log the error
        return jsonify({"error": f"Request to Overpass API failed: {str(e)}"}), 500  # Return 500 Internal Server Error

    except Exception as e:
        # Handle any other unexpected errors
        print(f"Error: {e}")  # Log the error
        return jsonify({"error": str(e)}), 500  # Return 500 Internal Server Error
