
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from helpers.env_functions.verify_env_file import verify_env_files
from helpers.verify.verify_db_dump import verify_db_dump

def handle_verif(env_configs, backend_folder, db_configs):
    """
    Objective:
    Handles the creation of database dumps either locally or on a remote server, 
    fixes their footers with correct user privileges, and updates related configuration files.

    Parameters:
    - backend_folder (str): Path to the backend directory containing the database containers and .env file.
    - db_configs (List[Dict]): List of dictionaries with database configuration (container_name, name, env_prefix, etc.).
    - back_app_container_name (str): Name of the backend application Docker container used to verify readiness.
    - target_db_name (str, optional): Name of a specific database to dump. If None, all databases are dumped. Defaults to None.
    - remote (bool, optional): If True, executes the dump on a remote server via SSH. Defaults to False.
    - remote_user (str, optional): SSH username for remote operations. Defaults to "ubuntu".
    - remote_host (str, optional): Hostname or IP of the remote server. Defaults to "57.128.57.96".
    - remote_base_path (str, optional): Base path on the remote server where the backend is located. Defaults to "/home/ubuntu/PharmaXcess".

    Return Value:
    - None: This function performs dumping operations, fixes dump files, copies remote dumps if needed,
            updates configuration files, and prints detailed status messages.
    """
    verify_env_files(env_configs)

    for db_config in db_configs:
        db_name = db_config["name"]
        db_dump_date = db_config.get("db_dump_date")
        verify_db_dump(backend_folder, db_name, db_dump_date)
