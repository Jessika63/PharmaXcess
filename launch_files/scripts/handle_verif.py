
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from helpers.env_functions.verify_env_file import verify_env_file
from helpers.verify.verify_db_dump import verify_db_dump

def handle_verif(env_file_path, required_env_keys, backend_folder, db_dump_date):
    """
    Objectif: Performs verification steps before starting backend operations, including environment file validation and database dump file presence check.

    Parameters:
        - env_file_path: Path to the environment file (.env) to verify. (String)
        - required_env_keys: List of required environment variable keys that must be present. (List of Strings)
        - backend_folder: Path to the backend directory containing the database dump file. (String)
        - db_dump_date: Expected date of the database dump file in 'DD_MM_YYYY' format. (String)

    Return Value:
        - None: This function does not return a value but may terminate the program if verifications fail. (NoneType)
    """
    verify_env_file(env_file_path, required_env_keys)
    verify_db_dump(backend_folder, db_dump_date)
