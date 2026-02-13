#!/usr/bin/env python3
"""
Script de test manuel pour ngrok et l'app mobile
Permet de déboguer étape par étape le lancement de ngrok et Expo
"""

import os
import subprocess
import sys
import time
import requests
import shutil
import datetime

# Version simplifiée de colored_print pour éviter les dépendances
def colored_print(message, color):
    """Version simplifiée de colored_print sans dépendances"""
    colors = {
        "red": "\033[91m",
        "yellow": "\033[93m",
        "green": "\033[92m",
        "blue": "\033[94m",
        "violet": "\033[95m",
        "reset": "\033[0m",
    }
    
    prefixes = {
        "red": "[ERROR]: ",
        "yellow": "[WARNING]: ",
        "green": "[SUCCESS]: ",
        "blue": "[INFO]: ",
        "violet": "[DEBUG]: ",
    }
    
    prefix = prefixes.get(color, "")
    color_code = colors.get(color, colors["reset"])
    reset_code = colors["reset"]
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"{color_code}[{timestamp}] {prefix}{message}{reset_code}")

def read_env_variable(env_path, var_name):
    """Lit une variable du fichier .env"""
    try:
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith(f'{var_name}='):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    except Exception as e:
        colored_print(f"Erreur lecture {var_name}: {e}", "red")
    return None

def check_backend_health():
    """Vérifie si le backend répond"""
    colored_print("\n🔍 Étape 1: Vérification du backend sur localhost:5000", "blue")
    try:
        response = requests.get('http://localhost:5000/', timeout=5)
        colored_print(f"  Status code: {response.status_code}", "green")
        colored_print(f"  Response: {response.json()}", "green")
        return True
    except requests.ConnectionError:
        colored_print("  ❌ Backend non accessible - Assurez-vous de lancer --back d'abord", "red")
        return False
    except Exception as e:
        colored_print(f"  ⚠️ Erreur: {e}", "yellow")
        return False

