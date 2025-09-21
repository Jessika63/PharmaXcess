import time
import subprocess
import requests
from colored_print import colored_print

def verify_frontend_is_up(frontend_container_name, nb_of_retry=1):
    """
    Objectif: Verifies that the frontend application within a Docker container is ready and responding by checking its HTTP endpoint with retries.

    Parameters:
        - frontend_container_name: The name of the Docker container running the frontend application. (String)
        - nb_of_retry: Number of retry attempts before failing. Defaults to 1. (Integer)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program if the frontend fails to start. (NoneType)
    """
    waiting_time = 60  # Time in seconds between retries

    # 1. Check if Docker is installed
    try:
        subprocess.run(["docker", "--version"], check=True, capture_output=True)
    except FileNotFoundError:
        colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "red")
        return
    except Exception as e:
        colored_print(f"Unexpected error when checking Docker installation: {e}", "red")
        return

    # 2. Check if the frontend container is running
    try:
        result = subprocess.run([
            "docker", "ps", "--filter", f"name={frontend_container_name}", "--filter", "status=running", "--format", "{{.Names}}"
        ], capture_output=True, text=True)
        running = result.stdout.splitlines()
        if frontend_container_name not in running:
            colored_print(f"Frontend container '{frontend_container_name}' is NOT running! Check logs with: docker logs {frontend_container_name}", "red")
            return
    except Exception as e:
        colored_print(f"Error checking frontend container status: {e}", "red")
        return

    time.sleep(waiting_time)  # Wait before starting the checks
    colored_print(f"Waiting for frontend container '{frontend_container_name}' to be ready...", "blue")

    last_error = None
    for attempt in range(1, nb_of_retry + 1):
        try:
            response = requests.get("http://localhost:3000/", timeout=5)
            if response.status_code == 200:
                colored_print("Frontend is ready!", "green")
                return  # Exit function successfully
            else:
                colored_print(f"Frontend responded with status code {response.status_code}", "yellow")
        except requests.ConnectionError as ce:
            last_error = ce
            if 'Connection refused' in str(last_error):
                colored_print(
                    "Connection refused on port 3000. Frontend may not be listening or crashed.",
                    "yellow",
                )
            else:
                colored_print(f"Connection error: {last_error}", "yellow")
        except requests.Timeout:
            last_error = 'timeout'
            colored_print("Connection to frontend timed out. Frontend may be slow to start or not listening.", "yellow")
        except Exception as e:
            last_error = e
            colored_print(f"Unexpected error while checking frontend container: {e}", "yellow")

            # Get container logs for debugging
            try:
                logs = subprocess.check_output(
                    ["docker", "logs", frontend_container_name],
                    stderr=subprocess.STDOUT,
                    text=True
                )
                colored_print(f"Container logs:\n{logs}", "yellow")
            except subprocess.CalledProcessError as log_error:
                colored_print(f"Failed to get container logs: {log_error}", "yellow")

        if attempt == nb_of_retry:
            break
        colored_print(
            f"Attempt {attempt}/{nb_of_retry}: frontend not ready. Retrying in {waiting_time} seconds...",
            "yellow"
        )
        time.sleep(waiting_time)
    # If we reach here, frontend is not up after retries
    colored_print(f"Frontend container '{frontend_container_name}' is not ready after {nb_of_retry} attempts!", "red")
    # Print last error
    if last_error:
        colored_print(f"Last error: {last_error}", "red")
    # Show last 20 lines of container logs for debugging
    try:
        log_result = subprocess.run([
            "docker", "logs", "--tail", "20", frontend_container_name
        ], capture_output=True, text=True)
        colored_print(f"Last 20 lines of frontend container logs:\n{log_result.stdout}", "yellow")
    except Exception as e:
        colored_print(f"Could not retrieve frontend container logs: {e}", "red")
