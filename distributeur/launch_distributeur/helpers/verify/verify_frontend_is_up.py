
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
    waiting_time = 1  # Time in minutes between retries

    time.sleep(waiting_time * 60)  # Wait starting the checks

    colored_print(f"Waiting for frontend container '{frontend_container_name}' to be ready...", "blue")

    for attempt in range(1, nb_of_retry + 1):
        try:
            response = requests.get("http://localhost:3000/", timeout=5)  # 5-second timeout for the request

            if response.status_code == 200:
                colored_print("frontend is ready!", "green")
                return  # Exit function successfully
        except FileNotFoundError:
            colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "yellow")
        except subprocess.CalledProcessError:
            pass
        except Exception as e:
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

        if attempt != nb_of_retry:
            colored_print(
                f"Attempt {attempt}/{nb_of_retry}: frontend not ready. Retrying in {waiting_time} minutes...",
                "yellow"
            )
            time.sleep(waiting_time * 60)
        else:
            break

    if nb_of_retry == 1:
        colored_print(
            f"frontend container '{frontend_container_name}' is not up!",
            "red"
        )
    else:
        colored_print(
            f"frontend container '{frontend_container_name}' is not ready after {nb_of_retry} attempts!",
            "red"
        )
