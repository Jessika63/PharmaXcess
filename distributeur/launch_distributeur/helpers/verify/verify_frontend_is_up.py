
import time
import subprocess
import requests

from colored_print import colored_print

def verify_frontend_is_up(frontend_container_name, nb_of_retry=1):
    """
    Verifies that the frontend app is ready.

    :param frontend_container_name: The name of the frontend container to check.
    :param nb_of_retry: The number of retries before failing (default is 1).
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
