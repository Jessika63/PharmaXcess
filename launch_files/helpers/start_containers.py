
import subprocess

from colored_print import colored_print
from troubleshooting_message_giver import troubleshooting_message

def start_containers(no_cache=False):
    """
    Objectif: Starts Docker containers using docker-compose with optional cache control during the build process.

    Parameters:
        - no_cache: If True, builds Docker images without using cache and starts containers. Defaults to False. (Boolean)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program on error. (NoneType)
    """
    try:
        if no_cache:
            colored_print("Starting containers without cache...", "blue")
            # Build without cache first, then start
            subprocess.run(["docker-compose", "build", "--no-cache"], check=True)
            subprocess.run(["docker-compose", "up", "-d"], check=True)
        else:
            # Normal build with cache
            colored_print("Starting containers with cache...", "blue")
            subprocess.run(["docker-compose", "up", "--build", "-d"], check=True)

        colored_print("Containers started successfully!", "green")
    except subprocess.CalledProcessError:
        colored_print(troubleshooting_message, "red")
