import sys
import json
import csv
import requests
import unicodedata
import os

env = os.getenv('ENV')

if env == 'production':
    API_URL = "http://57.128.57.96:5000/add_list_doctors"
elif env == 'development':
    API_URL = "http://localhost:5000/add_list_doctors"
else:
    print("Erreur : la variable ENV n'est pas définie correctement")
BATCH_SIZE = 180  # Batch size

def validate_row(row):
    """
    Objectif: Validates if a CSV row contains all required fields with non-empty values.

    Parameters:
        - row: A dictionary representing a single CSV row, where keys are column names. (Dictionary)

    Return Value:
        - True: If all required fields are present and contain non-empty string values. (Boolean)
        - False: If any required field is missing or contains an empty value. (Boolean)
    """
    required_fields = [
        "Practice First Name",
        "Practice Last Name",
        "PP Identifier",
        "Profession Label",
        "Cedex Office (structure coordinates)"
    ]
    return all(row.get(field, "").strip() for field in required_fields)

def clean_text(value):
    """
    Objectif: Cleans and normalizes text by removing invalid or special characters, including Unicode normalization and filtering to printable characters.

    Parameters:
    - value: The input text to be cleaned. Can be a string or None. (String or NoneType)

    Return Value:
    - cleaned_text: The cleaned and normalized text as a string, or an empty string if input is None or empty. (String)
    """
    if not value:
        return ""
    value = unicodedata.normalize("NFKC", value)
    value = value.encode('utf-8', 'ignore').decode('utf-8').strip()
    return "".join(c for c in value if c.isprintable())

def process_csv(csv_path):
    """
    Objectif: Reads and processes a CSV file in batches, validating and cleaning each row to prepare doctor data for insertion.

    Parameters:
        - csv_path: The file path of the CSV to process. (String)

    Return Value:
        - Yields batches of validated and cleaned doctor dictionaries when available. (Generator[List[Dict]])
        - Prints error messages for file not found or other exceptions without returning values.
    """
    doctors = []
    try:
        with open(csv_path, mode='r', encoding='utf-8', errors='replace') as file:
            csv_reader = csv.DictReader(file, delimiter='|')
            for row in csv_reader:
                if validate_row(row):
                    doctors.append({
                        "first_name": clean_text(row["Practice First Name"]),
                        "last_name": clean_text(row["Practice Last Name"]),
                        "rpps": clean_text(row["PP Identifier"]),
                        "sector": clean_text(row["Profession Label"]),
                        "region": clean_text(row["Cedex Office (structure coordinates)"]),
                    })
                    if len(doctors) == BATCH_SIZE:
                        yield doctors
                        doctors = []
        if doctors:
            yield doctors
    except FileNotFoundError:
        print(f"Error: File {csv_path} not found.")
    except Exception as e:
        print(f"Unexpected error while processing CSV: {e}")

def process_json(json_path):
    """
    Objectif: Reads and processes a JSON file containing doctor data, extracting the list of doctors from the file.

    Parameters:
        - json_path: The file path of the JSON file to process. (String)

    Return Value:
        - doctors: A list of doctor dictionaries extracted from the JSON file. Returns empty list on error. (List)
    """
    try:
        with open(json_path, mode='r', encoding='utf-8') as file:
            data = json.load(file)
        if not isinstance(data, dict) or "doctors" not in data:
            print("The JSON file must contain a 'doctors' key.")
            return []
        return data["doctors"]
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error with JSON file: {e}")
        return []

def send_data_to_api(doctors):
    """
    Objectif: Sends a batch of doctor data to a predefined API endpoint for processing or storage.

    Parameters:
        - doctors: A list of doctor dictionaries to be sent to the API. (List of Dictionaries)

    Return Value:
        - None: This function does not return a value but prints success or error messages to the console.
    """
    if not doctors:
        print("Error: No doctors to send.")
        return
    payload = {"doctors": doctors}
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 201:
            print("Success: Data has been sent to the API.")
        else:
            print(f"API Error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Connection error to API: {e}")

def main(file_path):
    """
    Objectif: Detects the file type based on the extension and processes the data accordingly, sending it to the API in the appropriate format.

    Parameters:
        - file_path: The path to the file to be processed. (String)

    Return Value:
        - None: This function does not return a value but may print status or error messages to the console.
    """
    if file_path.endswith(".json"):
        doctors = process_json(file_path)
        send_data_to_api(doctors)
    elif file_path.endswith(".csv") or file_path.endswith(".txt"):
        for batch in process_csv(file_path):
            send_data_to_api(batch)
    else:
        print("Unsupported format. Use a JSON or CSV file.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 fillDBWithFile.py <file_path>")
    else:
        main(sys.argv[1])
