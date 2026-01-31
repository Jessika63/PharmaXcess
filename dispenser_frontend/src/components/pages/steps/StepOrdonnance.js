import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ModalCamera from "../../modal_camera";
import { usePrescription } from "../../../context/PrescriptionContext";
import config from "../../../config";
import { FaPrint, FaSync, FaExclamationTriangle, FaCamera, FaQrcode } from "react-icons/fa";

const BACKEND_PC = "http://57.128.57.96:5000";
const CAMERA_PI = "https://undelineable-bellicose-alannah.ngrok-free.dev/api";

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanType, setScanType] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [fps, setFps] = useState(0);

  const intervalRef = useRef(null);
  const imgRef = useRef(null);
  const isStreamingRef = useRef(false);
  const consecutiveFailsRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const refreshIntervalRef = useRef(null);

  const navigate = useNavigate();
  const { updatePrescriptionData } = usePrescription();

  // ----------------------------
  // INITIALISATION
  // ----------------------------
  useEffect(() => {
    checkCameraStatus();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    stopVideoStream();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
  };

  const checkCameraStatus = async () => {
    try {
      const response = await fetch(`${CAMERA_PI}/camera/status`);
      if (response.ok) {
        const data = await response.json();
        setCameraStatus(data.status || "ready");
      }
    } catch (err) {
      setCameraStatus("error");
    }
  };

  // ----------------------------
  // STREAM SIMPLE ET FIABLE
  // ----------------------------
  const startVideoStream = async () => {
    if (isStreamingRef.current) return;

    try {
      setError("");
      console.log("🎬 Démarrage stream...");

      // Démarrer le stream
      const startRes = await fetch(`${CAMERA_PI}/camera/start_stream`, {
        method: "POST"
      });

      if (!startRes.ok) throw new Error("Start failed");

      // Attendre
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Initialiser FPS
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = Date.now();

      // Fonction de rafraîchissement
      const refreshImage = () => {
        if (!isStreamingRef.current || !imgRef.current) return;
        
        const timestamp = Date.now();
        const url = `${CAMERA_PI}/camera/stream?t=${timestamp}`;
        
        // Pré-charger
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = () => {
          if (imgRef.current) {
            imgRef.current.src = url;
            frameCountRef.current++;
            
            // Calculer FPS
            const now = Date.now();
            if (now - lastFpsUpdateRef.current >= 1000) {
              setFps(frameCountRef.current);
              frameCountRef.current = 0;
              lastFpsUpdateRef.current = now;
            }
          }
        };
        tempImg.onerror = () => {
          console.log("⚠️ Erreur image");
        };
        tempImg.src = url;
      };

      // Rafraîchir à 10 FPS (plus stable)
      refreshIntervalRef.current = setInterval(refreshImage, 100);

      // Première image
      setTimeout(refreshImage, 200);

      isStreamingRef.current = true;
      setStreaming(true);
      setCameraStatus("streaming");
      console.log("✅ Stream démarré");

    } catch (err) {
      console.error("❌ Erreur:", err);
      setError("Erreur démarrage flux");
      setCameraStatus("error");
    }
  };

  const stopVideoStream = async () => {
    console.log("🛑 Arrêt stream...");
    
    isStreamingRef.current = false;
    setStreaming(false);
    setFps(0);

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (imgRef.current) {
      imgRef.current.src = "";
    }

    try {
      await fetch(`${CAMERA_PI}/camera/stop_stream`, {
        method: "POST"
      });
    } catch (err) {
      console.log("Erreur arrêt:", err);
    }

    setCameraStatus("idle");
  };

  // ----------------------------
  // CAPTURE DIRECTE
  // ----------------------------
  const captureForQR = async () => {
    try {
      // Capturer directement depuis le stream
      const timestamp = Date.now();
      const response = await fetch(`${CAMERA_PI}/camera/stream?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      
      if (!blob || blob.size < 1000) {
        throw new Error("Image invalide");
      }
      
      console.log(`📸 Capture: ${blob.size} bytes`);
      return blob;
      
    } catch (err) {
      throw new Error(`Capture: ${err.message}`);
    }
  };

  // ----------------------------
  // QR SCANNING SIMPLIFIÉ
  // ----------------------------
  const openQrCamera = () => {
    setScanType("qr");
    setIsModalOpen(true);
    setError("");
    setScanCount(0);
    setFps(0);
    consecutiveFailsRef.current = 0;

    console.log("🔍 Mode QR");

    setTimeout(() => {
      startVideoStream();
      setTimeout(startQrScanning, 2000);
    }, 300);
  };

  const startQrScanning = () => {
    let scanInterval = 1500;

    const performScan = async () => {
      if (!isStreamingRef.current) {
        console.log("⏳ Attente stream...");
        return;
      }

      const currentScan = scanCount + 1;
      setScanCount(currentScan);

      console.log(`🔍 Scan #${currentScan}`);

      try {
        // Capturer
        let imageBlob;
        try {
          imageBlob = await captureForQR();
        } catch (err) {
          console.log("⚠️ Capture ratée");
          consecutiveFailsRef.current++;
          return;
        }

        // Envoyer au backend
        const formData = new FormData();
        formData.append("image", imageBlob, `qr_${Date.now()}.jpg`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${BACKEND_PC}/read_prescription_qr`, {
          method: "POST",
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await res.json();

        if (data.success && data.ordonnance) {
          console.log("🎉 QR TROUVÉ!");

          if (intervalRef.current) clearInterval(intervalRef.current);
          
          setHasQRCode(true);
          updatePrescriptionData({
            scanType: "qr",
            hasQRCode: true,
            rawData: data.ordonnance,
            medicaments: data.ordonnance?.medicaments || [],
            extractedText: "",
            qrId: data.qr_id
          });

          closeModal();
          goToNextStep({ hasQRCode: true });

        } else {
          consecutiveFailsRef.current++;
          console.log(`❌ Pas de QR (${consecutiveFailsRef.current})`);
          
          if (consecutiveFailsRef.current > 3) {
            scanInterval = 1000;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = setInterval(performScan, scanInterval);
            }
          }
        }

      } catch (err) {
        console.log(`⚠️ Erreur: ${err.message}`);
        consecutiveFailsRef.current++;
      }
    };

    // Premier scan
    performScan();

    // Scans réguliers
    intervalRef.current = setInterval(performScan, scanInterval);
  };

  // ----------------------------
  // CAPTURE PHOTO (caméra)
  // ----------------------------
  const openPhotoCamera = () => {
    setScanType("prescription");
    setIsModalOpen(true);
    setError("");
    
    setTimeout(() => {
      startVideoStream();
    }, 300);
  };

  const capturePhoto = async () => {
    try {
      setLoading(true);
      setError("");

      await stopVideoStream();
      await new Promise(resolve => setTimeout(resolve, 500));

      const imgRes = await fetch(`${CAMERA_PI}/camera/capture`, {
        method: "POST"
      });

      if (!imgRes.ok) throw new Error("Capture failed");

      const blob = await imgRes.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        handlePhotoCaptured(reader.result);
      };
      reader.readAsDataURL(blob);

    } catch (err) {
      setError("Erreur capture");
      setLoading(false);
    }
  };

  const handlePhotoCaptured = async (base64Image) => {
    try {
      setLoading(true);

      const byteString = atob(base64Image.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      formData.append("doc_type", "P");

      const res = await fetch(`${BACKEND_PC}/extractText`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!data.success) {
        setError("Erreur OCR");
        setLoading(false);
        return;
      }

      updatePrescriptionData({
        medicaments: data.infos?.medicaments || [],
        scanType: "photo",
        hasQRCode: false,
        extractedText: data.raw_text || "",
        rawData: data.infos,
      });

      closeModal();
      goToNextStep();

    } catch (err) {
      setError("Erreur traitement");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // SCANNER PHYSIQUE (CanoScan LiDE 300)
  // ----------------------------
  
  

  const openScanner = async () => {
  try {
    setLoading(true);
    setError("");
    console.log("🖨️ Lancement du scanner via proxy backend...");

    const formData = new FormData();
    formData.append("doc_type", "P");

    // Appel DIRECT au proxy du backend PC
    const res = await fetch(`${BACKEND_PC}/api/scanner/scan`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Scanner error: ${res.status} - ${text}`);
    }

    const data = await res.json();
    console.log("✅ Réponse complète backend:", data);

    if (!data.success) {
      throw new Error(data.error || "Échec du scan");
    }

    // Le backend devrait déjà retourner les données OCR complètes
    updatePrescriptionData({
      medicaments: data.infos?.medicaments || [],
      scanType: "scanner",
      hasQRCode: false,
      extractedText: data.raw_text || "",
      rawData: data.infos,
    });

    goToNextStep();

  } catch (err) {
    console.error("❌ Erreur scanner:", err);
    setError(`Erreur: ${err.message}`);
  } finally {
    setLoading(false);
  }
};



  // ----------------------------
  // GESTION MODALE
  // ----------------------------
  const closeModal = () => {
    console.log("🔒 Fermeture modal...");
    cleanup();
    setIsModalOpen(false);
    setScanType(null);
    setError("");
    setLoading(false);
    setScanCount(0);
    consecutiveFailsRef.current = 0;
    setFps(0);
  };

  // ----------------------------
  // UI - TOUS LES BOUTONS AVEC VOTRE CSS
  // ----------------------------
  return (
    <div className="w-full h-full flex flex-col items-center bg-background_color p-6">
      {/* En-tête */}
      <div className="w-full flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className={`
            px-6 py-3
            ${config.borderRadius.lg}
            ${config.shadows.md}
            ${config.buttonColors.mainGradient}
            ${config.buttonColors.mainGradientHover}
            ${config.textColors.primary}
            ${config.transitions.slow}
            ${config.scaleEffects.hover}
          `}
        >
          Retour
        </button>

        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            cameraStatus === "ready" || cameraStatus === "streaming"
              ? "bg-green-100 text-green-800"
              : cameraStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
            Caméra: {cameraStatus} {fps > 0 && `(${fps} FPS)`}
          </div>

          <button
            onClick={() => navigate("/")}
            className={`
              px-6 py-3
              ${config.borderRadius.lg}
              ${config.shadows.md}
              ${config.buttonColors.mainGradient}
              ${config.buttonColors.mainGradientHover}
              ${config.textColors.primary}
              ${config.transitions.slow}
              ${config.scaleEffects.hover}
            `}
          >
            Menu
          </button>
        </div>
      </div>

      {/* Titre */}
      <h1 className={`${config.fontSizes["2xl"]} font-bold text-primary mb-2`}>
        Scanner votre ordonnance
      </h1>
      <p className="text-gray-600 mb-10">
        Choisissez une méthode de scan
      </p>

      {/* TROIS BOUTONS PRINCIPAUX */}
      <div className="flex flex-col space-y-10 w-full max-w-2xl items-center">
        
        {/* 1. PRENDRE UNE PHOTO (Caméra Raspberry) */}
        <div className="w-full flex flex-col items-center">
          <button
            onClick={openPhotoCamera}
            disabled={cameraStatus === "error"}
            className={`
              w-full max-w-md h-48 flex flex-col items-center justify-center
              ${config.borderRadius.xl}
              ${config.shadows.lg}
              ${config.buttonColors.mainGradient}
              ${config.buttonColors.mainGradientHover}
              ${config.textColors.primary}
              ${config.fontSizes.xl}
              ${config.transitions.slow}
              ${config.scaleEffects.hover}
              ${cameraStatus === "error" ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <FaCamera className="text-5xl mb-4" />
            <span className="font-bold">Prendre une photo</span>
            <span className="text-sm mt-2 opacity-90">Utiliser la caméra Raspberry Pi</span>
          </button>
        </div>

        {/* 2. SCANNER QR CODE */}
        <div className="w-full flex flex-col items-center">
          <button
            onClick={openQrCamera}
            disabled={cameraStatus === "error"}
            className={`
              w-full max-w-md h-48 flex flex-col items-center justify-center
              ${config.borderRadius.xl}
              ${config.shadows.lg}
              ${config.buttonColors.mainGradient}
              ${config.buttonColors.mainGradientHover}
              ${config.textColors.primary}
              ${config.fontSizes.xl}
              ${config.transitions.slow}
              ${config.scaleEffects.hover}
              ${cameraStatus === "error" ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <FaQrcode className="text-5xl mb-4" />
            <span className="font-bold">Scanner QR Code</span>
            <span className="text-sm mt-2 opacity-90">Détection automatique</span>
          </button>
        </div>

        {/* 3. SCANNER PHYSIQUE (CanoScan LiDE 300) */}
        <div className="w-full flex flex-col items-center">
          <button
            onClick={openScanner}
            disabled={loading}
            className={`
              w-full max-w-md h-48 flex flex-col items-center justify-center
              ${config.borderRadius.xl}
              ${config.shadows.lg}
              ${config.buttonColors.mainGradient}
              ${config.buttonColors.mainGradientHover}
              ${config.textColors.primary}
              ${config.fontSizes.xl}
              ${config.transitions.slow}
              ${config.scaleEffects.hover}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <FaPrint className="text-5xl mb-4" />
            <span className="font-bold">Utiliser le scanner</span>
            <span className="text-sm mt-2 opacity-90">CanoScan LiDE 300</span>
            {loading && (
              <span className="text-xs mt-1 text-yellow-600 animate-pulse">
                Scan en cours...
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Messages d'état */}
      <div className="mt-8 max-w-2xl w-full">
        {loading && scanType !== "scanner" && (
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="font-medium text-blue-600">
              {scanType === "qr" ? "Recherche QR Code..." : "Analyse en cours..."}
            </p>
          </div>
        )}

        {loading && scanType === "scanner" && (
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
            <p className="font-medium text-purple-600">
              Scan en cours... Patientez
            </p>
            <p className="text-sm text-purple-500 mt-1">
              Le scanner physique est en cours d'utilisation
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700 mb-1">
                  {scanType === "scanner" ? "Erreur scanner" : "Information"}
                </p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL pour caméra (photo et QR) */}
      {isModalOpen && scanType !== "scanner" && (
        <ModalCamera onClose={closeModal}>
          {scanType === "qr" ? (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <div className="relative w-full max-w-4xl h-[500px] mb-6 bg-black rounded-xl overflow-hidden">
                <img
                  ref={imgRef}
                  className="w-full h-full object-contain"
                  alt="Flux caméra"
                  crossOrigin="anonymous"
                />

                {/* Overlay pour QR code */}
                <div className="absolute inset-8 border-3 border-green-400 rounded-xl pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-black bg-opacity-80 px-6 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FaSync className="text-green-400 animate-spin" />
                        <span className="text-green-400 font-bold">SCAN QR CODE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  {streaming && (
                    <>
                      <div className="bg-black bg-opacity-70 px-3 py-1 rounded-full">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-white text-sm">LIVE {fps}FPS</span>
                        </div>
                      </div>
                      <div className="bg-blue-600 bg-opacity-80 px-3 py-1 rounded-full">
                        <span className="text-white text-sm">Scans: {scanCount}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Scanner QR Code
                </h3>
                <p className="text-gray-600">
                  Positionnez le QR code dans le cadre vert
                </p>
              </div>

              <button
                onClick={closeModal}
                className="px-8 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition shadow-md"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <div className="relative w-full max-w-4xl h-[500px] mb-6 bg-black rounded-xl overflow-hidden">
                <img
                  ref={imgRef}
                  className="w-full h-full object-contain"
                  alt="Flux caméra"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Prendre une photo de l'ordonnance
                </h3>
                <p className="text-gray-600">
                  Positionnez l'ordonnance face à la caméra
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={capturePhoto}
                  disabled={loading}
                  className={`
                    px-8 py-3 font-medium rounded-lg shadow-md
                    ${loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  `}
                >
                  {loading ? 'Capture en cours...' : '📸 Capturer'}
                </button>

                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition shadow-md"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </ModalCamera>
      )}
    </div>
  );
}

export default StepOrdonnance;