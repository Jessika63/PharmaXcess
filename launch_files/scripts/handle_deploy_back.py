
import subprocess
import os
import shutil
from helpers.colored_print import colored_print

def clean_project():
    """
    Objective:
    Recursively cleans the project directory by removing temporary and cache files.

    Behavior:
    - Skips the `.git` directory.
    - Deletes cache directories such as `__pycache__` and `.pytest_cache`.
    - Removes compiled Python files (`*.pyc`) and system-specific files like `.DS_Store`.
    - Silently ignores errors during deletion to avoid interruption.

    Return Value:
    - None: This function performs file system cleanup and does not return a value.
    """

    for root, dirs, files in os.walk(".", topdown=True):
        if ".git" in dirs: dirs.remove(".git")
        for d in dirs:
            if d in ["__pycache__", ".pytest_cache"]:
                full_path = os.path.join(root, d)
                try: shutil.rmtree(full_path)
                except: pass
        for f in files:
            if f.endswith(".pyc") or f == ".DS_Store":
                full_path = os.path.join(root, f)
                try: os.remove(full_path)
                except: pass

def convert_env_to_unix():
    """
    Objective:
    Ensures that the `.env` file in the backend folder uses Unix-style line endings (LF) 
    instead of Windows-style (CRLF) to prevent issues with scripts and Docker.

    Behavior:
    - Reads the `.env` file in binary mode.
    - Replaces all CRLF (`\r\n`) line endings with LF (`\n`).
    - Writes the converted content back to the file only if changes were made.
    - Prints a success message if conversion occurred, or a warning if the file is missing.

    Return Value:
    - None: This function performs a file modification and prints status messages.
    """
    env_path = os.path.join("backend", ".env")
    if os.path.exists(env_path):
        with open(env_path, "rb") as f:
            content = f.read()
        # Convert CRLF → LF
        new_content = content.replace(b"\r\n", b"\n")
        if new_content != content:
            with open(env_path, "wb") as f:
                f.write(new_content)
            colored_print("✔ .env file converted to Unix format (LF).", "green")
    else:
        colored_print("⚠ No .env file found in backend/", "yellow")

def handle_deploy_back():
    """
    Objective:
    Automates the deployment of the backend application to a remote VM, ensuring 
    environment consistency, Docker management, and database privileges.

    Behavior:
    1. Cleans the local project from temporary and cache files.
    2. Converts the `.env` file to Unix format to avoid line ending issues.
    3. Copies backend files and configuration to the remote VM via SCP.
    4. Connects to the VM via SSH to:
    - Modify the `.env` to set ENV=production.
    - Stop any running backend instance.
    - Start the backend with no-cache option.
    - Update MySQL privileges for the backend user.
    5. Prints status messages at each step for feedback.

    Return Value:
    - None: This function does not return a value but performs deployment operations and prints logs.
    """

    remote = "ubuntu@57.128.57.96"
    remote_path = "/home/ubuntu/PharmaXcess"

    colored_print("Starting backend deployment on VM...", "blue")
    clean_project()

    # Convert .env to Unix before copying
    convert_env_to_unix()

    colored_print("Sending files to VM...", "blue")
    scp_cmd = ["scp", "-i", os.path.expanduser("~/.ssh/id_rsa"), "-r",
               "launch.py", "launch_config.json", "backend", "launch_files",
               f"{remote}:{remote_path}"]
    subprocess.run(scp_cmd, check=True)

    colored_print("SSH connection and .env modification on VM...", "blue")
    ssh_env_cmd = (
        f"cd {remote_path} && "
        "sed -i '/^ENV=/d' backend/.env && "
        "echo 'ENV=production' >> backend/.env && "
        "cat backend/.env"
    )
    result = subprocess.run(["ssh", remote, ssh_env_cmd],
                            capture_output=True, text=True, encoding="utf-8")
    colored_print(f"Content of .env on VM:\n{result.stdout.strip()}", "green")

    colored_print("Stopping backend on VM...", "blue")
    ssh_down_cmd = f"cd {remote_path} && python3 launch.py --down"
    subprocess.run(["ssh", remote, ssh_down_cmd],
                   capture_output=True, text=True, encoding="utf-8")

    colored_print("Starting backend in production on VM...", "blue")
    ssh_back_cmd = (
        f"cd {remote_path} && "
        f"export $(grep -v '^#' backend/.env | xargs) && "
        f"python3 launch.py --back --no-cache-back"
    )
    subprocess.run(["ssh", remote, ssh_back_cmd], check=True)

    # 🔑 Extract DB info from .env (on VM side)
    colored_print("Updating MySQL privileges for px_user...", "blue")
    ssh_db_cmd = (
        f"cd {remote_path} && "
        "export $(grep -v '^#' backend/.env | xargs) && "
        "docker exec -i app-backend-db mysql "
        "-u root -p$MYSQL_ROOT_PASSWORD "
        "-e \"GRANT ALL PRIVILEGES ON $APP_DB_NAME.* TO '$APP_DB_USER'@'%' IDENTIFIED BY '$APP_DB_PASSWORD'; FLUSH PRIVILEGES;\""
    )
    subprocess.run(["ssh", remote, ssh_db_cmd], check=True)

    colored_print("Deployment completed. Logs are in back.log on the VM.", "blue")
