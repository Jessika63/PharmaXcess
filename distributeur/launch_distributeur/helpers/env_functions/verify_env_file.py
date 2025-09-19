
import os

from colored_print import colored_print

# Function to verify the .env file
def verify_env_file(env_path, required_keys):
    """
    Objectif: Verifies the presence and correctness of required keys in a .env file, checking for missing or extra keys.

    Parameters:
        - env_path: Path to the .env file to verify. (String)
        - required_keys: List of required environment variable keys that must be present in the .env file. (List of Strings)

    Return Value:
        - None: This function does not return a value but prints verification results and may terminate the program on critical errors. (NoneType)
    """
    colored_print("STEP 1: Verifying .env file", "blue")

    if not os.path.exists(env_path):
        colored_print(".env file is missing !", "red")

    # Read .env file content and parse keys and values
    with open(env_path, "r") as file:
        lines = file.readlines()

    env_data = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#"):
            key, _, value = line.partition("=")
            env_data[key.strip()] = value.strip()

    if missing_keys := [key for key in required_keys if key not in env_data]:
        colored_print(f"Missing keys in .env file: {', '.join(missing_keys)}", "red")

    if extra_keys := [key for key in env_data if key not in required_keys]:
        colored_print(f"Extra keys found in .env file: {', '.join(extra_keys)}", "yellow")

    colored_print(".env file verification passed !", "green")
