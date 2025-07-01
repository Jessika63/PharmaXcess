import subprocess
from helpers.colored_print import colored_print

def handle_import_image(input_tar_path):
    """
    Imports a Docker image from a tar file.
    Args:
        input_tar_path (str): Path to the input tar file.
    """
    try:
        colored_print(f"Importing Docker image from '{input_tar_path}'...", "blue")
        subprocess.run([
            "docker", "load", "-i", input_tar_path
        ], check=True)
        colored_print(f"Docker image imported successfully from '{input_tar_path}'!", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"Failed to import Docker image: {e}", "red") 