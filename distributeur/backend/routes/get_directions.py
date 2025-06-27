from flask import Blueprint, request, jsonify
import os
import requests

get_directions_bp = Blueprint('get_directions', __name__)

ORS_API_KEY = os.environ.get('OPENROUTESERVICE_API_KEY', None)
ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/'
ORS_PROFILES = {
    'car': 'driving-car',
    'driving': 'driving-car',
    'bicycle': 'cycling-regular',
    'cycling': 'cycling-regular',
    'foot': 'foot-walking',
    'walking': 'foot-walking',
    'transit': 'driving-car',  # ORS does not support public transit, fallback to car
}

@get_directions_bp.route('/get_direction', methods=['GET'])
def get_directions():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    mode = request.args.get('mode', 'car')
    if not origin or not destination:
        return jsonify({'error': 'Missing origin or destination'}), 400
    if not ORS_API_KEY:
        return jsonify({'error': 'Missing OpenRouteService API key'}), 500
    try:
        orig_lat, orig_lon = map(float, origin.split(','))
        dest_lat, dest_lon = map(float, destination.split(','))
    except Exception:
        return jsonify({'error': 'Invalid coordinates'}), 400
    profile = ORS_PROFILES.get(mode, 'driving-car')
    url = ORS_BASE_URL + profile
    headers = {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
    }
    body = {
        'coordinates': [[orig_lon, orig_lat], [dest_lon, dest_lat]]
    }
    try:
        resp = requests.post(url, headers=headers, json=body, timeout=10)
        data = resp.json()
        if resp.status_code != 200:
            return jsonify({'error': data.get('error', 'ORS error'), 'error_message': data.get('message', '')}), resp.status_code
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 