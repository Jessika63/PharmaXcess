
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
import json
from functools import wraps

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback_dev_key")

# Configuration pour CORS dynamique
# Stockage dans /data à l'intérieur du conteneur (volume Docker)
ALLOWED_ORIGINS_FILE = '/data/allowed_origins.json'
CORS_SECRET_KEY = os.getenv('CORS_SECRET_KEY')

# Charger les origines autorisées depuis le fichier
def load_allowed_origins():
    """Charge les origines autorisées depuis le fichier JSON"""
    try:
        if os.path.exists(ALLOWED_ORIGINS_FILE):
            with open(ALLOWED_ORIGINS_FILE, 'r') as f:
                return set(json.load(f))
    except (json.JSONDecodeError, IOError):
        pass
    return set()

def save_allowed_origins(origins):
    """Sauvegarde les origines autorisées dans le fichier JSON"""
    try:
        # Créer le répertoire /data s'il n'existe pas
        os.makedirs(os.path.dirname(ALLOWED_ORIGINS_FILE), exist_ok=True)
        with open(ALLOWED_ORIGINS_FILE, 'w') as f:
            json.dump(list(origins), f)
    except IOError as e:
        app.logger.error(f"Erreur lors de la sauvegarde des origines: {e}")

# Charger les origines autorisées au démarrage
allowed_origins = load_allowed_origins()

# Decorator pour vérifier la clé secrète
def require_secret_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        received_key = request.headers.get('X-Secret-Key')

        if received_key != CORS_SECRET_KEY:
            return jsonify({"error": "Unauthorized - Invalid secret key"}), 401
        return f(*args, **kwargs)
    return decorated

# Middleware CORS dynamique
@app.before_request
def check_origin():
    """Vérifie si l'origine est autorisée avant chaque requête"""
    # Toujours permettre les requêtes OPTIONS (preflight CORS)
    if request.method == 'OPTIONS':
        return

    # Permettre l'enregistrement d'origine même si pas encore autorisée
    if request.endpoint == 'register_origin':
        return

    # Vérifier les autres requêtes
    origin = request.headers.get('Origin')
    if origin and origin not in allowed_origins:
        return jsonify({"error": "Origin not allowed"}), 403

@app.after_request
def after_request(response):
    """Ajoute les headers CORS appropriés après chaque requête"""
    origin = request.headers.get('Origin')

    # Pour les requêtes OPTIONS (preflight), toujours ajouter les headers CORS
    if request.method == 'OPTIONS':
        response.headers.add('Access-Control-Allow-Origin', origin or '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Secret-Key,X-AdBlock-Detected,Origin')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '86400')  # Cache preflight pour 24h
    # Pour les autres requêtes, vérifier si l'origine est autorisée
    elif origin and (origin in allowed_origins or request.endpoint == 'register_origin'):
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Secret-Key,X-AdBlock-Detected')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')

    return response

# Endpoint pour enregistrer une nouvelle origine
@app.route('/register-origin', methods=['POST'])
@require_secret_key
def register_origin():
    """
    Endpoint pour enregistrer une nouvelle origine autorisée.
    Nécessite une clé secrète dans les headers.
    """
    origin = request.headers.get('Origin')
    if not origin:
        return jsonify({"error": "Origin header required"}), 400

    # Ajouter l'origine à la liste autorisée
    allowed_origins.add(origin)
    save_allowed_origins(allowed_origins)

    app.logger.info(f"New origin registered: {origin}")
    return jsonify({
        "message": "Origin registered successfully",
        "origin": origin,
        "total_origins": len(allowed_origins)
    }), 200

# Endpoint pour lister les origines autorisées (pour debug)
@app.route('/list-origins', methods=['GET'])
@require_secret_key
def list_origins():
    """Liste toutes les origines autorisées"""
    return jsonify({
        "allowed_origins": list(allowed_origins),
        "count": len(allowed_origins)
    }), 200

# Endpoint pour supprimer une origine (pour debug)
@app.route('/remove-origin', methods=['POST'])
@require_secret_key
def remove_origin():
    """Supprime une origine de la liste autorisée"""
    data = request.get_json()
    if not data or 'origin' not in data:
        return jsonify({"error": "Origin required in request body"}), 400

    origin = data['origin']
    if origin in allowed_origins:
        allowed_origins.remove(origin)
        save_allowed_origins(allowed_origins)
        app.logger.info(f"Origin removed: {origin}")
        return jsonify({
            "message": "Origin removed successfully",
            "origin": origin
        }), 200
    else:
        return jsonify({"error": "Origin not found"}), 404

