import os
import subprocess
import threading
import time
import tempfile
from datetime import datetime
from threading import Lock
from flask import Flask, jsonify, send_file, Response, request, send_from_directory
from flask_cors import CORS
import signal
import io
from PIL import Image, ImageDraw

# ==================== CONFIGURATION GLOBALE ====================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Port unique
PORT = 5000

# -------- Scanner config --------
SCAN_DIR = os.path.join(os.getcwd(), "scans")
os.makedirs(SCAN_DIR, exist_ok=True)
SCANIMAGE_BIN = "/usr/bin/scanimage"
DEVICE = "pixma:04A91913_5BA68E"
scan_lock = Lock()

# -------- Camera config --------
camera_lock = threading.Lock()
is_streaming = False
streaming_thread = None
streaming_stop_flag = threading.Event()
current_frame = None
current_frame_lock = threading.Lock()

# ==================== FONCTIONS CAMERA ====================
def kill_camera_processes():
    """Tuer tous les processus camera"""
    try:
        subprocess.run(["pkill", "-9", "-f", "rpicam"], timeout=2)
    except:
        pass
    time.sleep(0.5)


def capture_single_photo():
    """Capturer une seule photo rapidement"""
    try:
        tmp_path = tempfile.mktemp(suffix='.jpg')
        
        cmd = [
            "rpicam-still",
            "-o", tmp_path,
            "--width", "720",
            "--height", "720",
            "-n",
            "--timeout", "5",
            "--quality", "85",
            "--shutter", "18000"
        ]
        
        result = subprocess.run(cmd, capture_output=True, timeout=3)
        
        if result.returncode == 0 and os.path.exists(tmp_path):
            with open(tmp_path, 'rb') as f:
                photo_data = f.read()
            
            os.unlink(tmp_path)
            
            if len(photo_data) > 1000:
                return photo_data
        
        return None
        
    except Exception as e:
        print(f"⚠️ Erreur capture photo: {e}")
        return None

def streaming_worker():
    """Worker qui capture des photos en continu"""
    global current_frame
    
    print("📸 Démarrage capture photos rapides (10 FPS)")
    
    frame_count = 0
    while not streaming_stop_flag.is_set():
        try:
            # Capturer une photo
            frame_start = time.time()
            photo_data = capture_single_photo()
            
            if photo_data:
                with current_frame_lock:
                    current_frame = photo_data
                frame_count += 1
                
                if frame_count % 30 == 0:
                    print(f"📸 {frame_count} frames capturées")
            
            # Calculer le temps à attendre pour maintenir ~10 FPS
            elapsed = time.time() - frame_start
            sleep_time = max(0.066 - elapsed, 0.01)  # 15ms pour ~15 FPS
            
            time.sleep(sleep_time)
            
        except Exception as e:
            print(f"⚠️ Erreur worker streaming: {e}")
            time.sleep(0.1)

def start_camera_stream():
    global is_streaming, streaming_thread, streaming_stop_flag
    
    with camera_lock:
        if is_streaming:
            return True
        
        kill_camera_processes()
        streaming_stop_flag.clear()
        
        # Démarrer le thread de streaming
        streaming_thread = threading.Thread(target=streaming_worker, daemon=True)
        streaming_thread.start()
        
        is_streaming = True
        print("✅ Streaming photo démarré")
        return True

def stop_camera_stream():
    global is_streaming, streaming_thread, streaming_stop_flag
    
    with camera_lock:
        if not is_streaming:
            return
        
        streaming_stop_flag.set()
        
        if streaming_thread and streaming_thread.is_alive():
            streaming_thread.join(timeout=2)
        
        kill_camera_processes()
        is_streaming = False
        
        with current_frame_lock:
            current_frame = None
        
        print("✅ Streaming photo arrêté")

# ==================== ROUTES CAMERA ====================
@app.route("/api/camera/status", methods=["GET"])
def camera_status():
    """Statut de la caméra"""
    return jsonify({
        "status": "streaming" if is_streaming else "ready",
        "streaming": is_streaming,
        "fps": "10",
        "resolution": "1280x720",
        "mode": "photo-rapide"
    })

@app.route("/api/camera/start_stream", methods=["POST"])
def camera_start_stream():
    """Démarrer le flux photo rapide"""
    if start_camera_stream():
        return jsonify({"success": True, "message": "Photo streaming started"})
    return jsonify({"success": False, "error": "Failed to start streaming"}), 500

@app.route("/api/camera/stop_stream", methods=["POST"])
def camera_stop_stream():
    """Arrêter le flux"""
    stop_camera_stream()
    return jsonify({"success": True, "message": "Streaming stopped"})

