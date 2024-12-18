
import os
import re
import json
import sys
from tqdm import tqdm
from pathlib import Path

# Constants for False Positives
GLOBAL_FALSE_POSITIVES = [
    r'container_name',  # Matches configuration references to container names
    r'#.*DB_HOST',       # Comments mentioning DB_HOST are considered non-sensitive
    r'docker exec.*',    # Commands to execute in Docker containers
    r'from db import',   # Standard imports from a database module
    r'^\s*db:$',         # Lines defining a 'db' key in YAML/JSON
]

FILE_SPECIFIC_FALSE_POSITIVES = {
    'README.md': [
        # Patterns specific to README.md; these are examples or instructions not representing actual leaks.
        r'creds inside docker-compose\.yml',
        r'container named',
        r'put db dump into docker',
        r'check the name of your db container',
        r'export db dump if needed',
        r'^### Step 6\.1 : Start the app, start the db and put the dump in the db$',
    ],
    'check_leak.py': [
        # Patterns that match code structures or comments in check_leak.py.
        r'^\s*r\'.*\'',
        r'#.*',
    ],
    'config.json': [
        # Patterns referencing files commonly used in example configurations.
        r'database.sql',
    ],
}

# Loaders and Configurations
def load_config(script_dir):
    """
    Load the configuration file.

    Args:
        script_dir (str): The directory of the script.

    Returns:
        dict: Parsed configuration from the JSON file.

    Raises:
        FileNotFoundError: If the configuration file is not found.
        json.JSONDecodeError: If the configuration file contains invalid JSON.
    """
    config_path = os.path.join(script_dir, 'config.json')

    try:
        with open(config_path, 'r', encoding='utf-8') as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        print(f"[ERROR] Configuration file {config_path} not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[ERROR] Failed to parse JSON in {config_path}: {e}")
        sys.exit(1)

def initialize_environment(config):
    """
    Prepare environment variables and paths based on configuration.

    Args:
        config (dict): Configuration dictionary.

    Returns:
        tuple: Contains loaded environment variables, ignored files, ignored directories, and environment directories.
    """
    env_paths = config.get("env_paths", [])
    env_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(path), '..'))
        for path in env_paths
    ]
    ignored_files = config.get("ignore_files", []) + env_paths
    ignored_dirs = config.get("ignore_dirs", [])

    env_dict = load_env_variables(env_paths)

    if not env_dict:
        print("[WARNING] No environment variables found. Exiting.")
        sys.exit(0)

    return env_dict, ignored_files, ignored_dirs, env_dirs

def load_env_variables(env_files):
    """
    Load environment variables from specified files.

    Args:
        env_files (list): List of paths to .env files.

    Returns:
        dict: Dictionary mapping directories to their environment variables.
    """
    result = {}

    for env_file in env_files:
        absolute_path = Path(env_file).resolve()
        base_dir = str(absolute_path.parents[1])  # Parent directory of the .env file's directory
        env_data = {}

        try:
            with open(absolute_path, 'r', encoding='utf-8', errors='ignore') as file:
                for line in file:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = map(str.strip, line.split('=', 1))
                        env_data[key] = value
        except FileNotFoundError:
            print(f"[WARNING] {env_file} not found.")
        except Exception as e:
            print(f"[ERROR] Error reading {env_file}: {e}")

        if env_data:
            result[base_dir + os.sep] = env_data

    return result

# File Scanning
def collect_files(base_dirs, ignored_files, ignored_dirs):
    """
    Collect all files from the base directories, ignoring specified paths.

    Args:
        base_dirs (list): List of base directories to scan.
        ignored_files (list): List of files to ignore.
        ignored_dirs (list): List of directories to ignore.

    Returns:
        list: List of file paths to scan.
    """
    files = []

    for base_dir in base_dirs:
        for dirpath, _, filenames in os.walk(base_dir):
            if is_ignored(dirpath, ignored_files, ignored_dirs):
                continue

            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                if not is_ignored(file_path, ignored_files, ignored_dirs):
                    files.append(file_path)

    return files

