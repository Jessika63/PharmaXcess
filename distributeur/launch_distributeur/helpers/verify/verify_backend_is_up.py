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

    time.sleep(waiting_time)  # Wait starting the checks

    colored_print(f"Waiting for backend container '{backend_container_name}' to be ready...", "blue")

    for attempt in range(1, nb_of_retry + 1):
        try:
            response = requests.get("http://localhost:5000/", timeout=5)  # 5-second timeout for the request

            if response.status_code == 200:
                colored_print("Backend is ready!", "green")
                return  # Exit function successfully
        except FileNotFoundError:
            colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "yellow")
        except subprocess.CalledProcessError:
            pass
        except Exception as e:
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
