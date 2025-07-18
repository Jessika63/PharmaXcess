from flask import Blueprint, request, jsonify
import requests
import math

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

    max_radius = 1000000  # 1000km, effectively no limit
    pharmacies = []
    current_radius = radius
    while True:
        print(f"Searching pharmacies at lat={lat}, lon={lon}, radius={current_radius}")
        try:
            # Construct the Overpass API query
            query = f"""
            [out:json];
            node[\"amenity\"=\"pharmacy\"](around:{current_radius},{lat},{lon});
            out body;
            """

            # Send request to Overpass API with a timeout of 10 seconds
            response = requests.get(OVERPASS_URL, params={"data": query}, timeout=10)
            response.raise_for_status()  # Raise an exception for HTTP errors (e.g., 404, 500)

            # Parse the response JSON
            data = response.json()

            # Extract relevant pharmacy information (name, latitude, longitude)
            pharmacies = [
                {
                    "name": node.get("tags", {}).get("name", "Unknown"),
                    "latitude": node["lat"],
                    "longitude": node["lon"]
                }
                for node in data.get("elements", [])
            ]

            # Sort by distance to (lat, lon) and keep only the 10 nearest
            def haversine(lat1, lon1, lat2, lon2):
                R = 6371  # Earth radius in km
                phi1 = math.radians(lat1)
                phi2 = math.radians(lat2)
                dphi = math.radians(lat2 - lat1)
                dlambda = math.radians(lon2 - lon1)
                a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                return R * c

            pharmacies = sorted(
                pharmacies,
                key=lambda ph: haversine(lat, lon, ph["latitude"], ph["longitude"])
            )

            # Filter out pharmacies with name 'Unknown'
            named_pharmacies = [ph for ph in pharmacies if ph['name'] != 'Unknown']
            if current_radius > max_radius:
                pharmacies = named_pharmacies  # Return as many as found
                break
            if len(named_pharmacies) >= 10:
                pharmacies = named_pharmacies[:10]
                break
            else:
                current_radius *= 2
        except requests.exceptions.Timeout:
            print("Error: The request to Overpass API timed out.")
            return jsonify({"error": "Request to Overpass API timed out. Please try again later."}), 500
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return jsonify({"error": f"Request to Overpass API failed: {str(e)}"}), 500
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500

    # Return pharmacies if any are found
    if pharmacies and len(pharmacies) > 0:
        return jsonify(
            {
                "pharmacies": pharmacies,
                "message": "Pharmacies sent successfully"
            }
        ), 200  # 200 OK response
    else:
        # If no pharmacies were found, return a 404 response
        return jsonify({"error": "No pharmacies found in the specified area"}), 404
