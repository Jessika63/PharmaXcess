
from flask import session, jsonify

def get_current_user_id():
    """Récupère le user_id courant depuis la session Flask."""
    user_id = session.get("user_id")
    if not user_id:
        return None, jsonify({"error": "No active session"}), 401
    return user_id, None, None


def profile_access_condition(column: str = 'id'):
    """
    Retourne une condition SQL (string) qui compare la colonne donnée
    au profil courant et à ses sous-profils.

    column: column name or aliased column (for example 'utilisateur_id',
            'o.utilisateur_id' or 'pr.utilisateur_id').
    The returned SQL still expects two parameters when executed: (current_user_id, current_user_id)
    """
    return f"""
        ({column} = %s
         OR {column} IN (
             SELECT sub_profile_id FROM profile_relations
             WHERE main_profile_id = %s
         ))
    """

def profile_switch_condition(column: str = 'id'):
    """
    Condition SQL pour permettre à un profil principal
    et à ses sous-profils de s'accéder mutuellement.

    column: column name or aliased column to compare. The returned SQL
    expects three parameters when executed: (current_user_id, current_user_id, current_user_id)
    """
    return f"""
        ({column} = %s
         OR {column} IN (
             SELECT sub_profile_id FROM profile_relations
             WHERE main_profile_id = %s
         )
         OR {column} IN (
             SELECT main_profile_id FROM profile_relations
             WHERE sub_profile_id = %s
         ))
    """


def profile_target_access_condition(column: str = 'id'):
    """
    SQL condition to verify a specific target id is accessible by the current user.

    This returns a condition that expects three parameters when executed:
      (target_id, current_user_id, current_user_id)

    It evaluates to true when the target equals the current user or is a sub-profile
    of the current user.
    Example usage:
      condition = profile_target_access_condition('id')
      cursor.execute(f"SELECT id FROM utilisateurs WHERE {condition}", (target_id, current_user_id, current_user_id))
    """
    return f"""
        ({column} = %s
         AND ({column} = %s
              OR {column} IN (
                  SELECT sub_profile_id FROM profile_relations
                  WHERE main_profile_id = %s
              )
         )
        )
    """


def is_target_accessible(cursor, target_id, column: str = 'id') -> bool:
    """
    Helper that checks (using the provided DB cursor) whether a given target id
    (for example a utilisateur id) is accessible by the current session user.

    Parameters:
    - cursor: a DB cursor with which to execute the check
    - target_id: the id to check (int)
    - column: the column name to compare (defaults to 'id')

    Returns True if accessible, False otherwise. It assumes the caller has an
    active session (get_current_user_id() returns a user id) — if not, this
    returns False.
    """
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return False

    condition = profile_target_access_condition(column)
    cursor.execute(f"SELECT {column} FROM utilisateurs WHERE {condition}",
                   (target_id, current_user_id, current_user_id))
    return cursor.fetchone() is not None
