import time
import subprocess
import requests
from colored_print import colored_print

def verify_frontend_is_up(frontend_container_name, nb_of_retry=1):
    """
    Verifies that the frontend app is ready, with detailed error detection.
    :param frontend_container_name: The name of the frontend container to check.
    :param nb_of_retry: The number of retries before failing (default is 1).
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
                    "red",
                )
            else:
                colored_print(f"Connection error: {last_error}", "yellow")
        except requests.Timeout:
            last_error = 'timeout'
            colored_print("Connection to frontend timed out. Frontend may be slow to start or not listening.", "yellow")
        except Exception as e:
            last_error = e
            colored_print(f"Unexpected error while checking frontend container: {e}", "yellow")

        if attempt == nb_of_retry:
            break

        colored_print(
            f"Attempt {attempt}/{nb_of_retry}: Frontend not ready. Retrying in {waiting_time} seconds...",
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
