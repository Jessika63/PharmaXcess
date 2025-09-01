
import subprocess
import os

from colored_print import colored_print
from troubleshooting_message_giver import troubleshooting_message

def start_containers(no_cache=False, build_args=None):
    """
    Objectif: Starts Docker containers using docker-compose with optional cache control during the build process.

    Parameters:
        - no_cache: If True, builds Docker images without using cache and starts containers. Defaults to False. (Boolean)
        - build_args: Additional build arguments to pass to docker-compose. Defaults to None. (List)

    Return Value:
        - None: This function does not return a value but prints status messages and may terminate the program on error. (NoneType)
    """
    try:
        # Prepare the base command
        base_cmd = ["docker-compose"]

        if no_cache:
            colored_print("Starting containers without cache...", "blue")
            # Build without cache first, then start
            build_cmd = base_cmd + ["build", "--no-cache"]
            if build_args:
                build_cmd.extend(build_args)
            subprocess.run(build_cmd, check=True, env=os.environ)
            subprocess.run(base_cmd + ["up", "-d"], check=True)
        else:
            # Normal build with cache
            colored_print("Starting containers with cache...", "blue")
            if build_args:
                # If we have build args, we need to build first then start
                build_cmd = base_cmd + ["build"]
                build_cmd.extend(build_args)
                subprocess.run(build_cmd, check=True, env=os.environ)
                subprocess.run(base_cmd + ["up", "-d"], check=True)
            else:
                # No build args, use the simpler command
                subprocess.run(base_cmd + ["up", "--build", "-d"], check=True, env=os.environ)

        colored_print("Containers started successfully!", "green")
    except subprocess.CalledProcessError:
        colored_print(troubleshooting_message, "red")
