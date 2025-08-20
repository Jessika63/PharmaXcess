
import subprocess

from colored_print import colored_print
from troubleshooting_message_giver import troubleshooting_message

def start_containers(no_cache=False):
    """
    Starts Docker containers using docker-compose with the build option and error handling.

    :param no_cache: If True, build without using cache (default: False)
    :param troubleshooting_message: The message to display if an error occurs.
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
