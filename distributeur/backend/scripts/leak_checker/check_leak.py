import os
import re
from tqdm import tqdm
import json
import sys


def load_env_variables(env_paths):
    """Load variables from .env files, associating them with their directory."""
    env_dict = {}
    for env_path in env_paths:
        absolute_path = os.path.abspath(env_path)
        base_dir = os.path.dirname(absolute_path)
        try:
            with open(absolute_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        try:
                            key, value = line.split('=', 1)
                            if base_dir not in env_dict:
                                env_dict[base_dir] = {}
                            env_dict[base_dir][key.strip()] = value.strip()
                        except ValueError:
                            print(f"Invalid line in {env_path}: {line}")
        except FileNotFoundError:
            print(f"Error: .env file {env_path} not found.")
    return env_dict


def should_ignore(file_path, ignored_files, ignored_dirs):
    """Determine if a file or directory should be ignored."""
    normalized_path = os.path.abspath(file_path)
    for ignored_file in ignored_files:
        if os.path.abspath(ignored_file) == normalized_path:
            return True
    for ignored_dir in ignored_dirs:
        if normalized_path.startswith(os.path.abspath(ignored_dir)):
            return True
    return False


def scan_for_leaks(env_dict, ignored_files, ignored_dirs):
    """Scan all files in the directories of .env files for leaked environment variable values."""
    leaks = {}
    all_files = []

    # Collect all files to scan
    for base_dir in env_dict.keys():
        for dirpath, _, filenames in os.walk(base_dir):
            if should_ignore(dirpath, ignored_files, ignored_dirs):
                continue
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                if not should_ignore(file_path, ignored_files, ignored_dirs):
                    all_files.append(file_path)

    # Scan each file for leaks with a progress bar
    for file_path in tqdm(all_files, desc="Scanning for leaks", unit="file"):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line_number, line in enumerate(f, start=1):
                    # Determine which env variables apply to the current file
                    applicable_envs = {
                        base_dir: vars_dict
                        for base_dir, vars_dict in env_dict.items()
                        if file_path.startswith(base_dir)
                    }
                    # Check for leaks against the applicable environment variables
                    for base_dir, env_vars in applicable_envs.items():
                        for key, value in env_vars.items():
                            if re.search(rf'\b{re.escape(value)}\b', line):
                                relative_file_path = os.path.relpath(file_path)  # Use relative paths
                                if relative_file_path not in leaks:
                                    leaks[relative_file_path] = []
                                leaks[relative_file_path].append((line_number, key, line.strip()))
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
    return leaks


def main():
    # Define paths to .env files and ignored elements from config
    config_path = 'distributeur/backend/scripts/leak_checker/config.json'
    try:
        with open(config_path, 'r', encoding='utf-8') as config_file:
            config = json.load(config_file)
    except FileNotFoundError:
        print(f"Error: Configuration file {config_path} not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON in {config_path}: {e}")
        sys.exit(1)

    env_paths = config.get("env_paths", [])
    ignored_files = config.get("ignore_files", [])
    ignored_dirs = config.get("ignore_dirs", [])

    # Add env_paths to ignore_files
    ignored_files.extend(env_paths)

    # Load environment variable values
    env_dict = load_env_variables(env_paths)
    if not env_dict:
        print("No environment variables found. Exiting.")
        sys.exit(0)

    # Scan for leaks
    print("Scanning for leaks...")
    leaks = scan_for_leaks(env_dict, ignored_files, ignored_dirs)

    # Report leaks
    if leaks:
        print("\nPotential leaks detected:")
        for file_path, occurrences in leaks.items():
            print(f"\nFile: {file_path}")  # Relative paths are displayed here
            for line_number, key, line in occurrences:
                print(f"  Line {line_number}: {line}")
                print(f"    -> Leaked variable: {key}")
        sys.exit(1)  # Exit with code 1 if leaks are found
    else:
        print("No leaks detected.")
        sys.exit(0)  # Exit with code 0 if no leaks are found


if __name__ == "__main__":
    main()
