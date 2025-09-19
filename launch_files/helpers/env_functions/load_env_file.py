
import os

def load_env_file(env_file_path):
    """
    Objectif: Loads environment variables from a .env file and returns them as a dictionary.

    Parameters:
        - env_file_path: Path to the .env file to load. (String)

    Return Value:
        - env_data: Dictionary containing key-value pairs parsed from the .env file. (Dictionary)

    Raises:
        - FileNotFoundError: If the specified .env file does not exist.
        - ValueError: If the .env file contains invalid lines without an equals sign.
    """
    env_data = {}

    # Check if the file exists
    if not os.path.exists(env_file_path):
        raise FileNotFoundError(f"The file '{env_file_path}' does not exist in {os.getcwd()}.")

    # Read the file and parse its content
    with open(env_file_path, "r") as file:
        for line in file:
            # Ignore comments and empty lines
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if "=" not in line:
                raise ValueError(f"Invalid line in .env file: {line}")

            key, value = line.split("=", 1)
            env_data[key.strip()] = value.strip()
    return env_data
