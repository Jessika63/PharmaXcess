# routes/auth/logout.py
from flask import Blueprint, session, jsonify

logout_bp = Blueprint('logout', __name__)

@logout_bp.route('/logout', methods=['POST'])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"}), 200
