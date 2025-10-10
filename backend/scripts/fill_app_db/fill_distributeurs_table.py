
import os
import sys
import subprocess
import time

# -----------------------
# Installation dépendances
# -----------------------
def ensure_package(package_name, import_name=None):
    """
    Objective:
    Ensure that a specific Python package is installed and importable.

    Parameters:
    - package_name: The name of the package to install via pip if not already installed. (String, required)
    - import_name: Optional. The name used to import the package if different from package_name. Defaults to package_name. (String, optional)

    Process:
    - Tries to import the package using the specified import_name.
    - If the package is not found (ImportError), it automatically installs it using pip.
    - Prints informative messages before and after installation.

    Return Value:
    - None: The function does not return any value. The package will be importable after successful execution.
    """

    import_name = import_name or package_name
    try:
        __import__(import_name)
        return
    except ImportError:
        print(f"⚠️ {import_name} not found, installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"✅ {import_name} installed.")

ensure_package("mysql-connector-python", "mysql.connector")
ensure_package("requests")
ensure_package("python-dotenv", "dotenv")

import mysql.connector
import requests
from dotenv import load_dotenv

# -----------------------
# Charger .env
# -----------------------
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

def log(msg):
    """
    Objective:
    Log a message to the console with a timestamp.

    Parameters:
    - msg: The message string to log. (String, required)

    Process:
    - Prepends the current date and time in the format YYYY-MM-DD HH:MM:SS to the message.
    - Prints the formatted message to the console with immediate flush to ensure real-time output.

    Return Value:
    - None: The function only prints to the console and does not return any value.
    """
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)

# -----------------------
# Variables DB
# -----------------------
ENV = os.getenv("ENV")
DB_HOST = os.getenv("APP_DB_HOST")
DB_USER = os.getenv("APP_DB_USER")
DB_PASSWORD = os.getenv("APP_DB_PASSWORD")
DB_NAME = os.getenv("APP_DB_NAME")

