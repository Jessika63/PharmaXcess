
from flask import session, jsonify

def get_current_user_id():
    """Récupère le user_id courant depuis la session Flask."""
    user_id = session.get("user_id")
    if not user_id:
        return None, jsonify({"error": "No active session"}), 401
    return user_id, None, None


def profile_access_condition():
    """
    Retourne une condition SQL et les paramètres associés pour
    autoriser l'accès à un profil principal ou à ses sous-profils.
    """
    return """
        (utilisateur_id = %s
         OR utilisateur_id IN (
             SELECT sub_profile_id FROM profile_relations
             WHERE main_profile_id = %s
         ))
    """
