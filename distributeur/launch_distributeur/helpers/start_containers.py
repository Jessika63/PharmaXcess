
import subprocess

from colored_print import colored_print
from troubleshooting_message_giver import troubleshooting_message

def start_containers():
    """
    Starts Docker containers using docker-compose with the build option and error handling.

    :param troubleshooting_message: The message to display if an error occurs.
    """
    try:
        subprocess.run(["docker-compose", "up", "--build", "-d"], check=True)
        colored_print("Containers started successfully!", "green")
    except subprocess.CalledProcessError:
        colored_print(troubleshooting_message, "red")
