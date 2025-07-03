import subprocess
import os
import time
from tqdm import tqdm
from helpers.colored_print import colored_print

def handle_import_images(input_tar_path, backend_app_image_name, backend_container_name, db_container_name):
    """
    Imports Docker images from a tar file using docker load, with a file size progress bar, then runs backend and db containers.
    Args:
        input_tar_path (str): Path to the input tar file.
        backend_app_image_name (str): Name for the backend app image.
        backend_container_name (str): Name for the backend app container.
        db_container_name (str): Name for the db container.
    """
    try:
        colored_print(f"Importing Docker images from '{input_tar_path}'...", "blue")
        # Start the docker load process
        with open(input_tar_path, 'rb') as f:
            process = subprocess.Popen([
                "docker", "load"
            ], stdin=f)
            # Show progress bar for file size
            pbar = tqdm(total=os.path.getsize(input_tar_path) / 1024 / 1024, desc="Loading images", unit="MB")
            loaded = 0
            while process.poll() is None:
                # Simulate progress (since docker load doesn't output progress)
                pbar.update(1)
                loaded += 1
                time.sleep(0.5)
                if loaded >= pbar.total:
                    break
            pbar.close()
        if process.returncode == 0:
            colored_print(f"Docker images imported successfully from '{input_tar_path}'!", "green")
        else:
            colored_print(f"docker load failed with exit code {process.returncode}", "red")
            return

        # Run backend app container
        colored_print(f"Running backend app container '{backend_container_name}' from image '{backend_app_image_name}'...", "blue")
        subprocess.run([
            "docker", "run", "-d",
            "--name", backend_container_name,
            "-p", "5000:5000",
            "-e", "FLASK_ENV=development",
            "-e", f"DB_HOST=distributeur-backend-db",
            "-e", f"DB_USER=root",
            "-e", f"DB_PASSWORD=root",
            "-e", f"DB_NAME=doctors_db",
            backend_app_image_name,
            "python", "app.py"
        ], check=True)
        colored_print(f"Backend app container '{backend_container_name}' started!", "green")

        # Run db container
        colored_print(f"Running db container '{db_container_name}'...", "blue")
        subprocess.run([
            "docker", "run", "-d",
            "--name", db_container_name,
            "-e", "MYSQL_ROOT_PASSWORD=root",
            "-e", "MYSQL_DATABASE=doctors_db",
            "-p", "3307:3306",
            "mysql:5.7"
        ], check=True)
        colored_print(f"DB container '{db_container_name}' started!", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"Failed to import or run Docker containers: {e}", "red")
    except Exception as e:
        colored_print(f"Failed to import Docker images: {e}", "red")
