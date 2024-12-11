
import subprocess

from helpers.colored_print import colored_print

def handle_down():
    """
    Stops and removes all Docker containers, images, and volumes.
    """

    colored_print("Stopping all running Docker containers...", "blue")

    # Stop all running containers
    try:
        containers = subprocess.check_output(["docker", "ps", "-aq"], text=True).strip().split("\n")
        if len(containers) > 1:
            subprocess.run(["docker", "stop"] + containers, check=True)
            colored_print("All running containers stopped.", "green")
        else:
            colored_print("No running containers to stop.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"Failed to stop containers. Details: {e.stderr}", "red")

    colored_print("Removing all Docker containers...", "blue")

    # Remove all containers
    try:
        containers = subprocess.check_output(["docker", "ps", "-aq"], text=True).strip().split("\n")
        if len(containers) > 1:
            subprocess.run(["docker", "rm"] + containers, check=True)
            colored_print("All Docker containers removed.", "green")
        else:
            colored_print("No containers to remove.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"ERROR: Failed to remove containers. Details: {e.stderr}", "red")

    colored_print("Removing all Docker images...", "blue")

    # Remove all images
    try:
        images = subprocess.check_output(["docker", "images", "-q"], text=True).strip().split("\n")
        if len(images) > 1:
            subprocess.run(["docker", "rmi"] + images, check=True)
            colored_print("All Docker images removed.", "green")
        else:
            colored_print("No images to remove.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"Failed to remove images. Details: {e.stderr}", "red")

    colored_print("Removing all Docker volumes...", "blue")

    # Remove all volumes
    try:
        volumes = subprocess.check_output(["docker", "volume", "ls", "-q"], text=True).strip().split("\n")
        if len(volumes) > 1:
            subprocess.run(["docker", "volume", "rm"] + volumes, check=True)
            colored_print("All Docker volumes removed.", "green")
        else:
            colored_print("No volumes to remove.", "yellow")
    except subprocess.CalledProcessError as e:
        colored_print(f"ERROR: Failed to remove volumes. Details: {e.stderr}", "red")
