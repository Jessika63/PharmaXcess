

troubleshooting_message = (
    "ERROR: Failed to start Docker containers with docker-compose !\n\n"
    "Troubleshooting steps:\n"
    "1. Ensure Docker Desktop (or the Docker daemon) is running.\n"
    "   - Windows/macOS: Check if Docker Desktop is active in your system tray.\n"
    "   - Linux: Run 'sudo systemctl start docker' to start the Docker service.\n"
    "2. Verify Docker Engine context:\n"
    "   - Run 'docker context ls' and ensure the correct context"
    "(e.g., 'default' or 'desktop-linux') is active.\n"
    "   - Switch context if necessary using 'docker context use [context-name]'.\n"
    "3. Check if Docker commands work manually:\n"
    "   - Test with 'docker ps' to verify Docker is accessible.\n"
    "   - Run 'docker-compose up --build' directly in the terminal to debug errors.\n"
    "4. Restart Docker:\n"
    "   - Windows/macOS: Open Docker Desktop > Settings > Troubleshooting > Restart Docker.\n"
    "   - Linux: Use 'sudo systemctl restart docker'.\n"
    "5. Ensure your user has permission to run Docker:\n"
    "   - Add your user to the 'docker' group (Linux only): 'sudo usermod -aG docker $USER'."
)

troubleshooting_message_docker_zombie = (
    "Docker may be in an unstable or zombie state.\n\n"
    "Troubleshooting steps:\n"
    "1. Restart Docker:\n"
    "   - Windows/macOS: Click on the Docker icon in the system tray > 'Restart Docker Desktop'.\n"
    "   - Linux: Run 'sudo systemctl restart docker'.\n"
    "2. Check Docker daemon status:\n"
    "   - Windows/macOS: Ensure Docker Desktop is running.\n"
    "   - Linux: Use 'systemctl status docker' to check if the service is active.\n"
    "3. Force kill the zombie container (if known):\n"
    "   - Get the PID: docker inspect --format '{{.State.Pid}}' <container_id>\n"
    "   - Then kill it: sudo kill -9 <pid>\n"
    "4. Verify Docker context:\n"
    "   - Run 'docker context ls' to see the current context.\n"
    "   - Switch if needed: 'docker context use [context-name]'\n"
    "5. If nothing works, reboot your system.\n"
)