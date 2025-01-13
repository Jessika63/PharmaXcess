

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
