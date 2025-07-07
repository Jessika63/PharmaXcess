import subprocess

from helpers.colored_print import colored_print
from helpers.troubleshooting_message_giver import troubleshooting_message_docker_zombie


def handle_down():
    """
    Stops and removes all Docker containers, images, and volumes.
    Handles zombie container cases with troubleshooting suggestions.
    """

    colored_print("Stopping all running Docker containers...", "blue")

    try:
        containers = subprocess.check_output(["docker", "ps", "-aq"], text=True).strip().split("\n")
        if containers and containers[0]:
            result = subprocess.run(["docker", "stop"] + containers, capture_output=True, text=True)
            if result.returncode == 0:
                colored_print("All running containers stopped.", "green")
            else:
                colored_print("ERROR: Failed to stop containers.", "yellow")
                if "tried to kill container, but did not receive an exit event" in result.stderr:
                    colored_print("Detected zombie container state.", "yellow")
                    colored_print(troubleshooting_message_docker_zombie, "red")
                else:
                    colored_print(f"Details: {result.stderr}", "red")
        else:
            colored_print("No running containers to stop.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"Unexpected error while listing containers: {e}", "red")

    colored_print("Removing all Docker containers...", "blue")

    try:
        containers = subprocess.check_output(["docker", "ps", "-aq"], text=True).strip().split("\n")
        if containers and containers[0]:
            result = subprocess.run(["docker", "rm", "-f"] + containers, capture_output=True, text=True)
            if result.returncode == 0:
                colored_print("All Docker containers removed.", "green")
            else:
                colored_print("ERROR: Failed to remove containers.", "yellow")
                if "tried to kill container, but did not receive an exit event" in result.stderr:
                    colored_print("Detected zombie container state.", "yellow")
                    colored_print(troubleshooting_message_docker_zombie, "red")
                else:
                    colored_print(f"Details: {result.stderr}", "red")
        else:
            colored_print("No containers to remove.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"Unexpected error while listing containers: {e}", "red")

    colored_print("Removing all Docker images...", "blue")

    try:
        images = subprocess.check_output(["docker", "images", "-q"], text=True).strip().split("\n")
        if images and images[0]:
            result = subprocess.run(["docker", "rmi", "-f"] + images, capture_output=True, text=True)
            if result.returncode == 0:
                colored_print("All Docker images removed.", "green")
            else:
                colored_print("ERROR: Failed to remove images.", "red")
                colored_print(f"Details: {result.stderr}", "red")
        else:
            colored_print("No images to remove.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"Unexpected error while listing images: {e}", "red")

    colored_print("Removing all Docker volumes...", "blue")

    try:
        volumes = subprocess.check_output(["docker", "volume", "ls", "-q"], text=True).strip().split("\n")
        if volumes and volumes[0]:
            result = subprocess.run(["docker", "volume", "rm", "-f"] + volumes, capture_output=True, text=True)
            if result.returncode == 0:
                colored_print("All Docker volumes removed.", "green")
            else:
                colored_print("ERROR: Failed to remove volumes.", "red")
                colored_print(f"Details: {result.stderr}", "red")
        else:
            colored_print("No volumes to remove.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"Unexpected error while listing volumes: {e}", "red")
