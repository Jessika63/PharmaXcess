from flask import Flask, jsonify
from dotenv import load_dotenv

from flask_cors import CORS

from routes.find.find_doctor_by_name import find_doctor_by_name_bp
from routes.find.find_doctor_by_rpps import find_doctor_by_rpps_bp
from routes.add.add_doctor import add_doctor_bp
from routes.add.add_list_doctors import add_list_doctors_bp
from routes.remove_doctor import remove_doctor_bp
from routes.take_picture import take_picture_bp
from routes.read_text import read_text_bp
from routes.get_pharmacies import get_pharmacies_bp
from routes.get_available_medicine import get_available_medicine_bp
from routes.get_directions import get_directions_bp
from routes.stripe.pay_with_stripe import create_payment_intent_bp
from routes.stripe.vpn_check import vpn_check_bp
from routes.stripe.update_stock import update_stock_bp

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configuration CORS unique et centralisée
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "allow_headers": ["Content-Type", "Authorization", "X-AdBlock-Detected"],  # Ajoutez "X-AdBlock-Detected" ici
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True
    }
})

# Save blueprints
app.register_blueprint(find_doctor_by_name_bp)
app.register_blueprint(find_doctor_by_rpps_bp)
app.register_blueprint(add_doctor_bp)
app.register_blueprint(add_list_doctors_bp)
app.register_blueprint(remove_doctor_bp)
app.register_blueprint(take_picture_bp)
app.register_blueprint(read_text_bp)
app.register_blueprint(get_pharmacies_bp)
app.register_blueprint(get_available_medicine_bp)
app.register_blueprint(get_directions_bp)
app.register_blueprint(create_payment_intent_bp)
app.register_blueprint(vpn_check_bp)
app.register_blueprint(update_stock_bp)

@app.route('/')
def home():
    return jsonify({"message": "Backend is up and running!"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
