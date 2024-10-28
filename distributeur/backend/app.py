from flask import Flask
from dotenv import load_dotenv

from routes.find_doctor_by_name import find_doctor_by_name_bp
from routes.find_doctor_by_frpp import find_doctor_by_frpp_bp
from routes.add_doctor import add_doctor_bp
from routes.remove_doctor import remove_doctor_bp
from routes.take_picture import take_picture_bp
from routes.read_text import read_text_bp

from routes.testing_connection_front import testFrontPost_bp, testFrontGet_bp, testFrontDelete_bp, testFrontPut_bp

# Charger les variables d'environnement à partir du fichier .env
load_dotenv()

app = Flask(__name__)

# Enregistrer les blueprints
app.register_blueprint(find_doctor_by_name_bp)
app.register_blueprint(find_doctor_by_frpp_bp)
app.register_blueprint(add_doctor_bp)
app.register_blueprint(remove_doctor_bp)
app.register_blueprint(take_picture_bp)
app.register_blueprint(read_text_bp)

app.register_blueprint(testFrontPost_bp)
app.register_blueprint(testFrontGet_bp)
app.register_blueprint(testFrontDelete_bp)
app.register_blueprint(testFrontPut_bp)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
