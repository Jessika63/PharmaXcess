import sys
import json
import requests

API_URL = "http://localhost:5000/add_list_doctors"

def send_json_to_api(json_file_path):
    """
    Reads a JSON file and sends its content to the API.
    """
    try:
        # Read the JSON file
        with open(json_file_path, mode='r', encoding='utf-8') as file:
            data = json.load(file)

        # Check if the data is in the expected format
        if not isinstance(data, dict) or "doctors" not in data:
            print("The JSON file must contain an object with a 'doctors' key.")
            return

        # Send data to the API
        try:
            response = requests.post(API_URL, json=data)

            if response.status_code == 201:
                print("Success: Data has been successfully added.")
            else:
                print(f"Error sending data: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"Connection error to the API: {e}")

    except FileNotFoundError:
        print(f"JSON file not found: {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error: The file {json_file_path} is not a valid JSON file.")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    # Check if a JSON file has been provided as an argument
    if len(sys.argv) != 2:
        print("Usage: python3 fillDBWithFile.py file.json")
    else:
        json_file_path = sys.argv[1]
        send_json_to_api(json_file_path)
