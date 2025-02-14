
import time
import subprocess
import requests

from colored_print import colored_print

def verify_backend_is_up(backend_container_name, nb_of_retry=1):
    """
    Verifies that the backend app is ready.

    :param backend_container_name: The name of the backend container to check.
    :param nb_of_retry: The number of retries before failing (default is 1).
    """
    waiting_time = 10  # Time in seconds between retries

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
