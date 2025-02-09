import sys
import json
import csv
import requests
import unicodedata

API_URL = "http://localhost:5000/add_list_doctors"
BATCH_SIZE = 180  # Taille du lot

def validate_row(row):
    """
    Vérifie si une ligne du CSV contient toutes les informations requises.
    """
    required_fields = [
        "Prénom d'exercice",
        "Nom d'exercice",
        "Identifiant PP",
        "Libellé profession",
        "Bureau cedex (coord. structure)"
    ]
    return all(row.get(field, "").strip() for field in required_fields)

def clean_text(value):
    """
    Nettoie un texte en supprimant les caractères non valides ou spéciaux.
    """
    if not value:
        return ""
    value = unicodedata.normalize("NFKC", value)
    value = value.encode('utf-8', 'ignore').decode('utf-8').strip()
    return "".join(c for c in value if c.isprintable())

def process_csv(csv_path):
    """
    Lit un fichier CSV et prépare les données sous forme de lots.
    """
    doctors = []
    try:
        with open(csv_path, mode='r', encoding='utf-8', errors='replace') as file:
            csv_reader = csv.DictReader(file, delimiter='|')
            for row in csv_reader:
                if validate_row(row):
                    doctors.append({
                        "first_name": clean_text(row["Prénom d'exercice"]),
                        "last_name": clean_text(row["Nom d'exercice"]),
                        "rpps": clean_text(row["Identifiant PP"]),
                        "sector": clean_text(row["Libellé profession"]),
                        "region": clean_text(row["Bureau cedex (coord. structure)"]),
                    })
                    if len(doctors) == BATCH_SIZE:
                        yield doctors
                        doctors = []
        if doctors:
            yield doctors
    except FileNotFoundError:
        print(f"Erreur : Fichier {csv_path} introuvable.")
    except Exception as e:
        print(f"Erreur inattendue lors du traitement du CSV : {e}")

def process_json(json_path):
    """
    Lit un fichier JSON et prépare les données sous forme de liste.
    """
    try:
        with open(json_path, mode='r', encoding='utf-8') as file:
            data = json.load(file)
        if not isinstance(data, dict) or "doctors" not in data:
            print("Le fichier JSON doit contenir une clé 'doctors'.")
            return []
        return data["doctors"]
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Erreur avec le fichier JSON : {e}")
        return []

def send_data_to_api(doctors):
    """
    Envoie un lot de médecins à l'API.
    """
    if not doctors:
        print("Erreur : Aucun médecin à envoyer.")
        return
    payload = {"doctors": doctors}
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 201:
            print("Succès : Les données ont été envoyées à l'API.")
        else:
            print(f"Erreur API : {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion à l'API : {e}")

def main(file_path):
    """
    Détecte le type de fichier et envoie les données correspondantes à l'API.
    """
    if file_path.endswith(".json"):
        doctors = process_json(file_path)
        send_data_to_api(doctors)
    elif file_path.endswith(".csv") or file_path.endswith(".txt"):
        for batch in process_csv(file_path):
            send_data_to_api(batch)
    else:
        print("Format non supporté. Utilisez un fichier JSON ou CSV.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage : python3 fillDBWithFile.py <file_path>")
    else:
        main(sys.argv[1])