@app.route("/api/camera/stream")
def stream():
    """Flux MJPEG simulé avec des photos rapides"""
    def generate():
        last_frame_time = 0
        frame_interval = 0.066  # ~15 FPS
        
        while is_streaming:
            try:
                current_time = time.time()
                
                # Vérifier si on doit envoyer une nouvelle frame
                if current_time - last_frame_time >= frame_interval:
                    with current_frame_lock:
                        if current_frame:
                            frame_data = current_frame
                        else:
                            # Frame par défaut (noire) si aucune photo disponible
                            img = Image.new('RGB', (1280, 720), color='black')
                            draw = ImageDraw.Draw(img)
                            draw.text((50, 50), "Chargement...", fill='white')
                            
                            buf = io.BytesIO()
                            img.save(buf, format='JPEG', quality=85)
                            frame_data = buf.getvalue()
                    
                    if frame_data:
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' 
                               + frame_data + b'\r\n')
                        
                        last_frame_time = current_time
                
                # Petit délai pour éviter de surcharger le CPU
                time.sleep(0.01)
                
            except Exception as e:
                print(f"⚠️ Erreur génération flux: {e}")
                time.sleep(0.1)
    
    return Response(
        generate(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route("/api/camera/capture", methods=["POST"])
def camera_capture():
    """Capturer une photo de haute qualité"""
    tmp_path = None
    
    try:
        tmp_path = tempfile.mktemp(suffix=".jpg")
        
        was_streaming = is_streaming
        if was_streaming:
            # Arrêter temporairement le streaming pour une photo de meilleure qualité
            stop_camera_stream()
            time.sleep(0.5)
        
        cmd = [
            "rpicam-still",
            "-o", tmp_path,
            "--width", "1920",
            "--height", "1080",
            "-n",
            "--timeout", "500",
            "--quality", "95",
            "--shutter", "20000"
        ]
        
        result = subprocess.run(cmd, capture_output=True, timeout=5)
        
        if result.returncode != 0:
            error_msg = result.stderr.decode() if result.stderr else "Unknown error"
            raise Exception(f"rpicam-still error: {error_msg}")
        
        if was_streaming:
            time.sleep(0.5)
            start_camera_stream()
        
        return send_file(tmp_path, mimetype="image/jpeg")
        
    except subprocess.TimeoutExpired:
        return jsonify({"success": False, "error": "Timeout capturing photo"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
        
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except:
                pass

@app.route("/api/camera/snapshot")
def snapshot():
    """Prendre une photo rapide pour le scan QR"""
    try:
        # Arrêter le streaming temporairement pour une capture propre
        was_streaming = is_streaming
        if was_streaming:
            stop_camera_stream()
            time.sleep(0.3)
        
        # Capturer une photo rapide
        photo_data = capture_single_photo()
        
        if not photo_data:
            # Créer une image noire par défaut
            img = Image.new('RGB', (1280, 720), color='black')
            draw = ImageDraw.Draw(img)
            draw.text((100, 100), "Erreur capture", fill='white')
            
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=85)
            photo_data = buf.getvalue()
        
        # Redémarrer le streaming si nécessaire
        if was_streaming:
            time.sleep(0.3)
            start_camera_stream()
        
        # Créer une réponse avec l'image
        return Response(
            photo_data,
            mimetype='image/jpeg',
            headers={
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-cache'
            }
        )
        
    except Exception as e:
        print(f"❌ Erreur snapshot: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== FONCTIONS SCANNER ====================
def scan_document(resolution=150):
    """Fonction de scan"""
    filename = f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    filepath = os.path.join(SCAN_DIR, filename)

    cmd = [
        SCANIMAGE_BIN,
        "-d", DEVICE,
        "--resolution", str(resolution),
        "--format=png"
    ]

    try:
        with open(filepath, "wb") as f:
            subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(e.stderr.decode())

    return filename

# ==================== ROUTES SCANNER ====================
@app.route("/api/scanner/status", methods=["GET"])
def scanner_status():
    """Statut du scanner"""
    return jsonify({
        "status": "ready",
        "last_scan": None
    })

@app.route("/api/scanner/scan", methods=["POST"])
def scanner_scan():
    """Effectuer un scan"""
    if not scan_lock.acquire(blocking=False):
        return jsonify({"success": False, "error": "Scanner occupé"}), 409
    
    try:
        doc_type = request.form.get("doc_type", "P")
        filename = scan_document()
        
        return jsonify({
            "success": True, 
            "file": filename, 
            "doc_type": doc_type,
            "url": f"/api/scans/{filename}"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
        
    finally:
        scan_lock.release()

@app.route("/api/scans/<filename>", methods=["GET"])
def get_scan(filename):
    """Récupérer un scan"""
    return send_from_directory(SCAN_DIR, filename)

# ==================== ROUTES COMMUNES ====================
@app.route("/api/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({
        "status": "OK",
        "service": "scanner-camera",
        "camera": "streaming" if is_streaming else "ready",
        "mode": "photo-rapide",
        "scanner": "ready",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/system/info", methods=["GET"])
def system_info():
    """Informations système"""
    return jsonify({
        "camera_streaming": is_streaming,
        "camera_mode": "photo-rapide",
        "scanner_available": os.path.exists(SCANIMAGE_BIN),
        "scan_dir": SCAN_DIR,
        "port": PORT,
        "host": "0.0.0.0"
    })

# ==================== PAGE D'ACCUEIL ====================
@app.route("/", methods=["GET"])
def index():
    """Page d'accueil avec documentation"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Scanner & Camera Service</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .method { font-weight: bold; color: #007bff; }
            .url { font-family: monospace; background: #eee; padding: 2px 5px; }
            .status { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            .streaming { background: #d4edda; color: #155724; }
            .ready { background: #fff3cd; color: #856404; }
            .test-image { max-width: 640px; border: 2px solid #ccc; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>📷 Scanner & Camera Service (Photo Rapide)</h1>
        
        <div class="endpoint">
            <h3>🎥 Camera Photo Rapide</h3>
            <p>Mode: Photos rapides à ~10 FPS</p>
            <p><span class="method">GET</span> <span class="url">/api/camera/status</span> - Statut caméra</p>
            <p><span class="method">POST</span> <span class="url">/api/camera/start_stream</span> - Démarrer flux</p>
            <p><span class="method">POST</span> <span class="url">/api/camera/stop_stream</span> - Arrêter flux</p>
            <p><span class="method">GET</span> <span class="url">/api/camera/stream</span> - Flux MJPEG</p>
            <p><span class="method">GET</span> <span class="url">/api/camera/snapshot</span> - Photo rapide pour QR</p>
            <p><span class="method">POST</span> <span class="url">/api/camera/capture</span> - Capture photo HQ</p>
            
            <div style="margin-top: 10px;">
                <button onclick="startStream()">Démarrer Flux</button>
                <button onclick="stopStream()">Arrêter Flux</button>
                <button onclick="takeSnapshot()">Prendre Photo</button>
            </div>
            
            <div>
                <h4>Flux Live:</h4>
                <img id="streamView" class="test-image" />
                
                <h4>Dernière Photo:</h4>
                <img id="snapshotView" class="test-image" />
            </div>
        </div>
        
        <div class="endpoint">
            <h3>📄 Scanner</h3>
            <p><span class="method">GET</span> <span class="url">/api/scanner/status</span> - Statut scanner</p>
            <p><span class="method">POST</span> <span class="url">/api/scanner/scan</span> - Effectuer un scan</p>
            <p><span class="method">GET</span> <span class="url">/api/scans/&lt;filename&gt;</span> - Récupérer scan</p>
        </div>
        
        <h2>Statut actuel:</h2>
        <p>Caméra: <span id="cameraStatus" class="status ready">Arrêté</span></p>
        <p>Scanner: <span class="status ready">Prêt</span></p>
        
        <script>
            function updateStatus() {
                fetch('/api/health')
                    .then(r => r.json())
                    .then(data => {
                        const statusEl = document.getElementById('cameraStatus');
                        statusEl.textContent = data.camera === 'streaming' ? 'En cours' : 'Arrêté';
                        statusEl.className = 'status ' + (data.camera === 'streaming' ? 'streaming' : 'ready');
                        
                        // Mettre à jour le flux si en cours
                        if (data.camera === 'streaming') {
                            document.getElementById('streamView').src = '/api/camera/stream?t=' + Date.now();
                        } else {
                            document.getElementById('streamView').src = '';
                        }
                    });
            }
            
            function startStream() {
                fetch('/api/camera/start_stream', { method: 'POST' })
                    .then(r => r.json())
                    .then(data => {
                        alert(data.message || 'Stream démarré');
                        updateStatus();
                    });
            }
            
            function stopStream() {
                fetch('/api/camera/stop_stream', { method: 'POST' })
                    .then(r => r.json())
                    .then(data => {
                        alert(data.message || 'Stream arrêté');
                        updateStatus();
                    });
            }
            
            function takeSnapshot() {
                document.getElementById('snapshotView').src = '/api/camera/snapshot?t=' + Date.now();
            }
            
            // Initialiser
            updateStatus();
            setInterval(updateStatus, 5000);
        </script>
    </body>
    </html>
    """
    return html

# ==================== LANCEMENT ====================
if __name__ == "__main__":
    print("=" * 60)
    print("📸 Service Scanner & Camera (Mode Photo Rapide)")
    print("=" * 60)
    print(f"📡 URL: http://0.0.0.0:{PORT}")
    print(f"📸 Flux caméra: http://0.0.0.0:{PORT}/api/camera/stream")
    print(f"📸 Snapshot rapide: http://0.0.0.0:{PORT}/api/camera/snapshot")
    print(f"📄 Scan: POST http://0.0.0.0:{PORT}/api/scanner/scan")
    print(f"📊 Health: http://0.0.0.0:{PORT}/api/health")
    print("=" * 60)
    print("Mode: Photos rapides à ~10-15 FPS")
    print("Résolution: 1280x720")
    print("=" * 60)
    
    # Vérifier rpicam-still
    try:
        subprocess.run(["rpicam-still", "--help"], capture_output=True, timeout=2)
        print("✅ rpicam-still disponible")
    except:
        print("⚠️ rpicam-still non disponible, installé avec:")
        print("   sudo apt update && sudo apt install -y libraspberrypi-bin")
    
    # Vérifier scanimage
    if os.path.exists(SCANIMAGE_BIN):
        print("✅ scanimage disponible")
    else:
        print("⚠️ scanimage non trouvé à", SCANIMAGE_BIN)
    
    app.run(host="0.0.0.0", port=PORT, threaded=True, debug=False)