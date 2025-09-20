
import time
import subprocess

from env_functions.load_env_file import load_env_file
from colored_print import colored_print

def verify_database_is_up(db_container_name, nb_of_retry=1):
    """
    Objectif: Verifies that the MySQL database container is up and responsive by executing a ping command within the container.

    Parameters:
        - db_container_name: The name of the Docker container running the MySQL database. (String)
        - nb_of_retry: Number of retry attempts before failing. Defaults to 1. (Integer)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program if the database fails to start. (NoneType)
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

        if attempt == nb_of_retry:
            break

        colored_print(
            f"Attempt {attempt}/{nb_of_retry}: Database not ready. Retrying in {waiting_time} seconds...",
            "yellow"
        )
        time.sleep(waiting_time)

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

def verify_databases_are_up(db_configs, nb_of_retry=1):
    """
    Objectif: Verifies that multiple MySQL database containers are up and responsive.

    Parameters:
        - db_configs: List of database configuration dictionaries containing container_name and env_prefix. (List)
        - nb_of_retry: Number of retry attempts before failing. Defaults to 1. (Integer)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program if any database fails to start. (NoneType)
    """
    colored_print(f"Verifying {len(db_configs)} database containers...", "blue")

    for db_config in db_configs:
        container_name = db_config["container_name"]
        env_prefix = db_config.get("env_prefix", "")

        # Use prefixed environment variables if available
        env_data = load_env_file(".env")
        root_password_key = f"{env_prefix}MYSQL_ROOT_PASSWORD"
        root_password = env_data.get(root_password_key, env_data.get("MYSQL_ROOT_PASSWORD"))

        colored_print(f"Verifying database container '{container_name}'...", "blue")
        verify_database_is_up_with_config(container_name, root_password, nb_of_retry)

def verify_database_is_up_with_config(db_container_name, root_password, nb_of_retry=1):
    """
    Objectif: Verifies that a specific MySQL database container is up and responsive using provided password.

    Parameters:
        - db_container_name: The name of the Docker container running the MySQL database. (String)
        - root_password: The MySQL root password to use for verification. (String)
        - nb_of_retry: Number of retry attempts before failing. Defaults to 1. (Integer)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program if the database fails to start. (NoneType)
    """
    waiting_time = 10  # Time in seconds between retries

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
                "-p" + root_password
            ], capture_output=True, text=True)
            if "mysqld is alive" in result.stdout:
                colored_print(f"Database container '{db_container_name}' is ready!", "green")
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

        if attempt == nb_of_retry:
            break

        colored_print(
            f"Attempt {attempt}/{nb_of_retry}: Database not ready. Retrying in {waiting_time} seconds...",
            "yellow"
        )
        time.sleep(waiting_time)

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
