import sys
import json
import requests

API_URL = "http://localhost:5000/add_list_doctors"

def send_json_to_api(json_file_path):
    """
    Lit un fichier JSON et envoie son contenu à l'API.
    """
    try:
        # Lire le fichier JSON
        with open(json_file_path, mode='r', encoding='utf-8') as file:
            data = json.load(file)

        # Vérifier que les données sont bien au format attendu
        if not isinstance(data, dict) or "doctors" not in data:
            print("Le fichier JSON doit contenir un objet avec une clé 'doctors'.")
            return

        # Envoyer les données à l'API
        try:
            response = requests.post(API_URL, json=data)

            if response.status_code == 201:
                print("Succès: Les données ont été ajoutées avec succès.")
            else:
                print(f"Erreur lors de l'envoi des données: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"Erreur de connexion à l'API: {e}")

    except FileNotFoundError:
        print(f"Fichier JSON non trouvé : {json_file_path}")
    except json.JSONDecodeError:
        print(f"Erreur : Le fichier {json_file_path} n'est pas un fichier JSON valide.")
    except Exception as e:
        print(f"Erreur inattendue : {e}")

if __name__ == "__main__":
    # Vérifier si un fichier JSON a été fourni en argument
    if len(sys.argv) != 2:
        print("Usage : python3 fillDBWithFile.py file.json")
    else:
        json_file_path = sys.argv[1]
        send_json_to_api(json_file_path)
