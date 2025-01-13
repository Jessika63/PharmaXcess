
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from helpers.env_functions.verify_env_file import verify_env_file
from helpers.verify.verify_db_dump import verify_db_dump

def handle_verif(env_file_path, required_env_keys, backend_folder, db_dump_date):
    """
    Handles verification steps before starting backend operations:
    1. Ensures the environment file exists and contains the required keys.
    2. Verifies the presence of the database dump file in the specified backend folder.

    Parameters:
    - env_file_path (str): Path to the environment file (.env).
    - required_env_keys (list): List of required keys that should be present in the environment file.
    - backend_folder (str): Path to the backend folder where the database dump file is located.
    - db_dump_date (str): Date string used to construct the database dump file name.
    """
    verify_env_file(env_file_path, required_env_keys)
    verify_db_dump(backend_folder, db_dump_date)
