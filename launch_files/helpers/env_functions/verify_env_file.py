
import os

from colored_print import colored_print

def verify_env_files(env_configs):
    """
    Objectif: Verifies the presence and correctness of required keys in multiple .env files,
              checking for missing or extra keys in each file.

    Parameters:
        - env_configs: List of tuples, each containing:
            - env_path: Path to the .env file to verify. (String)
            - required_keys: List of required environment variable keys for that file. (List of Strings)

    Return Value:
        - None: This function does not return a value but prints verification results and may terminate the program on critical errors. (NoneType)
    """
    # Verify all env files
    for env_path, required_keys in env_configs.items():
        colored_print(f"Verifying .env file: {env_path}", "blue")

        env_file_path = os.path.join(env_path, ".env")

        if not os.path.exists(env_file_path):
            colored_print(f"{env_file_path} is missing!", "red")
            continue  # Skip further checks for this file

        # Read .env file content and parse keys and values
        with open(env_file_path, "r") as file:
            lines = file.readlines()

        env_data = {}
        for line in lines:
            line = line.strip()
            if line and not line.startswith("#"):
                key, _, value = line.partition("=")
                env_data[key.strip()] = value.strip()

        # Check for missing keys
        missing_keys = [key for key in required_keys if key not in env_data]
        if missing_keys:
            colored_print(f"Missing keys in {env_path}: {', '.join(missing_keys)}", "red")

        # Check for extra keys
        extra_keys = [key for key in env_data if key not in required_keys]
        if extra_keys:
            colored_print(f"Extra keys found in {env_path}: {', '.join(extra_keys)}", "yellow")

        if not missing_keys:
            colored_print(f"{env_path} verification passed!", "green")
