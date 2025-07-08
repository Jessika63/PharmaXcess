
import time
import subprocess

from env_functions.load_env_file import load_env_file
from colored_print import colored_print

def verify_database_is_up(db_container_name, nb_of_retry=1):
    """
    Verifies that the database container is up and ready, with detailed error detection.
    :param db_container_name: The name of the database container to check.
    :param nb_of_retry: The number of retries before failing (default is 1).
    """
    waiting_time = 10  # Time in seconds between retries
    env_data = load_env_file(".env")

    # 1. Check if Docker is installed
    try:
        subprocess.run(["docker", "--version"], check=True, capture_output=True)
    except FileNotFoundError:
        colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "red")
        return
    except Exception as e:
        colored_print(f"Unexpected error when checking Docker installation: {e}", "red")
        return

    # 2. Check if the database container is running
    try:
        result = subprocess.run([
            "docker", "ps", "--filter", f"name={db_container_name}", "--filter", "status=running", "--format", "{{.Names}}"
        ], capture_output=True, text=True)
        running = result.stdout.splitlines()
        if db_container_name not in running:
            colored_print(f"Database container '{db_container_name}' is NOT running! Check logs with: docker logs {db_container_name}", "red")
            return
    except Exception as e:
        colored_print(f"Error checking database container status: {e}", "red")
        return

    colored_print(f"Waiting for database container '{db_container_name}' to be ready...", "blue")
    last_error = None
    for attempt in range(1, nb_of_retry + 1):
        try:
            result = subprocess.run([
                "docker", "exec", db_container_name, "mysqladmin", "ping", "-h", "localhost", "-uroot",
                "-p" + env_data["MYSQL_ROOT_PASSWORD"]
            ], capture_output=True, text=True)
            if "mysqld is alive" in result.stdout:
                colored_print("Database container is ready!", "green")
                return  # Exit function successfully
            else:
                last_error = result.stdout + result.stderr
                colored_print(f"Database ping failed: {result.stdout.strip()} {result.stderr.strip()}", "yellow")
        except FileNotFoundError:
            colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "red")
            return
        except subprocess.CalledProcessError as cpe:
            last_error = cpe
            colored_print(f"Database command error: {cpe}", "red")
        except Exception as e:
            last_error = e
            colored_print(f"Unexpected error while checking database container: {e}", "red")

        if attempt != nb_of_retry:
            colored_print(
                f"Attempt {attempt}/{nb_of_retry}: Database not ready. Retrying in {waiting_time} seconds...",
                "yellow"
            )
            time.sleep(waiting_time)
        else:
            break

    colored_print(f"Database container '{db_container_name}' is not ready after {nb_of_retry} attempts!", "red")
    if last_error:
        colored_print(f"Last error: {last_error}", "red")
    try:
        log_result = subprocess.run([
            "docker", "logs", "--tail", "20", db_container_name
        ], capture_output=True, text=True)
        colored_print(f"Last 20 lines of database container logs:\n{log_result.stdout}", "yellow")
    except Exception as e:
        colored_print(f"Could not retrieve database container logs: {e}", "red")
