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
camera_process = None
is_streaming = False
frame_buffer = None
frame_buffer_lock = threading.Lock()
last_frame_time = 0

# ==================== FONCTIONS CAMERA ====================
def kill_camera_processes():
    """Tuer tous les processus camera"""
    try:
        subprocess.run(["pkill", "-9", "-f", "rpicam"], timeout=2)
    except:
        pass
    time.sleep(0.5)

def capture_frames_continuously():
    """Capturer des frames en continu avec rpicam-still"""
    global is_streaming, frame_buffer, last_frame_time
    
    print("🚀 Démarrage capture continue avec rpicam-still...")
    
    while is_streaming:
        try:
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                tmp_path = tmp.name
            
            cmd = [
                "rpicam-still",
                "-o", tmp_path,
                "--width", "1280",
                "--height", "720",
                "-n",
                "--timeout", "1",
                "--quality", "80",
                "--shutter", "10000"
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=2)
            
            if result.returncode == 0 and os.path.exists(tmp_path):
                with open(tmp_path, 'rb') as f:
                    frame_data = f.read()
                
                if len(frame_data) > 1000:
                    with frame_buffer_lock:
                        frame_buffer = frame_data
                        last_frame_time = time.time()
                
                os.unlink(tmp_path)
            
            time.sleep(0.1)
            
        except Exception as e:
            print(f"⚠️ Erreur capture frame: {e}")
            time.sleep(0.1)

def start_camera_stream():
    """Démarrer le flux camera"""
    global is_streaming, frame_buffer
    
    with camera_lock:
        if is_streaming:
            return True
        
        try:
            kill_camera_processes()
            time.sleep(1)
            
            frame_buffer = None
            is_streaming = True
            threading.Thread(target=capture_frames_continuously, daemon=True).start()
            
            for _ in range(10):
                if frame_buffer is not None:
                    break
                time.sleep(0.1)
            
            print("✅ Flux camera démarré avec rpicam-still")
            return True
            
        except Exception as e:
            print(f"❌ Erreur démarrage flux: {e}")
            is_streaming = False
            return False

def stop_camera_stream():
    """Arrêter le flux camera"""
    global is_streaming
    
    with camera_lock:
        is_streaming = False
        kill_camera_processes()
        time.sleep(0.5)
        print("✅ Flux camera arrêté")

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

# ==================== ROUTES CAMERA ====================
@app.route("/api/camera/status", methods=["GET"])
def camera_status():
    """Statut de la caméra"""
    return jsonify({
        "status": "streaming" if is_streaming else "ready",
        "streaming": is_streaming,
        "fps": "10",
        "resolution": "1280x720",
        "camera": "rpicam"
    })

@app.route("/api/camera/start_stream", methods=["POST"])
def camera_start_stream():
    """Démarrer le flux camera"""
    if start_camera_stream():
        return jsonify({"success": True, "message": "Stream started"})
    return jsonify({"success": False, "error": "Failed to start stream"}), 500

@app.route("/api/camera/stop_stream", methods=["POST"])
def camera_stop_stream():
    """Arrêter le flux camera"""
    stop_camera_stream()
    return jsonify({"success": True, "message": "Stream stopped"})

@app.route("/api/camera/stream")
def camera_stream():
    """Flux MJPEG"""
    
    def generate():
        last_frame_sent = 0
        
        while is_streaming:
            try:
                current_time = time.time()
                
                if current_time - last_frame_sent < 0.1:
                    time.sleep(0.01)
                    continue
                
                with frame_buffer_lock:
                    if frame_buffer is None or (current_time - last_frame_time) > 1:
                        img = Image.new('RGB', (1280, 720), color='black')
                        draw = ImageDraw.Draw(img)
                        draw.text((640, 360), "Camera Loading...", fill='white', anchor='mm')
                        
                        buf = io.BytesIO()
                        img.save(buf, format='JPEG', quality=80)
                        frame_data = buf.getvalue()
                    else:
                        frame_data = frame_buffer
                
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" +
                       frame_data +
                       b"\r\n")
                
                last_frame_sent = current_time
                
            except Exception as e:
                print(f"⚠️ Erreur génération frame: {e}")
                time.sleep(0.1)
    
    if not is_streaming:
        if not start_camera_stream():
            img = Image.new('RGB', (1280, 720), color='black')
            draw = ImageDraw.Draw(img)
            draw.text((640, 360), "Camera Error", fill='red', anchor='mm')
            
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=80)
            frame_data = buf.getvalue()
            
            def error_stream():
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" +
                       frame_data +
                       b"\r\n")
            
            return Response(
                error_stream(),
                mimetype="multipart/x-mixed-replace; boundary=frame",
                headers={'Cache-Control': 'no-cache'}
            )
    
    return Response(
        generate(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route("/api/camera/capture", methods=["POST"])
def camera_capture():
    """Capturer une photo"""
    tmp_path = None
    
    try:
        tmp_path = tempfile.mktemp(suffix=".jpg")
        
        was_streaming = is_streaming
        if was_streaming:
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
        "scanner": "ready",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/system/info", methods=["GET"])
def system_info():
    """Informations système"""
    return jsonify({
        "camera_streaming": is_streaming,
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
        </style>
    </head>
    <body>
        <h1>📷 Scanner & Camera Service</h1>
        
        <div class="endpoint">
            <h3>📊 Health Check</h3>
            <p><span class="method">GET</span> <span class="url">/api/health</span></p>
        </div>
        
        <div class="endpoint">
            <h3>🎥 Camera</h3>
            <p><span class="method">GET</span> <span class="url">/api/camera/status</span> - Statut caméra</p>
            <p><span class="method">POST</span> <span class="url">/api/camera/start</span> - Démarrer flux</p>
            <p><span class="method">POST</span> <span class="url">/api/camera/stop</span> - Arrêter flux</p>
            <p><span class="method">GET</span> <span class="url">/api/camera/stream</span> - Flux MJPEG</p>
            <p><span class="method">POST</span> <span class="url">/api/camera/capture</span> - Capture photo</p>
        </div>
        
        <div class="endpoint">
            <h3>📄 Scanner</h3>
            <p><span class="method">GET</span> <span class="url">/api/scanner/status</span> - Statut scanner</p>
            <p><span class="method">POST</span> <span class="url">/api/scanner/scan</span> - Effectuer un scan</p>
            <p><span class="method">GET</span> <span class="url">/api/scans/&lt;filename&gt;</span> - Récupérer scan</p>
        </div>
        
        <h2>Statut actuel:</h2>
        <p>Caméra: <span class="status streaming">Streaming</span> (si actif)</p>
        <p>Scanner: <span class="status ready">Prêt</span></p>
        
        <script>
            fetch('/api/health')
                .then(r => r.json())
                .then(data => {
                    document.querySelector('.streaming').textContent = 
                        data.camera === 'streaming' ? 'En cours' : 'Arrêté';
                    document.querySelector('.streaming').className = 
                        'status ' + (data.camera === 'streaming' ? 'streaming' : 'ready');
                });
        </script>
    </body>
    </html>
    """
    return html

# ==================== LANCEMENT ====================
if __name__ == "__main__":
    print("=" * 60)
    print("🎥📄 Service unifié Scanner & Camera")
    print("=" * 60)
    print(f"📡 URL: http://0.0.0.0:{PORT}")
    print(f"🎥 Flux camera: http://0.0.0.0:{PORT}/api/camera/stream")
    print(f"📄 Scan: POST http://0.0.0.0:{PORT}/api/scanner/scan")
    print(f"📊 Health: http://0.0.0.0:{PORT}/api/health")
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