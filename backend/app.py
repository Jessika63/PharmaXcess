from flask import Flask, jsonify
from dotenv import load_dotenv

from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": [
            "http://192.168.10.168:3000",
            "http://localhost:3000"
            ],
        "allow_headers": ["*", "Content-Type", "Authorization", "X-AdBlock-Detected"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True
    }
})

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
