import subprocess
import os
import time
from tqdm import tqdm
from helpers.colored_print import colored_print

def handle_export_images(output_tar_path, image_names):
    """
    Exports the specified Docker images to a tar file using docker save, with a file size progress bar.
    Args:
        output_tar_path (str): Path to the output tar file.
        image_names (list): List of Docker image names to export.
    """
    # Ensure the tar file is created in the 'distributeur' directory
    cwd = os.path.abspath(os.getcwd())
    distrib_dir = None
    parts = cwd.split(os.sep)
    if 'distributeur' in parts:
        distrib_dir = os.sep.join(parts[:parts.index('distributeur')+1])
    else:
        distrib_dir = cwd  # fallback: current dir
    if os.path.basename(cwd) == 'distributeur':
        tar_path = os.path.join(cwd, output_tar_path)
    else:
        tar_path = os.path.join(distrib_dir, output_tar_path)
    try:
        colored_print(f"Exporting Docker images {image_names} to '{tar_path}'...", "blue")
        # Start the docker save process
        with open(tar_path, 'wb') as f:
            process = subprocess.Popen([
                "docker", "save", *image_names
            ], stdout=f)
            # Show progress bar for file size
            pbar = tqdm(total=4000, desc="Saving images", unit="MB")
            last_size = 0
            while process.poll() is None:
                if os.path.exists(tar_path):
                    size = os.path.getsize(tar_path)
                    pbar.update((size - last_size) / 1024 / 1024)
                    last_size = size
                time.sleep(1)
            # Final update
            if os.path.exists(tar_path):
                size = os.path.getsize(tar_path)
                pbar.update((size - last_size) / 1024 / 1024)
            pbar.close()
        if process.returncode == 0:
            colored_print(f"Docker images exported successfully to '{tar_path}'!", "green")
        else:
            colored_print(f"docker save failed with exit code {process.returncode}", "red")
    except Exception as e:
        colored_print(f"Failed to export Docker images: {e}", "red") 