
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from .load_config import load_config
from colored_print import colored_print

# Function to load and validate the configuration file
def load_config_file():
    """
    Loads and validates a configuration file, ensuring the presence of required keys.

    Returns:
        dict: A dictionary containing the parsed configuration data, including:
            - "required_env_keys" (list): A list of environment keys required for the application.
            - "db_dump_date" (str): The date of the database dump.
            - "debug_logs" (str): A flag indicating whether debug logs are enabled ("Yes" or "No").

    Raises:
        SystemExit:
            Exits the program with an error message if the configuration file is missing required keys.
    """

    # Load the configuration file
    config = load_config()

    # Validate that main sections are present in the configuration
    if "application_settings" not in config:
        colored_print("Configuration file is missing 'application_settings' section.", "red")
    if "verification_settings" not in config:
        colored_print("Configuration file is missing 'verification_settings' section.", "red")

    # Validate required keys in 'verification_settings'
    missing_config_keys = []
    verification_settings = config.get("verification_settings", {})
    if "required_env_keys" not in verification_settings:
        missing_config_keys.append("required_env_keys")
    if "db_dump_date" not in verification_settings:
        missing_config_keys.append("db_dump_date")

    if missing_config_keys:
        colored_print(
            f"'verification_settings' section is missing required keys: {', '.join(missing_config_keys)}",
            "red",
        )

    # Extract configuration data
    config_data = {
        "required_env_keys": verification_settings.get("required_env_keys", [])
    }
    config_data["db_dump_date"] = verification_settings.get("db_dump_date", "")

    # Extract application settings
    application_settings = config.get("application_settings", {})
    config_data["debug_logs"] = application_settings.get("debug_logs", "No").lower()

    return config_data