def register_blueprints():
    """
    Objective: Register all blueprints (API endpoints) of the Flask application.

    Parameters:
    - None

    Return Value:
    - None (blueprints are registered directly in the Flask instance)
    """
    from routes.find.find_doctor_by_name import find_doctor_by_name_bp
    from routes.find.find_doctor_by_rpps import find_doctor_by_rpps_bp
    from routes.add.add_doctor import add_doctor_bp
    from routes.add.add_list_doctors import add_list_doctors_bp
    from routes.remove_doctor import remove_doctor_bp
    from routes.read_text import extract_text_bp
    from routes.get_pharmacies import get_pharmacies_bp
    from routes.get_available_medicine import get_available_medicine_bp
    from routes.get_directions import get_directions_bp
    from routes.stripe.pay_with_stripe import create_payment_intent_bp
    from routes.stripe.vpn_check import vpn_check_bp
    from routes.stripe.update_stock import update_stock_bp
    from routes.qr_code.generate_qr_code import generate_qr_bp
    from routes.qr_code.read_qr_code import read_qr_bp
    from routes.qr_code.delete_qr_code import delete_qr_bp
    from routes.qr_code.read_code_qr_code import read_code_qr_bp
    from routes.authentication.login import login_bp
    from routes.authentication.logout import logout_bp
    from routes.authentication.register import register_bp
    from routes.profile.sub_profiles import sub_profile_bp
    from routes.authentication.forgot_password import forgot_password_bp
    from routes.authentication.reset_password import reset_password_bp
    from routes.notifications.alarms_routes import alarms_bp
    from routes.notifications.prescription_reminders_routes import prescription_reminders_bp
    from routes.tickets.discussions.create_discussion import create_discussion_bp
    from routes.tickets.discussions.get_all_discussions import get_all_discussions_bp
    from routes.tickets.discussions.get_user_discussions import get_user_discussions_bp
    from routes.tickets.discussions.get_professional_discussions import get_professional_discussions_bp
    from routes.tickets.discussions.get_discussion import get_discussion_bp
    from routes.tickets.discussions.update_discussion import update_discussion_bp
    from routes.tickets.discussions.reopen_discussion import reopen_discussion_bp
    from routes.tickets.discussions.delete_discussion import delete_discussion_bp
    from routes.tickets.discussions.get_open_discussions import get_open_discussions_bp
    from routes.tickets.messages.add_message import add_message_bp
    from routes.tickets.messages.get_messages import get_messages_bp
    from routes.tickets.messages.delete_message import delete_message_bp
    from routes.profile.diseases import diseases_bp
    from routes.profile.infos import infos_bp
    from routes.profile.treatments import traitements_bp
    from routes.profile.hospitalizations import hospitalizations_bp
    from routes.profile.allergies import allergies_bp
    from routes.profile.family_history import family_history_bp
    from routes.profile.doctors import doctors_bp
    from routes.clickAndCollect.click_collect_request import clickcollect_request_bp
    from routes.clickAndCollect.click_collect_send import clickcollect_send_bp

    from routes.clickAndCollect.click_collect_command import clickcollect_command_bp
    from routes.clickAndCollect.click_collect_validate import clickcollect_validate_bp
    from routes.clickAndCollect.click_collect_refuse import clickcollect_refuse_bp
    from routes.clickAndCollect.click_collect_status import clickcollect_status_bp
    from routes.clickAndCollect.click_collect_temp_images import clickcollect_temp_images_bp
    from routes.profile.sub_profiles import sub_profile_bp

    from routes.ordonnances.ordonnance_create import ordonnances_bp

    app.register_blueprint(ordonnances_bp)

    # Save blueprints
    app.register_blueprint(find_doctor_by_name_bp)
    app.register_blueprint(find_doctor_by_rpps_bp)
    app.register_blueprint(add_doctor_bp)
    app.register_blueprint(add_list_doctors_bp)
    app.register_blueprint(remove_doctor_bp)
    app.register_blueprint(extract_text_bp)
    app.register_blueprint(get_pharmacies_bp)
    app.register_blueprint(get_available_medicine_bp)
    app.register_blueprint(get_directions_bp)
    app.register_blueprint(create_payment_intent_bp)
    app.register_blueprint(vpn_check_bp)
    app.register_blueprint(update_stock_bp)
    app.register_blueprint(generate_qr_bp)
    app.register_blueprint(read_qr_bp)
    app.register_blueprint(create_discussion_bp)
    app.register_blueprint(get_all_discussions_bp)
    app.register_blueprint(get_user_discussions_bp)
    app.register_blueprint(get_professional_discussions_bp)
    app.register_blueprint(get_discussion_bp)
    app.register_blueprint(update_discussion_bp)
    app.register_blueprint(reopen_discussion_bp)
    app.register_blueprint(delete_discussion_bp)
    app.register_blueprint(get_open_discussions_bp)
    app.register_blueprint(add_message_bp)
    app.register_blueprint(get_messages_bp)
    app.register_blueprint(delete_message_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(sub_profile_bp)
    app.register_blueprint(logout_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(forgot_password_bp)
    app.register_blueprint(reset_password_bp)
    app.register_blueprint(delete_qr_bp)
    app.register_blueprint(read_code_qr_bp)
    app.register_blueprint(alarms_bp)
    app.register_blueprint(prescription_reminders_bp)
    app.register_blueprint(diseases_bp)
    app.register_blueprint(infos_bp)
    app.register_blueprint(traitements_bp)
    app.register_blueprint(hospitalizations_bp)
    app.register_blueprint(allergies_bp)
    app.register_blueprint(family_history_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(clickcollect_send_bp)
    app.register_blueprint(clickcollect_request_bp)
    app.register_blueprint(clickcollect_command_bp)
    app.register_blueprint(clickcollect_validate_bp)
    app.register_blueprint(clickcollect_refuse_bp)
    app.register_blueprint(clickcollect_status_bp)
    app.register_blueprint(clickcollect_temp_images_bp)

register_blueprints()

@app.route('/')
def home():
    """
    Objectif: Provide a health check status confirming the backend service is operational.

    Parameters:
        - None

    Query parameters:
        - None

    Return Value:
        - message: Confirmation that the backend is running. (String)
        - HTTP Status: 200 OK (Integer)
    """
    return jsonify({"message": "Backend is up and running!"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
