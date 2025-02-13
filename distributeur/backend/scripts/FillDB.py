import sys
import json
import csv
import requests
import unicodedata

API_URL = "http://localhost:5000/add_list_doctors"
BATCH_SIZE = 180  # Batch size

def validate_row(row):
    """
    Checks if a CSV row contains all required information.
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
    Cleans text by removing invalid or special characters.
    """
    if not value:
        return ""
    value = unicodedata.normalize("NFKC", value)
    value = value.encode('utf-8', 'ignore').decode('utf-8').strip()
    return "".join(c for c in value if c.isprintable())

def process_csv(csv_path):
    """
    Reads a CSV file and prepares data in batches.
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
    Reads a JSON file and prepares data as a list.
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
    Sends a batch of doctors to the API.
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
    Detects the file type and sends the corresponding data to the API.
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
