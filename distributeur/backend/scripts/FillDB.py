import csv
import json
import requests
import unicodedata

# URL de l'API
API_URL = "http://localhost:5000/add_list_doctors"
BATCH_SIZE = 180  # Taille du lot

def validate_row(row):
    """
    Valide qu'une ligne contient toutes les informations nécessaires.
    """
    required_fields = [
        "Prénom d'exercice",
        "Nom d'exercice",
        "Identifiant PP",
        "Libellé profession",
        "Bureau cedex (coord. structure)"
    ]
    for field in required_fields:
        if not row.get(field, "").strip():
            return False
    return True

def clean_text(value):
    """
    Nettoie un texte en supprimant les caractères non valides ou spéciaux.
    """
    if not value:
        return ""
    # Normalisation Unicode pour éviter les caractères combinés
    value = unicodedata.normalize("NFKC", value)
    # Encodage en UTF-8 sans erreurs, puis décodage
    value = value.encode('utf-8', 'ignore').decode('utf-8').strip()
    # Suppression des caractères non imprimables
    value = "".join(c for c in value if c.isprintable())
    return value

def process_csv_to_batches(csv_path):
    """
    Lit un fichier CSV et produit des lots de données valides.
    """
    doctors = []

    try:
        # Ouverture du fichier CSV
        with open(csv_path, mode='r', encoding='utf-8', errors='replace') as csv_file:
            csv_reader = csv.DictReader(csv_file, delimiter='|')

            for i, row in enumerate(csv_reader):
                if validate_row(row):
                    doctor = {
                        "first_name": clean_text(row["Prénom d'exercice"]),
                        "last_name": clean_text(row["Nom d'exercice"]),
                        "rpps": clean_text(row["Identifiant PP"]),
                        "sector": clean_text(row["Libellé profession"]),
                        "region": clean_text(row["Bureau cedex (coord. structure)"]),
                    }
                    doctors.append(doctor)

                # Si on atteint un lot de 50 médecins, on l'envoie et on vide la liste
                if len(doctors) == BATCH_SIZE:
                    yield doctors
                    doctors = []

        # Retourner les derniers médecins s'il en reste
        if doctors:
            yield doctors

    except FileNotFoundError:
        print(f"Erreur : Le fichier {csv_path} est introuvable.")
    except Exception as e:
        print(f"Erreur inattendue lors du traitement du CSV : {e}")

def send_batch_to_api(batch):
    """
    Envoie un lot de données à l'API spécifiée.
    """
    if not batch:
        print("Erreur : Le lot est vide ou mal formé.")
        return

    payload = {"doctors": batch}
    try:
        # Envoi des données
        response = requests.post(API_URL, json=payload)

        # Gestion de la réponse
        if response.status_code == 201:
            print("Succès : Le lot a été envoyé à l'API avec succès.")
        else:
            print(f"Erreur lors de l'envoi du lot : {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion à l'API : {e}")

def main():
    """
    Point d'entrée principal du script.
    """
    csv_path = './PS_LibreAcces_Personne_activite_202412250857.txt'

    # Traitement du fichier CSV et envoi par lots
    print("Traitement du fichier CSV...")
    for batch in process_csv_to_batches(csv_path):
        print(f"Envoi d'un lot de {len(batch)} médecins...")
        send_batch_to_api(batch)

if __name__ == "__main__":
    main()
