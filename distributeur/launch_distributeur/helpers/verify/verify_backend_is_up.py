import time
import subprocess
import requests

from colored_print import colored_print

def verify_backend_is_up(backend_container_name, nb_of_retry=10):
    """
    Verifies that the backend app is ready, with detailed error detection.
    :param backend_container_name: The name of the backend container to check.
    :param nb_of_retry: The number of retries before failing (default is 10).
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

    # 2. Check if the backend container is running
    try:
        result = subprocess.run([
            "docker", "ps", "--filter", f"name={backend_container_name}", "--filter", "status=running", "--format", "{{.Names}}"
        ], capture_output=True, text=True)
        running = result.stdout.splitlines()
        if backend_container_name not in running:
            colored_print(f"Backend container '{backend_container_name}' is NOT running! Check logs with: docker logs {backend_container_name}", "red")
            return
    except Exception as e:
        colored_print(f"Error checking backend container status: {e}", "red")
        return

    time.sleep(waiting_time)  # Wait before starting the checks
    colored_print(f"Waiting for backend container '{backend_container_name}' to be ready...", "blue")

    last_error = None
    for attempt in range(1, nb_of_retry + 1):
        try:
            response = requests.get("http://localhost:5000/", timeout=5)
            if response.status_code == 200:
                colored_print("Backend is ready!", "green")
                return  # Exit function successfully
            else:
                colored_print(f"Backend responded with status code {response.status_code}", "yellow")
        except requests.ConnectionError as ce:
            last_error = ce
            if 'Connection refused' in str(ce):
                colored_print(f"Connection refused on port 5000. Backend may not be listening or crashed.", "red")
            else:
                colored_print(f"Connection error: {ce}", "red")
        except requests.Timeout:
            last_error = 'timeout'
            colored_print("Connection to backend timed out. Backend may be slow to start or not listening.", "red")
        except Exception as e:
            last_error = e
            colored_print(f"Unexpected error while checking backend container: {e}", "yellow")

        if attempt != nb_of_retry:
            colored_print(
                f"Attempt {attempt}/{nb_of_retry}: Backend not ready. Retrying in {waiting_time} seconds...",
                "yellow"
            )
            time.sleep(waiting_time)
        else:
            break

    # If we reach here, backend is not up after retries
    colored_print(f"Backend container '{backend_container_name}' is not ready after {nb_of_retry} attempts!", "red")
    # Print last error
    if last_error:
        colored_print(f"Last error: {last_error}", "red")
    # Show last 20 lines of container logs for debugging
    try:
        log_result = subprocess.run([
            "docker", "logs", "--tail", "20", backend_container_name
        ], capture_output=True, text=True)
        colored_print(f"Last 20 lines of backend container logs:\n{log_result.stdout}", "yellow")
    except Exception as e:
        colored_print(f"Could not retrieve backend container logs: {e}", "red")
