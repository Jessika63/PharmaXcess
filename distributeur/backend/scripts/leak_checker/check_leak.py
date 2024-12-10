
import os
import re
import json
import sys
from tqdm import tqdm


# Constants for False Positives
GLOBAL_FALSE_POSITIVES = [
    r'container_name',
    r'#.*DB_HOST',
    r'docker exec.*',
    r'from db import',
    r'^\s*db:$',
]

FILE_SPECIFIC_FALSE_POSITIVES = {
    'README.md': [
        r'creds inside docker-compose\.yml',
        r'container named',
        r'put db dump into docker',
        r'check the name of your db container',
        r'export db dump if needed',
        r'^### Step 6\.1 : Start the app, start the db and put the dump in the db$',
    ],
    'check_leak.py': [
        r'^\s*r\'.*\'',
        r'#.*',
    ],
    'config.json': [
        r'database.sql',
    ],
}


# Loaders and Configurations
def load_config(script_dir):
    """Load the configuration file."""
    config_path = os.path.join(script_dir, 'config.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        print(f"Error: Configuration file {config_path} not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON in {config_path}: {e}")
        sys.exit(1)


def initialize_environment(config):
    """Prepare environment variables and paths."""
    env_paths = config.get("env_paths", [])
    ignored_files = config.get("ignore_files", []) + env_paths
    ignored_dirs = config.get("ignore_dirs", [])
    env_dict = load_env_variables(env_paths)
    if not env_dict:
        print("No environment variables found. Exiting.")
        sys.exit(0)
    return env_dict, ignored_files, ignored_dirs


def load_env_variables(env_paths):
    """Load environment variables from .env files."""
    env_dict = {}
    for env_path in env_paths:
        base_dir = os.path.dirname(os.path.abspath(env_path))
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        try:
                            key, value = line.split('=', 1)
                            env_dict.setdefault(base_dir, {})[key.strip()] = value.strip()
                        except ValueError:
                            print(f"Invalid line in {env_path}: {line}")
        except FileNotFoundError:
            print(f"Error: .env file {env_path} not found.")
    return env_dict


# File Scanning
def collect_files(base_dirs, ignored_files, ignored_dirs):
    """Collect all files from the base directories, ignoring specified paths."""
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
    """Scan all collected files for leaked environment variable values."""
    leaks = {}
    for file_path in tqdm(files, desc="Scanning for leaks", unit="file"):
        try:
            file_leaks = scan_file(file_path, env_dict)
            if file_leaks:
                leaks[file_path] = file_leaks
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
    return leaks


def scan_file(file_path, env_dict):
    """Scan a single file for leaks."""
    leaks = []
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
    return leaks


# Utilities
def is_ignored(path, ignored_files, ignored_dirs):
    """Check if a file or directory should be ignored."""
    normalized_path = os.path.abspath(path)
    return any(
        normalized_path == os.path.abspath(ignored_file) for ignored_file in ignored_files
    ) or any(
        normalized_path.startswith(os.path.abspath(ignored_dir)) for ignored_dir in ignored_dirs
    )


def is_false_positive(line, file_path):
    """Check if a line matches global or file-specific false positive patterns."""
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
    """Report leaks to the user."""
    if leaks:
        print("\nPotential leaks detected:")
        for file_path, occurrences in leaks.items():
            print(f"\nFile: {file_path}")
            for line_number, key, line in occurrences:
                print(f"  Line {line_number}: {line}")
                print(f"    -> Leaked variable: {key}")
        sys.exit(1)
    else:
        print("No leaks detected.")
        sys.exit(0)


# Main Workflow
def main_workflow():
    """Execute the main workflow."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config = load_config(script_dir)
    env_dict, ignored_files, ignored_dirs = initialize_environment(config)

    print("Collecting files...")
    files = collect_files(list(env_dict.keys()), ignored_files, ignored_dirs)

    print("Scanning for leaks...")
    leaks = scan_for_leaks(env_dict, files)

    report_results(leaks)


if __name__ == "__main__":
    main_workflow()
