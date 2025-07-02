import subprocess
from helpers.colored_print import colored_print

def handle_export_image(image_name, output_tar_path):
    """
    Exports the specified Docker image to a tar file.
    Args:
        image_name (str): Name of the Docker image to export.
        output_tar_path (str): Path to the output tar file.
    """
    try:
        colored_print(f"Exporting Docker image '{image_name}' to '{output_tar_path}'...", "blue")
        subprocess.run([
            "docker", "save", "-o", output_tar_path, image_name
        ], check=True)
        colored_print(f"Docker image '{image_name}' exported successfully to '{output_tar_path}'!", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"Failed to export Docker image: {e}", "red") 