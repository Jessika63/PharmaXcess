import React, { useState, useEffect, useRef } from "react";
import { useAutoVoiceOver, useVoiceOver } from '../../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../../config/voiceOverTexts';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers';
import { useNavigate, useSearchParams } from "react-router-dom";
import CameraComponent from "../../camera_component";
import ModalCamera from "../../modal_camera";
import QrCameraScanner from "../../qr_camera_scanner";
import { usePrescription } from "../../../context/PrescriptionContext";
import config from "../../../config";
import { FaPrint, FaSync, FaExclamationTriangle, FaCamera, FaQrcode } from "react-icons/fa";

const CAMERA_PI = "https://undelineable-bellicose-alannah.ngrok-free.dev/api";

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  const { speak } = useVoiceOver();

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

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPrescriptionScanner, setShowPrescriptionScanner] = useState(false);
  const [success, setSuccess] = useState(false); 
  const navigate = useNavigate();
  const { updatePrescriptionData } = usePrescription();

  // Keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef([]);
  const scanButtonRef = useRef(null);
  const backButtonQRRef = useRef(null);
  const backButtonPrescriptionRef = useRef(null);
  const backButtonSelectionRef = useRef(null);

  // VoiceOver for different pages
  useEffect(() => {
    if (showQRScanner) {
      speak(voiceOverTexts.scanOrdonnanceQR);
    } else if (showPrescriptionScanner) {
      speak(voiceOverTexts.scanOrdonnancePapier);
    } else {
      speak(voiceOverTexts.scanOrdonnance);
    }
  }, [showQRScanner, showPrescriptionScanner, speak]);

  // Fonctions pour le scan QR (pseudo backend caméra PI)
  const checkQRCode = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append("image", imageBlob, `qr_${Date.now()}.jpg`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${config.backendUrl}/read_prescription_qr`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return await res.json();
    } catch (err) {
      console.error("Erreur scan QR:", err);
      return { success: false, error: err.message };
    }
  };

  const extractPrescriptionText = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append("image", imageBlob, "prescription.jpg");
      formData.append("doc_type", "P");

      const res = await fetch(`${config.backendUrl}/extractText`, {
        method: "POST",
        body: formData
      });
      return await res.json();
    } catch (err) {
      console.error("Erreur extraction texte:", err);
      return { success: false, error: err.message };
    }
  };

  // ----------------------------
  // FONCTIONS CAMÉRA (de l'ancien code)
  // ----------------------------
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

  const startVideoStream = async () => {
    if (isStreamingRef.current) return;

    try {
      setError("");
      console.log("🎬 Démarrage stream...");

      const startRes = await fetch(`${CAMERA_PI}/camera/start_stream`, {
        method: "POST"
      });

      if (!startRes.ok) throw new Error("Start failed");

      await new Promise(resolve => setTimeout(resolve, 1500));

      frameCountRef.current = 0;
      lastFpsUpdateRef.current = Date.now();

      const refreshImage = () => {
        if (!isStreamingRef.current || !imgRef.current) return;
        
        const timestamp = Date.now();
        const url = `${CAMERA_PI}/camera/stream?t=${timestamp}`;
        
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = () => {
          if (imgRef.current) {
            imgRef.current.src = url;
            frameCountRef.current++;
            
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

      refreshIntervalRef.current = setInterval(refreshImage, 100);
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

  const captureForQR = async () => {
    try {
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
  // SCANNER PHYSIQUE (CanoScan LiDE 300)
  // ----------------------------
  const openScanner = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🖨️ Lancement du scanner via proxy backend...");

      const formData = new FormData();
      formData.append("doc_type", "P");

      const res = await fetch(`${config.backendUrl}/api/scanner/scan`, {
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
  // LOGIQUE DE SCAN QR (de l'ancien code)
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
        let imageBlob;
        try {
          imageBlob = await captureForQR();
        } catch (err) {
          console.log("⚠️ Capture ratée");
          consecutiveFailsRef.current++;
          return;
        }

        const formData = new FormData();
        formData.append("image", imageBlob, `qr_${Date.now()}.jpg`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${config.backendUrl}/read_prescription_qr`, {
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

          setIsModalOpen(false);
          cleanup();
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

    performScan();
    intervalRef.current = setInterval(performScan, scanInterval);
  };

  // ----------------------------
  // CAPTURE PHOTO (caméra)
  // ----------------------------
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
      const data = await extractPrescriptionText(blob);

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

      setIsModalOpen(false);
      cleanup();
      goToNextStep();

    } catch (err) {
      setError("Erreur capture");
      setLoading(false);
    }
  };

  // ----------------------------
  // GESTION DES PAGES
  // ----------------------------
  const openCameraPage = (type) => {
    setScanType(type);
    if (type === 'qr') {
      setShowQRScanner(true); 
      setError("");
      setSuccess(false);
    } else { 
      setShowPrescriptionScanner(true); 
      setError("");
      setSuccess(false);
    }
  };

  // Keyboard navigation (adapté pour 4 éléments: back + 3 cartes)
  useEffect(() => {
    if (!showQRScanner && !showPrescriptionScanner) {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
            setFocusedIndex((prev) => (prev + 1) % 4); // 4 éléments maintenant
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
            setFocusedIndex((prev) => (prev - 1 + 4) % 4);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedIndex === 0 && backButtonSelectionRef.current) {
            backButtonSelectionRef.current.click();
          } else if (buttonRefs.current[focusedIndex - 1]) {
            buttonRefs.current[focusedIndex - 1].click();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedIndex, showQRScanner, showPrescriptionScanner]);

  // Init camera status
  useEffect(() => {
    checkCameraStatus();
    return () => {
      cleanup();
    };
  }, []);

  // ----------------------------
  // RENDU PRINCIPAL
  // ----------------------------
  return (
    <div className="w-full h-screen flex flex-col">
      {showQRScanner ? (
        // Page Scan QR Code
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button {...createVoiceOverHandlers(speak)}
                onClick={() => setShowQRScanner(false)}
                ref={backButtonQRRef}
                tabIndex={0}
                className="flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg"
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan ordonnance</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mb-8">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
                <config.icons.qrCode className="text-2xl" />
              </div>
              <p className="text-xl text-black mb-2">
                Veuillez scanner votre QR code de votre
              </p>
              <p className="text-xl text-black">
                ordonnance via le scanner présent sur la machine
              </p>
            </div>


            {/* Option 1: Utiliser QrCameraScanner si disponible */}
            {!success && window.QrCameraScanner ? (
              <div className="mt-6 mb-8">
                <QrCameraScanner 
                  onFrame={async (blob) => {
                    try {
                      setLoading(true);
                      setError('');
                      
                      const qrData = await checkQRCode(blob);
                      
                      if (qrData.success) {
                        setSuccess(true);
                        setHasQRCode(true);

                        updatePrescriptionData({
                          medicaments: qrData.ordonnance?.medicaments || [],
                          scanType: 'qr',
                          hasQRCode: true,
                          rawData: qrData.ordonnance,
                          extractedText: '',
                          qrId: qrData.qr_id
                        });

                        setTimeout(() => {
                          goToNextStep({ hasQRCode: true });
                        }, 1000);
                      } else {
                        setError('Aucun QR code valide détecté');
                      }
                    } catch (err) {
                      console.error(err);
                      setError('Erreur lors de la lecture du QR code.');
                    } finally {
                      setLoading(false);
                    }
                  }} 
                  overlaySize={360} 
                />
              </div>
            ) : !success ? (
              // Option 2: Bouton pour ouvrir le modal de scan QR
              <div className="mt-8">
                <button
                  onClick={openQrCamera}
                  className="px-16 py-5 bg-black text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  LANCER LE SCAN QR
                </button>
              </div>
            ) : null}


            {loading && (
              <p className="text-gray-700 font-medium animate-pulse mt-2">Analyse en cours, veuillez patienter...</p>
            )}

            {error && (
              <div className="text-red-600 font-semibold mt-2 max-w-md">{error}</div>
            )}

            {success && (
              <div className="text-green-600 font-semibold mt-2 max-w-md">QR code détecté avec succès !</div>
            )}
          </div>
        </>
      ) : showPrescriptionScanner ? (
        // Page Scan Prescription
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button {...createVoiceOverHandlers(speak)}
                onClick={() => setShowPrescriptionScanner(false)}
                ref={backButtonPrescriptionRef}
                tabIndex={0}
                className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                  ${focusedIndex === 0 ? 'ring-2 ring-pink-300' : ''}`}
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan ordonnance</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mb-8">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8">
                <config.icons.filePrescription className="text-4xl text-black" />
              </div>
              <p className="text-2xl text-black mb-4 font-semibold">
                Veuillez insérer votre ordonnance
              </p>
              <p className="text-xl text-black">
                dans le scanner présent sur la machine
              </p>
            </div>

            {/* BOUTONS PRINCIPAUX */}
            {!success && !loading && (
              <div className="flex flex-col gap-4 items-center">
                {/* Scanner Physique */}
                <button 
                  {...createVoiceOverHandlers(speak)}
                  onClick={openScanner}
                  className={`px-16 py-5 bg-black text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300`}
                >
                  UTILISER LE SCANNER PHYSIQUE
                </button>

              </div>
            )}

            {loading && (
              <p className="text-gray-700 font-medium text-xl animate-pulse mt-2">
                {scanType === "scanner" ? "Scan en cours..." : "Analyse en cours..."}
              </p>
            )}

            {error && (
              <div className="text-red-600 font-semibold text-lg mt-2 max-w-md">{error}</div>
            )}

            {success && (
              <div className="text-green-600 font-semibold text-xl mt-2 max-w-md">Ordonnance scannée avec succès !</div>
            )}
          </div>
        </>
      ) : (
        // Page de Sélection (3 options)
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button onClick={goBackStep}
                ref={backButtonSelectionRef}
                tabIndex={focusedIndex === 0 ? 0 : -1}
                className={`flex items-center text-black hover:text-gray-600 transition-all duration-300 focus:outline-none
                  ${focusedIndex === 0 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
                {...createVoiceOverHandlers(speak)}>
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan ordonnance</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Choisissez la méthode pour scanner votre ordonnance
            </h2>

            {/* TROIS CARTES */}
            <div className="flex gap-8 max-w-6xl w-full mb-8">
              {/* Carte 1: Scanner Physique */}
              <div className={`flex-1 bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-lg min-h-[380px] transition-all
                ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <FaPrint className="text-3xl text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Scanner</h3>
                <p className="text-lg text-gray-600 mb-8 flex-1">
                  Utiliser le scanner physique CanoScan
                </p>
                <button {...createVoiceOverHandlers(speak)}
                  onClick={() => openCameraPage('prescription')}
                  ref={el => buttonRefs.current[0] = el}
                  tabIndex={focusedIndex === 1 ? 0 : -1}
                  aria-label="Scanner - Utiliser le scanner physique - CHOISIR"
                  className="bg-black text-white px-10 py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300"
                >
                  CHOISIR
                </button>
              </div>

              {/* Carte 2: QR Code */}
              <div className={`flex-1 bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-lg min-h-[380px] transition-all
                ${focusedIndex === 2 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <FaQrcode className="text-3xl text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">QR code</h3>
                <p className="text-lg text-gray-600 mb-8 flex-1">
                  Scanner le code QR de votre ordonnance
                </p>
                <button {...createVoiceOverHandlers(speak)}
                  onClick={() => openCameraPage('qr')}
                  ref={el => buttonRefs.current[1] = el}
                  tabIndex={focusedIndex === 2 ? 0 : -1}
                  aria-label="QR code - Scanner le code QR de votre ordonnance - CHOISIR"
                  className="bg-black text-white px-10 py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300"
                >
                  CHOISIR
                </button>
              </div>
            </div>

            {/* Status messages */}
            {loading && ( 
              <p className="text-gray-700 font-medium animate-pulse mt-6"> 
                Analyse en cours, veuillez patienter...
              </p>
            )}
            {error && ( 
              <div className="text-red-600 font-semibold mt-6">{error}</div> 
            )}
          </div>
        </>
      )}

      {/* MODAL pour scan QR (ancienne méthode) */}
      {isModalOpen && scanType === "qr" && (
        <ModalCamera onClose={() => {
          cleanup();
          setIsModalOpen(false);
          setScanType(null);
          setError("");
          setLoading(false);
        }}>
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
              onClick={() => {
                cleanup();
                setIsModalOpen(false);
                setScanType(null);
              }}
              className="px-8 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition shadow-md"
            >
              Annuler
            </button>
          </div>
        </ModalCamera>
      )}

      {/* MODAL pour photo (caméra) */}
      {isModalOpen && scanType === "prescription" && (
        <ModalCamera onClose={() => {
          cleanup();
          setIsModalOpen(false);
          setScanType(null);
          setError("");
          setLoading(false);
        }}>
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
                onClick={() => {
                  cleanup();
                  setIsModalOpen(false);
                  setScanType(null);
                }}
                className="px-8 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition shadow-md"
              >
                Annuler
              </button>
            </div>
          </div>
        </ModalCamera>
      )}
    </div>
  );
}

export default StepOrdonnance;