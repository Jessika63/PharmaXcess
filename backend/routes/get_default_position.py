from flask import Blueprint, jsonify, request
import os

get_default_position_bp = Blueprint('get_default_position', __name__)

# Default positions hardcoded
EPITECH_PARIS = {
    "lat": 48.815273,
    "lon": 2.363006,
    "name": "Epitech Kremlin-Bicêtre"
}

EPITECH_LYON = {
    "lat": 45.746288,
    "lon": 4.835127,
    "name": "Epitech Lyon"
}

# You can also add other default locations
DEFAULT_LOCATIONS = {
    "paris": EPITECH_PARIS,
    "lyon": EPITECH_LYON,
    "default": EPITECH_PARIS  # Default fallback
}

# Get default location from environment variable (set by launch script)
def get_configured_default_location():
    """Get the default location configured via environment variable"""
    env_location = os.getenv('DEFAULT_LOCATION', 'paris').lower()
    return DEFAULT_LOCATIONS.get(env_location, DEFAULT_LOCATIONS['default'])


@get_default_position_bp.route('/get_default_position', methods=['GET'])
def get_default_position():
    """
    Returns a default position for the map when the client doesn't have geolocation.
    
    Query parameters:
    - location: Optional parameter to specify which default location to use (paris, lyon)
                If not provided, uses the location configured via DEFAULT_LOCATION environment variable
    
    Return Value:
    - Success: Returns a JSON object with lat, lon, and name of the location, HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 500 in case of errors. (Response)
    """
    try:
        # Get the location parameter from query string
        # If not provided, use the environment-configured default
        location_key = request.args.get('location', '').lower()
        
        if location_key:
            # Use the specified location
            position = DEFAULT_LOCATIONS.get(location_key, get_configured_default_location())
        else:
            # Use the environment-configured default location
            position = get_configured_default_location()
        
        return jsonify({
            "success": True,
            "position": position,
            "message": f"Default position returned: {position['name']}"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to get default position"
        }), 500
