
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from .load_config import load_config
from colored_print import colored_print

# Function to load and validate the configuration file
def load_config_file():
    """
    Objectif: Loads and validates the configuration file, ensuring the presence of required sections and keys.

    Parameters:
        - None

    Return Value:
        - config_data: A dictionary containing the parsed configuration data with keys:
            - required_env_keys: List of required environment keys. (List)
            - db_dump_date: Date of the database dump. (String)
            - debug_logs: Flag indicating if debug logs are enabled ("yes" or "no"). (String)

    Raises:
        - SystemExit: If the configuration file is missing required sections or keys.
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