def scan_for_leaks(env_dict, files):
    """
    Scan all collected files for leaked environment variable values.

    Args:
        env_dict (dict): Dictionary of environment variables.
        files (list): List of files to scan.

    Returns:
        dict: Dictionary of detected leaks categorized by file path.
    """
    leaks = {}

    for file_path in tqdm(files, desc="Scanning for leaks", unit="file"):
        try:
            file_leaks = scan_file(file_path, env_dict)
            if file_leaks:
                leaks[file_path] = file_leaks
        except Exception as e:
            print(f"[ERROR] Error reading file {file_path}: {e}")

    return leaks

def scan_file(file_path, env_dict):
    """
    Scan a single file for leaks.

    Args:
        file_path (str): Path to the file to scan.
        env_dict (dict): Dictionary of environment variables.

    Returns:
        list: List of detected leaks, each represented as a tuple (line_number, key, line).
    """
    leaks = []

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line_number, line in enumerate(f, start=1):
                applicable_envs = {
                    base_dir: vars_dict
                    for base_dir, vars_dict in env_dict.items()
                    if file_path.startswith(base_dir)
                }

                for base_dir, env_vars in applicable_envs.items():
                    for key, value in env_vars.items():
                        if re.search(rf'\b{re.escape(value)}\b', line):
                            if not is_false_positive(line.strip(), file_path):
                                leaks.append((line_number, key, line.strip()))
    except Exception as e:
        print(f"[ERROR] Error processing {file_path}: {e}")

    return leaks

# Utilities
def is_ignored(path, ignored_files, ignored_dirs):
    """
    Check if a file or directory should be ignored.

    Args:
        path (str): Path to the file or directory.
        ignored_files (list): List of ignored files.
        ignored_dirs (list): List of ignored directories.

    Returns:
        bool: True if the path should be ignored, False otherwise.
    """
    normalized_path = os.path.abspath(path)

    return any(
        normalized_path == os.path.abspath(ignored_file) for ignored_file in ignored_files
    ) or any(
        normalized_path.startswith(os.path.abspath(ignored_dir)) for ignored_dir in ignored_dirs
    )

def is_false_positive(line, file_path):
    """
    Check if a line matches global or file-specific false positive patterns.

    Args:
        line (str): The line to check.
        file_path (str): Path of the file containing the line.

    Returns:
        bool: True if the line is a false positive, False otherwise.
    """
    file_name = os.path.basename(file_path)

    if any(re.search(pattern, line) for pattern in GLOBAL_FALSE_POSITIVES):
        return True

    if file_name in FILE_SPECIFIC_FALSE_POSITIVES:
        if any(re.search(pattern, line) for pattern in FILE_SPECIFIC_FALSE_POSITIVES[file_name]):
            return True

    if re.search(r'\bDB_HOST\b', line):
        if "example" in file_path.lower() or "README" in file_path.lower():
            return True

    return False

# Report Generation
def report_results(leaks):
    """
    Report detected leaks to the user.

    Args:
        leaks (dict): Dictionary of detected leaks categorized by file path.

    Exits:
        1: If leaks are detected.
        0: If no leaks are detected.
    """
    if leaks:
        print("\n[WARNING] Potential leaks detected:")

        for file_path, occurrences in leaks.items():
            print(f"\n[FILE] {file_path}")
            for line_number, key, line in occurrences:
                print(f"  [LINE {line_number}] {line}")
                print(f"    -> Leaked variable: {key}")

        sys.exit(1)
    else:
        print("[INFO] No leaks detected.")
        sys.exit(0)

# Main Workflow
def main_workflow():
    """
    Execute the main workflow of the leak checker.

    Steps:
        1. Load configuration.
        2. Initialize environment variables and paths.
        3. Collect files to scan.
        4. Scan files for leaks.
        5. Report results.

    Exits:
        0: If no leaks are detected.
        1: If leaks are detected.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config = load_config(script_dir)

    env_dict, ignored_files, ignored_dirs, env_dirs = initialize_environment(config)

    print("[INFO] Collecting files...")
    files = collect_files(env_dirs, ignored_files, ignored_dirs)

    print("[INFO] Scanning for leaks...")
    leaks = scan_for_leaks(env_dict, files)

    report_results(leaks)

if __name__ == "__main__":
    main_workflow()
