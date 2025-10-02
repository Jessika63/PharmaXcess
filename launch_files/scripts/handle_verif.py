
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from helpers.env_functions.verify_env_file import verify_env_files
from helpers.verify.verify_db_dump import verify_db_dump

def handle_verif(env_configs, backend_folder, db_configs):
    """
    Objectif: Performs verification steps before starting backend operations,
    including environment file validation and database dump file presence
    check for multiple databases.

    Parameters:
        - env_configs: List of environment config dictionaries (List)
        - backend_folder: Path to the backend directory containing the database dump file. (String)
        - db_configs: List of database configuration dictionaries containing db_dump_date. (List)

    Return Value:
        - None: This function does not return a value but may terminate the
          program if verifications fail. (NoneType)
    """
    verify_env_files(env_configs)

    # Build the list of all expected dump filenames across all databases
    expected_dumps = [
        f"database_dump_px_{db_config['db_dump_date']}.sql"
        for db_config in db_configs if db_config.get("db_dump_date")
    ]

    # Verify database dumps for each expected file
    for db_config in db_configs:
        db_dump_date = db_config.get("db_dump_date")
        verify_db_dump(backend_folder, db_dump_date, expected_dumps)
