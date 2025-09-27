import subprocess
from helpers.colored_print import colored_print
from helpers.troubleshooting_message_giver import troubleshooting_message_docker_zombie

def stop_container(container_name):
    """Stoppe un conteneur spécifique si en cours dexécution"""
    try:
        result = subprocess.run(
            ["docker", "stop", container_name],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            colored_print(f"Container {container_name} stopped.", "green")
        elif "No such container" in result.stderr:
            colored_print(f"Container {container_name} not found.", "yellow")
        else:
            colored_print(f"Error stopping {container_name}: {result.stderr}", "red")
    except Exception as e:
        colored_print(f"Exception stopping {container_name}: {e}", "red")

def remove_container(container_name):
    """Supprime un conteneur spécifique"""
    try:
        result = subprocess.run(
            ["docker", "rm", "-f", container_name],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            colored_print(f"Container {container_name} removed.", "green")
        elif "No such container" in result.stderr:
            colored_print(f"Container {container_name} not found.", "yellow")
        else:
            colored_print(f"Error removing {container_name}: {result.stderr}", "red")
    except Exception as e:
        colored_print(f"Exception removing {container_name}: {e}", "red")

def remove_image(image_name):
    """Supprime une image spécifique"""
    try:
        result = subprocess.run(
            ["docker", "rmi", "-f", image_name],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            colored_print(f"Image {image_name} removed.", "green")
        elif "No such image" in result.stderr:
            colored_print(f"Image {image_name} not found.", "yellow")
        else:
            colored_print(f"Error removing {image_name}: {result.stderr}", "red")
    except Exception as e:
        colored_print(f"Exception removing {image_name}: {e}", "red")

def remove_volume(volume_name):
    """Supprime un volume spécifique"""
    try:
        result = subprocess.run(
            ["docker", "volume", "rm", "-f", volume_name],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            colored_print(f"Volume {volume_name} removed.", "green")
        elif "No such volume" in result.stderr:
            colored_print(f"Volume {volume_name} not found.", "yellow")
        else:
            colored_print(f"Error removing {volume_name}: {result.stderr}", "red")
    except Exception as e:
        colored_print(f"Exception removing {volume_name}: {e}", "red")

def stop_mobile_app(mobile_app_process):
    """Stoppe le process Expo si actif"""
    if mobile_app_process and mobile_app_process.poll() is None:
        colored_print(f"Stopping Expo mobile app (pid {mobile_app_process.pid})...", "blue")
        try:
            mobile_app_process.terminate()
            mobile_app_process.wait(timeout=5)
            colored_print("Expo mobile app stopped.", "green")
        except subprocess.TimeoutExpired:
            colored_print("Expo mobile app did not stop, killing...", "yellow")
            mobile_app_process.kill()
        except Exception as e:
            colored_print(f"Error stopping Expo app: {e}", "red")
    else:
        colored_print("No Expo app running.", "yellow")

def handle_down(mobile_app_process, containers, images, volumes):
    """
    Stoppe et supprime seulement les conteneurs, images, volumes
    qui concernent PharmaXcess + mobile app Expo.
    """
    colored_print("Shutting down PharmaXcess environment...", "blue")

    # 1. Stop  and Remove containers
    for c in containers:
        stop_container(c)
        remove_container(c)

    # 2. Remove images
    for i in images:
        remove_image(i)

    # 3. Remove volumes
    for v in volumes:
        remove_volume(v)

    # 4. Stop mobile app (Expo)
    stop_mobile_app(mobile_app_process)

    colored_print("Down completed (only PharmaXcess services).", "green")