def setup_ngrok_manual(mobile_app_folder):
    """Configure et démarre ngrok manuellement"""
    colored_print("\n🔧 Étape 2: Configuration de ngrok", "blue")
    
    env_path = os.path.join(mobile_app_folder, '.env')
    ngrok_token = read_env_variable(env_path, 'NGROK_TOKEN')
    
    if not ngrok_token:
        colored_print("  ❌ Token ngrok non trouvé dans .env", "red")
        return None
    
    colored_print(f"  ✓ Token ngrok trouvé: {ngrok_token[:20]}...", "green")
    
    # Vérifier ngrok
    ngrok_path = shutil.which("ngrok") or shutil.which("ngrok.cmd")
    if not ngrok_path:
        colored_print("  ❌ Ngrok introuvable dans le PATH", "red")
        return None
    
    colored_print(f"  ✓ Ngrok trouvé: {ngrok_path}", "green")
    
    # Authentification
    colored_print("\n  🔑 Authentification ngrok...", "blue")
    try:
        result = subprocess.run([ngrok_path, "authtoken", ngrok_token], 
                              check=True, capture_output=True, text=True)
        colored_print("  ✓ Authentification réussie", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"  ❌ Erreur authentification: {e.stderr}", "red")
        return None
    
    # Démarrage du tunnel vers le BACKEND Flask (port 5000)
    colored_print("\n  🚀 Démarrage du tunnel ngrok vers Flask (port 5000)...", "blue")
    colored_print("  Command: ngrok http 5000", "violet")
    
    try:
        ngrok_process = subprocess.Popen(
            [ngrok_path, "http", "http://localhost:5000", "--log=stdout"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        colored_print(f"  ✓ Processus ngrok lancé (PID: {ngrok_process.pid})", "green")
        
        # Attendre que ngrok soit prêt
        colored_print("\n  ⏳ Attente de ngrok (5 secondes)...", "blue")
        time.sleep(5)
        
        # Récupérer l'URL du tunnel via l'API ngrok
        colored_print("\n  🔍 Récupération de l'URL du tunnel...", "blue")
        try:
            response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
            if response.status_code == 200:
                tunnels = response.json().get("tunnels", [])
                colored_print(f"  ℹ️  Tunnels trouvés: {len(tunnels)}", "violet")
                
                for tunnel in tunnels:
                    proto = tunnel.get("proto")
                    public_url = tunnel.get("public_url")
                    colored_print(f"    - {proto}: {public_url}", "violet")
                    
                    if proto == "https":
                        colored_print(f"\n  ✅ Tunnel HTTPS actif: {public_url}", "green")
                        return public_url, ngrok_process
                
                colored_print("  ⚠️ Aucun tunnel HTTPS trouvé", "yellow")
            else:
                colored_print(f"  ❌ Erreur API ngrok: {response.status_code}", "red")
        except requests.ConnectionError:
            colored_print("  ❌ API ngrok non accessible sur localhost:4040", "red")
        except Exception as e:
            colored_print(f"  ❌ Erreur: {e}", "red")
            
    except Exception as e:
        colored_print(f"  ❌ Erreur démarrage ngrok: {e}", "red")
        return None
    
    return None

def test_ngrok_tunnel(ngrok_url):
    """Teste si le tunnel ngrok fonctionne"""
    colored_print(f"\n🧪 Étape 3: Test du tunnel ngrok", "blue")
    colored_print(f"  URL à tester: {ngrok_url}", "violet")
    
    try:
        colored_print("  ⏳ Requête GET vers ngrok_url/...", "blue")
        response = requests.get(f"{ngrok_url}/", timeout=10)
        colored_print(f"  ✅ Status: {response.status_code}", "green")
        colored_print(f"  Response: {response.text[:200]}", "green")
        return True
    except requests.ConnectionError as e:
        colored_print(f"  ❌ Erreur de connexion: {e}", "red")
        return False
    except requests.Timeout:
        colored_print("  ❌ Timeout - le backend ne répond pas via ngrok", "red")
        return False
    except Exception as e:
        colored_print(f"  ❌ Erreur: {e}", "red")
        return False

def update_env_file(mobile_app_folder, ngrok_url):
    """Met à jour le .env avec l'URL ngrok"""
    colored_print(f"\n📝 Étape 4: Mise à jour du .env", "blue")
    
    env_path = os.path.join(mobile_app_folder, '.env')
    
    try:
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        updated_lines = []
        found = False
        
        for line in lines:
            if line.startswith('EXPO_PUBLIC_NGROK_BACKEND_URL='):
                updated_lines.append(f'EXPO_PUBLIC_NGROK_BACKEND_URL={ngrok_url}\n')
                found = True
                colored_print(f"  ✓ Ligne EXPO_PUBLIC_NGROK_BACKEND_URL mise à jour", "green")
            else:
                updated_lines.append(line)
        
        if not found:
            updated_lines.append(f'\nEXPO_PUBLIC_NGROK_BACKEND_URL={ngrok_url}\n')
            colored_print(f"  ✓ Ligne EXPO_PUBLIC_NGROK_BACKEND_URL ajoutée", "green")
        
        with open(env_path, 'w') as f:
            f.writelines(updated_lines)
        
        colored_print(f"  ✅ Fichier .env mis à jour: {ngrok_url}", "green")
        return True
        
    except Exception as e:
        colored_print(f"  ❌ Erreur: {e}", "red")
        return False

def launch_expo(mobile_app_folder, tunnel_mode=False):
    """Lance Expo"""
    colored_print(f"\n🚀 Étape 5: Lancement d'Expo", "blue")
    
    os.chdir(mobile_app_folder)
    colored_print(f"  📁 Dossier: {os.getcwd()}", "violet")
    
    if tunnel_mode:
        command = ["npx", "expo", "start", "--tunnel"]
        colored_print("  Command: npx expo start --tunnel", "violet")
    else:
        command = ["npm", "start"]
        colored_print("  Command: npm start", "violet")
    
    colored_print("\n  ⚠️  Expo va démarrer maintenant...", "yellow")
    colored_print("  ⚠️  Pour arrêter: Ctrl+C", "yellow")
    colored_print("  ⚠️  Le processus ngrok continuera en arrière-plan", "yellow")
    
    try:
        time.sleep(2)
        subprocess.run(command)
    except KeyboardInterrupt:
        colored_print("\n\n  🛑 Expo arrêté par l'utilisateur", "yellow")
    except Exception as e:
        colored_print(f"\n  ❌ Erreur: {e}", "red")

def main():
    """Fonction principale"""
    print("="*60)
    colored_print("🧪 TEST MANUEL NGROK + APP MOBILE", "green")
    print("="*60)
    
    # Dossier de l'app mobile
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    mobile_app_folder = os.path.join(project_root, 'pharmaXcess_app')
    
    colored_print(f"\n📁 Projet: {project_root}", "violet")
    colored_print(f"📁 App mobile: {mobile_app_folder}", "violet")
    
    # Étape 1: Vérifier le backend
    if not check_backend_health():
        colored_print("\n❌ Impossible de continuer sans backend", "red")
        colored_print("   Lancez d'abord: python launch.py --back", "yellow")
        return
    
    # Étape 2: Configurer et démarrer ngrok
    result = setup_ngrok_manual(mobile_app_folder)
    if not result:
        colored_print("\n❌ Échec de la configuration ngrok", "red")
        return
    
    ngrok_url, ngrok_process = result
    
    # Étape 3: Tester le tunnel
    if not test_ngrok_tunnel(ngrok_url):
        colored_print("\n⚠️  Le tunnel ngrok ne fonctionne pas correctement", "yellow")
        colored_print("   Mais on continue quand même...", "yellow")
    
    # Étape 4: Mettre à jour le .env
    if not update_env_file(mobile_app_folder, ngrok_url):
        colored_print("\n❌ Échec de la mise à jour du .env", "red")
        return
    
    # Étape 5: Lancer Expo
    colored_print("\n" + "="*60, "green")
    colored_print("✅ Ngrok configuré et fonctionnel!", "green")
    colored_print(f"✅ URL: {ngrok_url}", "green")
    colored_print("="*60 + "\n", "green")
    
    launch_expo(mobile_app_folder, tunnel_mode=True)
    
    # Nettoyage
    colored_print("\n\n🧹 Nettoyage...", "blue")
    if ngrok_process and ngrok_process.poll() is None:
        colored_print("  Arrêt du processus ngrok...", "yellow")
        ngrok_process.terminate()
        try:
            ngrok_process.wait(timeout=5)
            colored_print("  ✓ Ngrok arrêté", "green")
        except subprocess.TimeoutExpired:
            ngrok_process.kill()
            colored_print("  ✓ Ngrok forcé à s'arrêter", "yellow")
    
    colored_print("\n✅ Test terminé", "green")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        colored_print("\n\n🛑 Script interrompu par l'utilisateur", "yellow")
        sys.exit(0)
