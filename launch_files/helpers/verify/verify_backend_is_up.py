import time
import subprocess
import requests

from colored_print import colored_print

def verify_backend_is_up(backend_container_name, nb_of_retry=10):
    """
    Objectif: Verifies that the backend application within a Docker container is ready and responding by checking its health endpoint with retries.

    Parameters:
        - backend_container_name: The name of the Docker container running the backend application. (String)
        - nb_of_retry: Number of retry attempts before failing. Defaults to 10. (Integer)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program if the backend fails to start. (NoneType)
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
            response = requests.get("http://57.128.57.96:5000/", timeout=5)
            if response.status_code == 200:
                colored_print("Backend is ready!", "green")
                return  # Exit function successfully
            else:
                colored_print(f"Backend responded with status code {response.status_code}", "yellow")
        except requests.ConnectionError as ce:
            last_error = ce
            if 'Connection refused' in str(last_error):
                colored_print(
                    "Connection refused on port 5000. Backend may not be listening or crashed.",
                    "yellow",
                )
            else:
                colored_print(f"Connection error: {last_error}", "yellow")
        except requests.Timeout:
            last_error = 'timeout'
            colored_print("Connection to backend timed out. Backend may be slow to start or not listening.", "yellow")
        except Exception as e:
            last_error = e
            colored_print(f"Unexpected error while checking backend container: {e}", "yellow")

            # Get container logs for debugging
            try:
                logs = subprocess.check_output(
                    ["docker", "logs", backend_container_name],
                    stderr=subprocess.STDOUT,
                    text=True
                )
                colored_print(f"Container logs:\n{logs}", "yellow")
            except subprocess.CalledProcessError as log_error:
                colored_print(f"Failed to get container logs: {log_error}", "yellow")

        if attempt != nb_of_retry:
            colored_print(
                f"Attempt {attempt}/{nb_of_retry}: Backend not ready. Retrying in {waiting_time} seconds...",
                "yellow"
            )
            time.sleep(waiting_time)
        else:
            break

    if nb_of_retry == 1:
        colored_print(
            f"Backend container '{backend_container_name}' is not up!",
            "red"
        )
    else:
        colored_print(
            f"Backend container '{backend_container_name}' is not ready after {nb_of_retry} attempts!",
            "red"
        )
