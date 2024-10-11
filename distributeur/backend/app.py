from flask import Flask
from dotenv import load_dotenv

from routes.find_doctor import find_doctor_bp
from routes.add_doctor import add_doctor_bp
from routes.remove_doctor import remove_doctor_bp

# Charger les variables d'environnement à partir du fichier .env
load_dotenv()

app = Flask(__name__)

# Enregistrer les blueprints
app.register_blueprint(find_doctor_bp)
app.register_blueprint(add_doctor_bp)
app.register_blueprint(remove_doctor_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
