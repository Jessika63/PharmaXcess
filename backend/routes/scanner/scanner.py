from flask import Blueprint, request, jsonify, current_app
import requests
import os
import tempfile
import sys
import json
import time

# OCR
sys.path.append(os.path.join(os.path.dirname(__file__), "../scripts/scanner"))
from extractAll import main

scanner_bp = Blueprint("scanner", __name__, url_prefix="/api/scanner")

# Fichier où l'URL de la Pi est stockée
PI_URL_FILE = "/tmp/pi_ngrok_url.json"

def get_pi_url():
    """
    Récupère l'URL de la Pi depuis le fichier stocké.
    Retourne une URL par défaut si le fichier n'existe pas.
    """
    try:
        if os.path.exists(PI_URL_FILE):
            with open(PI_URL_FILE, 'r') as f:
                data = json.load(f)
            
            url = data.get("url", "").strip()
            if url and url.startswith(('http://', 'https://')):
                print(f"🌐 Using Pi URL from file: {url}")
                return url
            else:
                print(f"⚠️ URL invalide dans le fichier: {url}")
                
        print("⚠️ Fichier URL non trouvé ou invalide, utilisation de l'URL par défaut")
        
    except Exception as e:
        print(f"⚠️ Erreur lecture fichier URL: {e}")
    
    # URL par défaut (fallback)
    default_url = "https://undelineable-bellicose-alannah.ngrok-free.dev"
    print(f"🌐 Using fallback URL: {default_url}")
    return default_url

@scanner_bp.route("/scan", methods=["POST"])
def scan_from_pi():
    try:
        # 0️⃣ Récupère l'URL actuelle de la Pi
        pi_base_url = get_pi_url()
        
        # 1️⃣ doc_type obligatoire
        doc_type = request.form.get("doc_type")
        if doc_type not in ("P", "R", "V"):
            return jsonify({
                "success": False,
                "error": "Invalid or missing doc_type. Use P, R, or V"
            }), 400

        print(f"🖨️ Début scan via Pi: {pi_base_url}")
        
        # 2️⃣ Demande de scan à la Pi - CORRECTION DES ROUTES
        try:
            pi_scan = requests.post(
                f"{pi_base_url}/api/scanner/scan",  # NOTE: /api/scanner/scan
                data={"doc_type": doc_type}, 
                timeout=120  # Scanner peut être long
            )
            pi_scan.raise_for_status()
            pi_data = pi_scan.json()
            
            print(f"✅ Réponse Pi: {pi_data}")
            
        except requests.exceptions.Timeout:
            return jsonify({
                "success": False, 
                "error": "Timeout connecting to Pi scanner (2 minutes)"
            }), 504
        except requests.exceptions.ConnectionError:
            return jsonify({
                "success": False, 
                "error": f"Cannot connect to Pi scanner at {pi_base_url}"
            }), 502
        except Exception as e:
            return jsonify({
                "success": False, 
                "error": f"Error calling Pi scanner: {str(e)}"
            }), 500

        if not pi_data.get("success"):
            return jsonify({
                "success": False,
                "error": f"Pi scanner failed: {pi_data.get('error', 'unknown')}"
            }), 500

        filename = pi_data.get("file")
        if not filename:
            return jsonify({
                "success": False, 
                "error": "Pi did not return filename"
            }), 500

        # 3️⃣ Récupération de l'image - CORRECTION DES ROUTES
        try:
            print(f"📥 Téléchargement image: {filename}")
            img_res = requests.get(
                f"{pi_base_url}/api/scans/{filename}",  # NOTE: /api/scans/
                timeout=30
            )
            img_res.raise_for_status()
            print(f"✅ Image téléchargée: {len(img_res.content)} bytes")
            
        except Exception as e:
            return jsonify({
                "success": False, 
                "error": f"Failed to download scanned image: {str(e)}"
            }), 500

        # 4️⃣ Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(img_res.content)
            tmp_path = tmp.name
            print(f"💾 Fichier temporaire: {tmp_path}")

        # 5️⃣ OCR centralisé
        try:
            print("🔍 Début OCR...")
            ocr_result = main(
                tmp_path,
                doc_type,
                from_base64=False,
                flip_horizontal=False
            )
            print(f"✅ OCR terminé: {ocr_result.get('success', False)}")
            
        except Exception as e:
            return jsonify({
                "success": False, 
                "error": f"OCR processing failed: {str(e)}"
            }), 500
        finally:
            # Supprime le fichier temporaire
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                print(f"🗑️ Fichier temporaire supprimé")

        # 6️⃣ Retour au front
        return jsonify(ocr_result)

    except Exception as e:
        current_app.logger.error(f"Scanner error: {str(e)}")
        return jsonify({
            "success": False, 
            "error": f"Unexpected server error: {str(e)}"
        }), 500


# Route pour vérifier l'URL actuelle (optionnel)
@scanner_bp.route("/pi_info", methods=["GET"])
def pi_info():
    """Retourne l'URL actuelle de la Pi"""
    pi_url = get_pi_url()
    return jsonify({
        "success": True,
        "pi_url": pi_url,
        "timestamp": time.time()
    })