if not all([ENV, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
    log("❌ Some environment variables are missing.")
    sys.exit(1)

if ENV != "production":
    log("❌ This script must be executed in the Docker container (production).")
    sys.exit(1)

DB_PORT = 3306
DB_CONFIG = {
    "host": DB_HOST,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "port": DB_PORT
}

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# -----------------------
# Helpers
# -----------------------
def to_latin1_safe(value):
    """
    Objective:
    Convert a string to a Latin-1 (ISO-8859-1) safe representation.

    Parameters:
    - value: The string to convert. Can be None. (str or None)

    Process:
    - If the input is None, returns None.
    - Otherwise, encodes the string to Latin-1, replacing any characters that cannot be represented in Latin-1 with a placeholder.
    - Decodes the result back to a string in Latin-1.

    Return Value:
    - str or None: The Latin-1-safe version of the input string, or None if input was None.
    """
    if value is None:
        return None
    return value.encode("latin1", errors="replace").decode("latin1")

def safe_overpass_request(query, max_retries=10):
    """
    Objective:
    Safely query the Overpass API with retries in case of failures.

    Parameters:
    - query: The Overpass QL query string to send. (str)
    - max_retries: Maximum number of retry attempts if the request fails. Defaults to 10. (int)

    Process:
    - Sends a GET request to the Overpass API with a timeout of 60 seconds.
    - If the request succeeds, returns the parsed JSON response.
    - If the request fails (network error, timeout, HTTP error), waits 60 seconds and retries.
    - Logs each attempt and any errors encountered.

    Return Value:
    - dict: The JSON response from the Overpass API.

    Raises:
    - Exception: If the API is unavailable after the specified number of retries.
    """
    for attempt in range(1, max_retries + 1):
        try:
            log(f"🔹 Attempt {attempt} for Overpass...")
            response = requests.get(OVERPASS_URL, params={"data": query}, timeout=60)
            response.raise_for_status()
            log(f"✅ Overpass OK ({len(response.text)} characters)")
            return response.json()
        except requests.exceptions.RequestException as e:
            wait = 60
            log(f"⚠️ Overpass error: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    raise Exception("❌ Overpass API unavailable after multiple attempts")

# -----------------------
# Récupération pharmacies
# -----------------------
def get_pharmacies_bbox(min_lat, min_lon, max_lat, max_lon):
    """
    Objective:
    Retrieve pharmacies within a specified geographic bounding box (bbox) from the Overpass API and filter for valid entries in France.

    Parameters:
    - min_lat: Minimum latitude of the bounding box. (float)
    - min_lon: Minimum longitude of the bounding box. (float)
    - max_lat: Maximum latitude of the bounding box. (float)
    - max_lon: Maximum longitude of the bounding box. (float)

    Process:
    - Builds an Overpass QL query to get all nodes tagged as "amenity=pharmacy" within the bbox.
    - Sends the query safely via `safe_overpass_request` with retries.
    - Filters out nodes not located in France (either by `addr:country` or within a rough lat/lon range).
    - Cleans and converts text to Latin-1 safe format.
    - Skips nodes missing essential information (name, latitude, longitude).
    - Logs progress and skipped nodes.

    Return Value:
    - List[dict]: Each dictionary contains `name`, `lat`, `lon`, and `address` for a valid pharmacy.
    """

    log(f"🔹 Retrieving pharmacies in bbox ({min_lat},{min_lon},{max_lat},{max_lon})")
    query = f"""
    [out:json][timeout:60];
    node["amenity"="pharmacy"]({min_lat},{min_lon},{max_lat},{max_lon});
    out body;
    """
    data = safe_overpass_request(query)
    pharmacies = []

    def is_in_france(lat, lon):
        return 41.0 <= lat <= 51.0 and -5.0 <= lon <= 9.0

    for i, node in enumerate(data.get("elements", []), start=1):
        tags = node.get("tags", {})
        country = tags.get("addr:country")
        lat = node.get("lat")
        lon = node.get("lon")

        if country != "FR" and not is_in_france(lat, lon):
            log(f"  ⏭️ Node {i} skipped (not in France)")
            continue

        name = to_latin1_safe(tags.get("name", "").strip())
        address = to_latin1_safe(tags.get("addr:full") or f"{tags.get('addr:street','')} {tags.get('addr:housenumber','')}".strip())

        if not name or not lat or not lon:
            log(f"  ⏭️ Node {i} skipped (missing information)")
            continue

        pharmacies.append({"name": name, "lat": lat, "lon": lon, "address": address})
        log(f"  🔸 Node {i}: {name} ({lat},{lon}) / {address}")

    log(f"🔹 Total valid pharmacies: {len(pharmacies)}")
    return pharmacies

# -----------------------
# Vérifier doublons par latitude/longitude float avec epsilon
# -----------------------
def is_duplicate(cursor, lat, lon, epsilon=1e-4):
    """
    Objective:
    Check if a pharmacy/distributor already exists in the database based on approximate latitude and longitude.

    Parameters:
    - cursor: A database cursor for executing SQL queries. (DB cursor)
    - lat: Latitude of the pharmacy to check. (float)
    - lon: Longitude of the pharmacy to check. (float)
    - epsilon: Tolerance for latitude/longitude comparison. Defaults to 0.0001 (~11 meters). (float)

    Process:
    - Executes a SQL query on the `distributeurs` table to find any entry where the absolute difference 
    between stored and given latitude/longitude is less than `epsilon`.
    - Helps prevent inserting duplicate entries for nearby locations.

    Return Value:
    - bool: True if a duplicate exists, False otherwise.
    """
    cursor.execute(
        "SELECT id FROM distributeurs WHERE ABS(latitude - %s) < %s AND ABS(longitude - %s) < %s",
        (lat, epsilon, lon, epsilon)
    )
    return cursor.fetchone() is not None

# -----------------------
# Insertion DB corrigée
# -----------------------
def insert_into_db(pharmacies, cursor=None, conn=None):
    """
    Objective:
    Insert a list of pharmacies into the database, avoiding duplicates based on latitude and longitude.

    Parameters:
    - pharmacies: List of dictionaries, each containing 'name', 'lat', 'lon', and 'address' keys. (List[Dict])
    - cursor: Optional database cursor to reuse an existing connection. (DB cursor)
    - conn: Optional database connection to reuse. If not provided, a new connection is created. (DB connection)

    Process:
    - Establishes a new database connection if one is not provided.
    - Iterates through the list of pharmacies.
    - Checks each pharmacy for duplicates using approximate latitude/longitude comparison.
    - Inserts the pharmacy into the `distributors` table if no duplicate exists.
    - Commits changes to the database.
    - Logs inserted pharmacies and skipped duplicates.

    Return Value:
    - int: Number of pharmacies successfully inserted into the database.
    """

    log("🔹 Database connection...")
    close_conn = False
    inserted_count = 0

    try:
        if conn is None:
            conn = mysql.connector.connect(**DB_CONFIG)
            cursor = conn.cursor()
            close_conn = True

        for ph in pharmacies:
            if not is_duplicate(cursor, ph["lat"], ph["lon"]):
                cursor.execute(
                    "INSERT INTO distributors (name, latitude, longitude, address) VALUES (%s,%s,%s,%s)",
                    (to_latin1_safe(ph["name"]), ph["lat"], ph["lon"], to_latin1_safe(ph["address"]))
                )
                inserted_count += 1
                log(f"    ✅ {ph['name']} inserted")
            else:
                log(f"    ⏭️ {ph['name']} already exists (latitude/longitude float)")

        conn.commit()

    except mysql.connector.Error as e:
        log(f"❌ Database error: {e}")
    finally:
        if close_conn and conn:
            conn.close()

    return inserted_count

# -----------------------
# Main
# -----------------------
def main():
    """
    Objective:
    Iterate over a defined geographic bounding box (latitude 41–51, longitude -5–9) in steps,
    retrieve pharmacies from OpenStreetMap via Overpass API, and insert them into the database.

    Process:
    - Loops through each 1x1 degree bbox within the specified lat/lon range.
    - For each bbox:
        - Fetch pharmacies using `get_pharmacies_bbox`.
        - Insert the retrieved pharmacies into the database with `insert_into_db`.
        - Logs the number of pharmacies inserted or warns if none were found.
        - Retries on errors with a 60-second wait.
    - Maintains a global counter for total pharmacies inserted across all bboxes.
    - Provides detailed logging for progress, errors, and final summary.

    Return Value:
    - None: Function performs database inserts and logging but does not return a value.
    """

    min_lat, max_lat = 41, 51
    min_lon, max_lon = -5, 9
    step = 1

    total_bbox = (max_lat - min_lat) * (max_lon - min_lon)
    current_bbox = 0
    total_inserted = 0  # global counter

    for lat in range(min_lat, max_lat):
        for lon in range(min_lon, max_lon):
            current_bbox += 1
            log(f"\n🔸 Processing bbox {current_bbox}/{total_bbox} ({lat},{lon})")
            while True:
                try:
                    pharmacies = get_pharmacies_bbox(lat, lon, lat + step, lon + step)
                    if pharmacies:
                        inserted_count = insert_into_db(pharmacies)
                        total_inserted += inserted_count
                        log(f"📊 Pharmacies inserted for this bbox: {inserted_count}")
                    else:
                        log("⚠️ No pharmacies found")
                    break
                except Exception as e:
                    log(f"❌ Bbox error ({lat},{lon}): {e}. Retrying in 60s...")
                    time.sleep(60)

    log(f"🎉 Processing completed. Total pharmacies inserted into DB: {total_inserted}")

if __name__ == "__main__":
    main()
