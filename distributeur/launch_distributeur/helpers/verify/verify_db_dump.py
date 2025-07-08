import os
import re
from colored_print import colored_print

# Function to verify the database dump file
def verify_db_dump(dump_folder, expected_date):
    """
    Verify the presence of the expected database dump file in a folder, with detailed error detection.
    :param dump_folder: Path to the folder containing database dump files
    :param expected_date: Date of the expected dump file in 'DD_MM_YYYY' format
    """
    colored_print("STEP 2: Verifying database dump file", "blue")

    # Construct the expected filename
    expected_file_pattern = f"database_dump_px_{expected_date}.sql"
    dump_file_path = os.path.join(dump_folder, expected_file_pattern)

    # Check if the folder exists
    if not os.path.exists(dump_folder):
        colored_print(f"The dump folder '{dump_folder}' does not exist!", "red")
        return
    if not os.path.isdir(dump_folder):
        colored_print(f"The path '{dump_folder}' is not a directory!", "red")
        return

    # Check for the expected dump file
    try:
        if not os.path.exists(dump_file_path):
            colored_print(f"The expected dump file '{expected_file_pattern}' is missing!", "yellow")
        else:
            colored_print("Correct database dump file is present!", "green")
    except PermissionError:
        colored_print(f"Permission denied when accessing '{dump_file_path}'!", "red")
        return
    except Exception as e:
        colored_print(f"Unexpected error when checking dump file: {e}", "red")
        return

    # List other dump files
    try:
        other_dumps = [
            f for f in os.listdir(dump_folder)
            if re.match(r"database_dump_px_\d{2}_\d{2}_\d{4}\.sql", f)
            and f != expected_file_pattern
        ]
        if other_dumps:
            colored_print(f"Other dump files found: {', '.join(other_dumps)}", "yellow")
    except Exception as e:
        colored_print(f"Error listing dump files: {e}", "red")
