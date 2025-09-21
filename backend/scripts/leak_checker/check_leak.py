
import os
import re
import json
import sys
from tqdm import tqdm
from pathlib import Path
import argparse
import logging

# Constants for False Positives
GLOBAL_FALSE_POSITIVES = [
    r'container_name',   # Matches configuration references to container names
    r'#.*(APP_DB_HOST|DOCTORS_DB_HOST)',  # Comments mentioning only valid *_DB_HOST variants
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
        r'#### Step 6.1 : Start the app, start the db and put the dump in the db',
        r'### Export db dump if needed'
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

def setup_logging(log_file):
    """
    Objectif: Configures the logging system to output log messages either to a specified file or to the terminal (stdout).

    Parameters:
        - log_file: The file path where logs should be written. If None, logs are output to terminal. (String or NoneType)

    Return Value:
        - None: This function configures the global logging system and does not return a value.
    """
    handlers = []
    if log_file:
        handlers.append(logging.FileHandler(log_file, mode='w'))  # Log to file
    else:
        handlers.append(logging.StreamHandler(sys.stdout))  # Log to terminal by default

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=handlers
    )

# Loaders and Configurations
def load_config(script_dir):
    """
    Objectif: Loads and parses the configuration file (config.json) located in the specified script directory.

    Parameters:
        - script_dir: The directory path where the script is located and where config.json is expected to be found. (String)

    Return Value:
        - config_data: The parsed configuration data from the JSON file. (Dictionary)

    Raises:
        - FileNotFoundError: If the configuration file does not exist in the specified directory.
        - json.JSONDecodeError: If the configuration file contains invalid JSON syntax.
    """
    config_path = os.path.join(script_dir, 'config.json')

    try:
        with open(config_path, 'r', encoding='utf-8') as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        logging.error(f"Configuration file {config_path} not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse JSON in {config_path}: {e}")
        sys.exit(1)

def initialize_environment(config):
    """
    Objectif: Initializes the environment by loading environment variables from specified files and setting up ignored files and directories based on the configuration.

    Parameters:
        - config: Configuration dictionary containing paths and ignore settings. (Dictionary)

    Return Value:
        - tuple: A tuple containing:
            - env_dict: Dictionary of loaded environment variables. (Dictionary)
            - ignored_files: List of files to be ignored. (List)
            - ignored_dirs: List of directories to be ignored. (List)
            - env_dirs: List of environment directories derived from env_paths. (List)

    Raises:
        - SystemExit: If no environment variables are found in the specified paths.
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
        logging.warning("No environment variables found. Exiting.")
        sys.exit(0)

    return env_dict, ignored_files, ignored_dirs, env_dirs

def load_env_variables(env_files):
    """
    Objectif: Loads environment variables from a list of .env files and maps them to their corresponding base directories.

    Parameters:
        - env_files: List of file paths pointing to .env files to be processed. (List of Strings)

    Return Value:
        - result: A dictionary where keys are base directory paths (with trailing separator) and values are dictionaries of environment variables loaded from each .env file. (Dictionary)
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
            logging.warning(f"{env_file} not found.")
        except Exception as e:
            logging.error(f"Error reading {env_file}: {e}")

        if env_data:
            result[base_dir + os.sep] = env_data

    return result

# File Scanning
def collect_files(base_dirs, ignored_files, ignored_dirs):
    """
    Objectif: Recursively collects all file paths from specified base directories while filtering out ignored files and directories.

    Parameters:
        - base_dirs: List of root directories to scan for files. (List of Strings)
        - ignored_files: List of specific file paths to exclude from collection. (List of Strings)
        - ignored_dirs: List of directory paths to exclude from scanning. (List of Strings)

    Return Value:
        - files: List of file paths found in the specified directories after applying ignore filters. (List of Strings)
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
    Objectif: Scans a list of files for potential leaks of environment variable values.

    Parameters:
        - env_dict: Dictionary of environment variables to check for leaks, organized by base directories. (Dictionary)
        - files: List of file paths to be scanned for environment variable leaks. (List of Strings)

    Return Value:
        - leaks: Dictionary where keys are file paths and values are lists of detected environment variable leaks in those files. (Dictionary)
    """
    leaks = {}

    for file_path in tqdm(files, desc="Scanning for leaks", unit="file"):
        try:
            if file_leaks := scan_file(file_path, env_dict):
                leaks[file_path] = file_leaks
        except Exception as e:
            logging.error(f"Error reading file {file_path}: {e}")

    return leaks

