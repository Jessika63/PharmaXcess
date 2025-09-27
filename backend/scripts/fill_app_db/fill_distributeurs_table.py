
import os
import sys
import subprocess
import time
import mysql.connector
import requests
from dotenv import load_dotenv

# -----------------------
# Installation dépendances
# -----------------------
def ensure_package(package_name, import_name=None):
    import_name = import_name or package_name
    try:
        __import__(import_name)
        return
    except ImportError:
        print(f"⚠️ {import_name} non trouvé, installation en cours...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"✅ {import_name} installé.")

ensure_package("mysql-connector-python", "mysql.connector")
ensure_package("requests")
ensure_package("python-dotenv", "dotenv")

# -----------------------
# Charger .env
# -----------------------
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

def log(msg):
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
    log("❌ Certaines variables d'environnement sont manquantes.")
    sys.exit(1)

if ENV != "production":
    log("❌ Ce script doit être exécuté dans le conteneur Docker (production).")
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
    if value is None:
        return None
    return value.encode("latin1", errors="replace").decode("latin1")

def safe_overpass_request(query, max_retries=10):
    for attempt in range(1, max_retries + 1):
        try:
            log(f"🔹 Tentative {attempt} pour Overpass...")
            response = requests.get(OVERPASS_URL, params={"data": query}, timeout=60)
            response.raise_for_status()
            log(f"✅ Overpass OK ({len(response.text)} caractères)")
            return response.json()
        except requests.exceptions.RequestException as e:
            wait = 60
            log(f"⚠️ Erreur Overpass : {e}. Nouvelle tentative dans {wait}s...")
            time.sleep(wait)
    raise Exception("❌ Overpass API non disponible après plusieurs tentatives")

# -----------------------
# Récupération pharmacies
# -----------------------
def get_pharmacies_bbox(min_lat, min_lon, max_lat, max_lon):
    log(f"🔹 Récupération pharmacies bbox ({min_lat},{min_lon},{max_lat},{max_lon})")
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
            log(f"  ⏭️ Node {i} ignoré (not in France)")
            continue

        name = to_latin1_safe(tags.get("name", "").strip())
        address = to_latin1_safe(tags.get("addr:full") or f"{tags.get('addr:street','')} {tags.get('addr:housenumber','')}".strip())

        if not name or not lat or not lon or not address:
            log(f"  ⏭️ Node {i} ignoré (infos manquantes)")
            continue

        pharmacies.append({"nom": name, "lat": lat, "lon": lon, "adresse": address})
        log(f"  🔸 Node {i}: {name} ({lat},{lon}) / {address}")

    log(f"🔹 Total pharmacies valides: {len(pharmacies)}")
    return pharmacies

# -----------------------
# Vérifier doublons par latitude/longitude float avec epsilon
# -----------------------
def is_duplicate(cursor, lat, lon, epsilon=1e-4):
    cursor.execute(
        "SELECT id FROM distributeurs WHERE ABS(latitude - %s) < %s AND ABS(longitude - %s) < %s",
        (lat, epsilon, lon, epsilon)
    )
    return cursor.fetchone() is not None

# -----------------------
# Insertion DB corrigée
# -----------------------
def insert_into_db(pharmacies):
    log("🔹 Connexion DB...")
    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        inserted_count = skipped_count = 0

        for ph in pharmacies:
            if not is_duplicate(cursor, ph["lat"], ph["lon"]):
                cursor.execute(
                    "INSERT INTO distributeurs (nom, latitude, longitude, adresse) VALUES (%s,%s,%s,%s)",
                    (to_latin1_safe(ph["nom"]), ph["lat"], ph["lon"], to_latin1_safe(ph["adresse"]))
                )
                inserted_count += 1
                log(f"    ✅ {ph['nom']} inséré")
            else:
                skipped_count += 1
                log(f"    ⏭️ {ph['nom']} déjà présent (latitude/longitude float)")

        conn.commit()
        log(f"📊 Résumé: {inserted_count} insérés, {skipped_count} déjà présents")

    except mysql.connector.Error as e:
        log(f"❌ Erreur DB: {e}")
    finally:
        if conn:
            conn.close()

# -----------------------
# Main
# -----------------------
def main():
    min_lat, max_lat = 41, 51
    min_lon, max_lon = -5, 9
    step = 1

    total_bbox = (max_lat - min_lat) * (max_lon - min_lon)
    current_bbox = 0

    for lat in range(min_lat, max_lat):
        for lon in range(min_lon, max_lon):
            current_bbox += 1
            log(f"\n🔸 Traitement bbox {current_bbox}/{total_bbox} ({lat},{lon})")
            while True:
                try:
                    pharmacies = get_pharmacies_bbox(lat, lon, lat + step, lon + step)
                    if pharmacies:
                        insert_into_db(pharmacies)
                    else:
                        log("⚠️ Aucune pharmacie trouvée")
                    break
                except Exception as e:
                    log(f"❌ Erreur bbox ({lat},{lon}): {e}. Nouvelle tentative dans 60s...")
                    time.sleep(60)

    log("🎉 Traitement terminé")

if __name__ == "__main__":
    main()
