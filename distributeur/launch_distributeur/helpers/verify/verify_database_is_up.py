
import time
import subprocess

from env_functions.load_env_file import load_env_file
from colored_print import colored_print

def verify_database_is_up(db_container_name, nb_of_retry=1):
    """
    Verifies that the database container is up and ready.

    :param db_container_name: The name of the database container to check.
    :param nb_of_retry: The number of retries before failing (default is 1).
    """
    waiting_time = 10  # Time in seconds between retries

    env_data = load_env_file(".env")

    colored_print(f"Waiting for database container '{db_container_name}' to be ready...", "blue")

    for attempt in range(1, nb_of_retry + 1):
        try:
            result = subprocess.run(
                [
                    "docker", "exec", db_container_name, "mysqladmin", "ping", "-h", "localhost", "-uroot",
                    "-p" + env_data["MYSQL_ROOT_PASSWORD"]
                ],
                capture_output=True,
                text=True,
            )
            if "mysqld is alive" in result.stdout:
                colored_print("Database container is ready!", "green")
                return  # Exit function successfully
        except FileNotFoundError:
            colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "red")
        except subprocess.CalledProcessError:
            pass
        except Exception as e:
            colored_print(f"Unexpected error while checking database container: {e}", "red")

        if attempt != nb_of_retry:
            colored_print(
                f"Attempt {attempt}/{nb_of_retry}: Database not ready. Retrying in {waiting_time} seconds...",
                "yellow"
            )
            time.sleep(waiting_time)
        else:
            break

    if nb_of_retry == 1:
        colored_print(
            f"Database container '{db_container_name}' is not up!",
            "red"
        )
    else:
        colored_print(
            f"Database container '{db_container_name}' is not ready after {nb_of_retry} attempts!",
            "red"
        )