def scan_file(file_path, env_dict):
    """
    Objectif: Scans a single file for potential leaks of environment variable values by checking each line against environment variables applicable to the file's directory.

    Parameters:
        - file_path: The path to the file to be scanned. (String)
        - env_dict: Dictionary of environment variables organized by base directory paths. (Dictionary)

    Return Value:
        - leaks: List of tuples representing detected leaks, each containing (line_number, environment_variable_key, line_content). (List of Tuples)
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

                for env_vars in applicable_envs.values():
                    leaks.extend(
                        (line_number, key, line.strip())
                        for key, value in env_vars.items()
                        if re.search(rf'\b{re.escape(value)}\b', line)
                        and not is_false_positive(line.strip(), file_path)
                    )
    except Exception as e:
        logging.error(f"Error processing {file_path}: {e}")

    return leaks

# Utilities
def is_ignored(path, ignored_files, ignored_dirs):
    """
    Objectif: Determines if a given file or directory path should be ignored based on predefined ignore lists.

    Parameters:
        - path: The file or directory path to check. (String)
        - ignored_files: List of file paths that should be ignored. (List of Strings)
        - ignored_dirs: List of directory paths that should be ignored. (List of Strings)

    Return Value:
        - True: If the path matches any entry in the ignored files or is within an ignored directory. (Boolean)
        - False: If the path should not be ignored. (Boolean)
    """
    normalized_path = os.path.abspath(path)

    return any(
        normalized_path == os.path.abspath(ignored_file) for ignored_file in ignored_files
    ) or any(
        normalized_path.startswith(os.path.abspath(ignored_dir)) for ignored_dir in ignored_dirs
    )

def is_false_positive(line, file_path):
    """
    Objectif: Determines if a detected potential leak in a line of code is likely a false positive based on predefined patterns and file context.

    Parameters:
        - line: The line of text from the file being scanned. (String)
        - file_path: The full path to the file being scanned. (String)

    Return Value:
        - True: If the line matches known false positive patterns for the given file. (Boolean)
        - False: If the line does not match false positive patterns and should be considered a potential leak. (Boolean)
    """
    file_name = os.path.basename(file_path)

    if any(re.search(pattern, line) for pattern in GLOBAL_FALSE_POSITIVES):
        return True

    if file_name in FILE_SPECIFIC_FALSE_POSITIVES and any(re.search(pattern, line) for pattern in FILE_SPECIFIC_FALSE_POSITIVES[file_name]):
        return True

    if re.search(r'\bDB_HOST\b', line) and ("example" in file_path.lower() or "README" in file_path.lower()):
        return True

    return False

# Report Generation
def report_results(leaks, output_file):
    """
    Objectif: Generates a report of detected environment variable leaks and exits the program with an appropriate status code.

    Parameters:
        - leaks: Dictionary of detected leaks organized by file path. (Dictionary)
        - output_file: Path to the file where the report should be written. If None, output is printed to stdout. (String or NoneType)

    Return Value:
        - None: This function does not return but terminates the program with exit code 0 (no leaks) or 1 (leaks detected).
    """
    if leaks:
        logging.warning("\nPotential leaks detected:")
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                for file_path, occurrences in leaks.items():
                    f.write(f"\n[FILE] {file_path}\n")
                    for line_number, key, line in occurrences:
                        f.write(f"  [LINE {line_number}] {line}\n")
                        f.write(f"    -> Leaked variable: {key}\n")
        else:
            # If no output file, print to stdout
            print("\nPotential leaks detected:")
            for file_path, occurrences in leaks.items():
                print(f"\n[FILE] {file_path}")
                for line_number, key, line in occurrences:
                    print(f"  [LINE {line_number}] {line}")
                    print(f"    -> Leaked variable: {key}")

        sys.exit(1)
    else:
        logging.info("No leaks detected.")
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write("No leaks detected.\n")
        else:
            # If no output file, print to stdout
            print("No leaks detected.")
        sys.exit(0)

# Main Workflow
def main_workflow():
    """
    Objectif: Orchestrates the main workflow for scanning files for leaked secrets, including configuration loading, environment setup, file collection, scanning, and result reporting.

    Parameters:
        - --output_file: Path to the output file for results. Defaults to stdout if not specified. (String, Optional)
        - --log_file: Path to the log file. Defaults to stdout if not specified. (String, Optional)

    Return Value:
        - None: This function does not return but terminates the program with exit code 0 (no leaks detected) or 1 (leaks detected).
    """
    parser = argparse.ArgumentParser(description="Scan for leaked secrets in files.")
    parser.add_argument("--output_file", type=str, default=None, help="Path to the output file. Defaults to stdout.")
    parser.add_argument("--log_file", type=str, default=None, help="Path to the log file. Defaults to stdout.")

    args = parser.parse_args()

    args.output_file = None if args.output_file is sys.stdout else args.output_file
    args.log_file = None if args.log_file is None else args.log_file

    setup_logging(args.log_file)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    config = load_config(script_dir)

    env_dict, ignored_files, ignored_dirs, env_dirs = initialize_environment(config)

    logging.info("Collecting files...")
    files = collect_files(env_dirs, ignored_files, ignored_dirs)

    logging.info("Scanning for leaks...")
    leaks = scan_for_leaks(env_dict, files)

    report_results(leaks, args.output_file)

if __name__ == "__main__":
    main_workflow()
