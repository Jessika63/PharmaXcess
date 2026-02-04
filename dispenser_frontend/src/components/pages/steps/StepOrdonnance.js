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
import jsQR from 'jsqr';

const CAMERA_PI = "http://10.180.55.168:5000/api";

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  const { speak } = useVoiceOver();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanType, setScanType] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [success, setSuccess] = useState(false);

  const intervalRef = useRef(null);
  const imgRef = useRef(null);
  const isStreamingRef = useRef(false);
  const isMountedRef = useRef(true);
  const consecutiveFailsRef = useRef(0);

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPrescriptionScanner, setShowPrescriptionScanner] = useState(false);
  
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

  // Test de connexion à la caméra PI
  const testCameraConnection = async () => {
    try {
      console.log("🔍 Test connexion caméra PI...");
      setDebugInfo("Test de connexion à la caméra...");
      
      const endpoints = ['/health', '/api/camera/status', '/'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${CAMERA_PI}${endpoint}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            console.log(`✅ Endpoint ${endpoint} accessible`);
            return true;
          }
        } catch (err) {
          console.log(`⚠️ Endpoint ${endpoint} non accessible:`, err.message);
        }
      }
      
      console.error("❌ Aucun endpoint de la caméra n'est accessible");
      setDebugInfo("Caméra non accessible");
      return false;
      
    } catch (err) {
      console.error("❌ Erreur test connexion:", err);
      setDebugInfo(`Erreur: ${err.message}`);
      return false;
    }
  };

  // Fonction pour capturer une photo via la caméra PI
  const captureForQR = async () => {
    if (!isMountedRef.current) throw new Error("Composant démonté");
    
    try {
      console.log("📸 Tentative de capture...");
      setDebugInfo("Capture en cours...");
      
      const res = await fetch(`${CAMERA_PI}/camera/snapshot`);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Snapshot échoué: ${res.status} - ${errorText}`);
      }
      
      const blob = await res.blob();
      console.log("✅ Photo capturée, taille:", blob.size, "type:", blob.type);
      setDebugInfo(`Photo capturée: ${Math.round(blob.size/1024)}KB`);
      
      if (blob.size < 1000) {
        throw new Error("Image trop petite");
      }
      
      return blob;
      
    } catch (err) {
      console.error("❌ Erreur capture photo:", err);
      setDebugInfo(`Erreur capture: ${err.message}`);
      
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') ||
          err.name === 'TypeError') {
        setUseFallback(true);
        setError("Problème de connexion à la caméra");
      }
      
      throw err;
    }
  };

  // Démarrer le flux vidéo
  const startVideoStream = async () => {
    if (!isMountedRef.current || isStreamingRef.current) return false;

    try {
      setError("");
      setDebugInfo("Démarrage du streaming...");
      console.log("🎬 Tentative de démarrage du flux...");
      
      const res = await fetch(`${CAMERA_PI}/camera/start_stream`, {
        method: "POST"
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Démarrage échoué: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ Streaming démarré:", data);
      setDebugInfo("Streaming démarré avec succès");
      
      isStreamingRef.current = true;
      setStreaming(true);
      
      return true;

    } catch (err) {
      console.error("❌ Erreur démarrage streaming:", err);
      setDebugInfo(`Erreur streaming: ${err.message}`);
      
      if (err.message.includes('Failed to fetch')) {
        setUseFallback(true);
        setError("Impossible de se connecter à la caméra");
      }
      
      return false;
    }
  };

  // Arrêter le flux vidéo
  const stopVideoStream = async () => {
    if (!isMountedRef.current) return;
    
    console.log("🛑 Arrêt stream...");
    setDebugInfo("Arrêt du streaming...");
    
    isStreamingRef.current = false;
    setStreaming(false);

    if (imgRef.current) {
      if (imgRef.current.dataset.lastUrl) {
        URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
      }
      imgRef.current.src = "";
    }

    try {
      await fetch(`${CAMERA_PI}/camera/stop_stream`, {
        method: "POST"
      });
    } catch (err) {
      console.log("Note: Erreur lors de l'arrêt:", err);
    }
  };

  // Nettoyage complet
  const cleanup = () => {
    console.log("🧹 Nettoyage en cours...");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isStreamingRef.current) {
      stopVideoStream();
    }
    
    if (imgRef.current && imgRef.current.dataset.lastUrl) {
      URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
      imgRef.current.src = "";
      delete imgRef.current.dataset.lastUrl;
    }
  };

  // Fonction pour vérifier le QR code d'ordonnance
  const checkPrescriptionQRCode = async (imageBlob) => {
    if (!isMountedRef.current) return { success: false, error: "Composant démonté" };
    
    return new Promise((resolve) => {
      console.log("🔍 === DÉBUT checkPrescriptionQRCode ===");
      console.log("📦 Blob reçu:", imageBlob.size, "bytes");
      
      const img = new Image();
      const blobUrl = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        console.log("🖼️ Image chargée, dimensions:", img.width, "x", img.height);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        console.log("🔎 Décodage QR avec jsQR...");
        setDebugInfo("Analyse QR locale...");
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        URL.revokeObjectURL(blobUrl);
        
        if (code) {
          console.log("✅ QR code décodé:", code.data);
          setDebugInfo("QR code détecté - Décryptage...");
          
          const qrContent = code.data.trim();
          console.log("🔐 Contenu crypté, longueur:", qrContent.length);
          
          // Appeler le backend spécifique pour les ordonnances
          fetch(`${config.backendUrl}/read_prescription_qr_content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: qrContent,
              scan_role: 'distributeur'
            })
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then(data => {
              console.log("✅ Données ordonnance décryptées:", data);
              setDebugInfo("Ordonnance chargée ✅");
              resolve({
                success: true,
                ...data
              });
            })
            .catch(err => {
              console.error("❌ Erreur décryptage:", err);
              setDebugInfo("Erreur décryptage");
              resolve({
                success: false,
                error: "Impossible de décrypter le QR code d'ordonnance"
              });
            });
        } else {
          console.log("❌ Aucun QR code détecté");
          setDebugInfo("Pas de QR détecté");
          resolve({
            success: false,
            error: "Aucun QR code trouvé"
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        console.error("❌ Erreur chargement image");
        resolve({ success: false, error: "Image invalide" });
      };
      
      img.src = blobUrl;
    });
  };

  // Lancer le scanning automatique (comme dans Preorder)
  const startPrescriptionScanning = () => {
    const SCAN_INTERVAL = 2000;
    let scanAttempts = 0;
    let consecutiveErrors = 0;

    const performScan = async () => {
      if (!isMountedRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      if (!isStreamingRef.current) {
        console.log("⏳ Caméra non prête");
        return;
      }

      scanAttempts++;
      if (isMountedRef.current) {
        setScanCount(scanAttempts);
      }

      console.log(`📸 Capture #${scanAttempts}`);
      setDebugInfo(`Capture #${scanAttempts}`);

      try {
        let imageBlob;
        try {
          imageBlob = await captureForQR();
          consecutiveErrors = 0;
        } catch (err) {
          consecutiveErrors++;
          console.log(`⚠️ Capture ratée (${consecutiveErrors}/3):`, err.message);
          
          if (consecutiveErrors >= 3) {
            console.log("⚠️ Trop d'erreurs, basculement vers fallback");
            setUseFallback(true);
            setError("Problème persistant avec la caméra");
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          return;
        }

        // Afficher la photo
        if (imgRef.current && isMountedRef.current) {
          const url = URL.createObjectURL(imageBlob);
          
          imgRef.current.onload = () => {
            console.log("✅ Image affichée");
          };
          
          imgRef.current.src = url;
          
          if (imgRef.current.dataset.lastUrl) {
            URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
          }
          imgRef.current.dataset.lastUrl = url;
        }

        if (isMountedRef.current) {
          console.log("🎯 Analyse QR code...");
          setDebugInfo("Analyse en cours...");
          
          setLoading(true);
          
          const qrData = await checkPrescriptionQRCode(imageBlob);
          
          setLoading(false);

          if (qrData.success && qrData.ordonnance && isMountedRef.current) {
            console.log("🎉 QR CODE ORDONNANCE TROUVÉ!");
            setDebugInfo("QR code valide trouvé!");
            
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            if (imgRef.current && imgRef.current.dataset.lastUrl) {
              URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
            }
            
            setSuccess(true);
            setError("");
            setHasQRCode(true);

            updatePrescriptionData({
              medicaments: qrData.ordonnance?.medicaments || [],
              scanType: "qr",
              hasQRCode: true,
              rawData: qrData.ordonnance,
              extractedText: "",
              qrId: qrData.qr_id
            });

            setIsModalOpen(false);
            cleanup();
            goToNextStep({ hasQRCode: true });
            return;
            
          } else if (isMountedRef.current) {
            console.log("❌ QR code invalide");
            setError(qrData.error || "QR code invalide");
          }
        }

      } catch (err) {
        console.error(`⚠️ Erreur scan:`, err);
        setDebugInfo(`Erreur: ${err.message}`);
      }
    };

    // Premier scan immédiat
    setTimeout(performScan, 500);
    
    // Puis scans réguliers
    intervalRef.current = setInterval(performScan, SCAN_INTERVAL);
  };

  // Fonction de fallback
  const handleFallbackScan = async (blob) => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo("Analyse QR code (fallback)...");
      
      const qrData = await checkPrescriptionQRCode(blob);
      
      if (qrData.success) {
        setSuccess(true);
        setError("");
        setDebugInfo("QR code valide trouvé!");
        setHasQRCode(true);

        updatePrescriptionData({
          medicaments: qrData.ordonnance?.medicaments || [],
          scanType: 'qr',
          hasQRCode: true,
          rawData: qrData.ordonnance,
          extractedText: '',
          qrId: qrData.qr_id
        });

        setIsModalOpen(false);
        goToNextStep({ hasQRCode: true });
      } else {
        setError(qrData.error || 'Aucun QR code détecté');
        setDebugInfo("Aucun QR code détecté");
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la lecture du QR code.');
      setDebugInfo(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialisation caméra
  useEffect(() => {
    isMountedRef.current = true;
    
    const initCamera = async () => {
      if (!isMountedRef.current) return;
      
      console.log("🚀 Initialisation StepOrdonnance");
      setDebugInfo("Initialisation...");
      
      const isAvailable = await testCameraConnection();
      setCameraAvailable(isAvailable);
      
      if (!isAvailable) {
        console.log("⚠️ Caméra PI non disponible");
        setUseFallback(true);
        setError("Caméra non disponible");
        return;
      }
      
      console.log("✅ Caméra disponible");
      setDebugInfo("Caméra OK");
    };

    setTimeout(initCamera, 500);

    return () => {
      console.log("🔴 Composant démonté");
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  // Ouvrir la caméra QR
  const openQrCamera = () => {
    setScanType("qr");
    setIsModalOpen(true);
    setError("");
    setScanCount(0);
    setSuccess(false);
    setUseFallback(false);

    console.log("🔍 Ouverture modal QR");

    const initModalCamera = async () => {
      const isAvailable = await testCameraConnection();
      setCameraAvailable(isAvailable);
      
      if (!isAvailable) {
        console.log("⚠️ Caméra non disponible, fallback immédiat");
        setUseFallback(true);
        return;
      }
      
      const started = await startVideoStream();
      
      if (started) {
        console.log("✅ Streaming démarré, lancement du scan");
        setDebugInfo("Streaming actif - Scan en cours...");
        
        setTimeout(() => {
          if (isMountedRef.current && isStreamingRef.current) {
            startPrescriptionScanning();
          }
        }, 2000);
      } else {
        console.log("❌ Échec streaming, fallback");
        setUseFallback(true);
        setError("Échec du streaming");
      }
    };

    setTimeout(initModalCamera, 300);
  };

  // ----------------------------
  // SCANNER PHYSIQUE (inchangé)
  // ----------------------------
  const openScanner = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🖨️ Lancement du scanner...");

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
      console.log("✅ Réponse backend:", data);

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

  // Fonctions OCR (inchangées)
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

  // Keyboard navigation
  useEffect(() => {
    if (!showQRScanner && !showPrescriptionScanner) {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
            setFocusedIndex((prev) => (prev + 1) % 4);
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

            {!success && (
              <div className="mt-8">
                <button
                  onClick={openQrCamera}
                  className="px-16 py-5 bg-black text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  LANCER LE SCAN QR
                </button>
              </div>
            )}

            {loading && (
              <p className="text-gray-700 font-medium animate-pulse mt-2">Analyse en cours...</p>
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
        // Page Scan Prescription (inchangé)
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

            {!success && !loading && (
              <div className="flex flex-col gap-4 items-center">
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
        // Page de Sélection (3 options - inchangé)
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

            {loading && ( 
              <p className="text-gray-700 font-medium animate-pulse mt-6"> 
                Analyse en cours...
              </p>
            )}
            {error && ( 
              <div className="text-red-600 font-semibold mt-6">{error}</div> 
            )}
          </div>
        </>
      )}

      {/* MODAL pour scan QR (comme dans Preorder) */}
      {isModalOpen && scanType === "qr" && (
        <ModalCamera onClose={() => {
          cleanup();
          setIsModalOpen(false);
          setScanType(null);
          setError("");
          setLoading(false);
          setSuccess(false);
        }}>
          <div className="flex flex-col items-center justify-center w-full h-full p-4">
            {useFallback ? (
              // Fallback
              <div className="w-full max-w-4xl mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '500px' }}>
                  <QrCameraScanner 
                    onFrame={handleFallbackScan}
                    overlaySize={400}
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Mode fallback - Scanner en temps réel
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Caméra PI non disponible)
                  </p>
                </div>
              </div>
            ) : (
              // Nouvelle méthode caméra PI
              <div className="w-full max-w-4xl mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '500px' }}>
                  <img
                    ref={imgRef}
                    className="w-full h-full object-contain"
                    alt="Scan QR code en direct"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("❌ Erreur image");
                      setUseFallback(true);
                    }}
                  />
                  
                  <div className="absolute inset-8 border-3 border-green-400 pointer-events-none flex items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-black bg-opacity-80 px-6 py-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaSync className="text-green-400 animate-spin" />
                          <span className="text-green-400 font-bold">
                            {cameraAvailable ? 'Scan en cours' : 'Connexion...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                    {cameraAvailable ? `Capture #${scanCount}` : 'Test...'}
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                    {cameraAvailable ? (streaming ? 'Caméra active' : 'Inactif') : 'Connexion...'}
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    {cameraAvailable 
                      ? "Positionnez le QR code dans le cadre vert" 
                      : "Connexion à la caméra..."}
                  </p>
                </div>
              </div>
            )}

            {/* Messages d'état */}
            {loading && (
              <div className="mb-4">
                <p className="text-gray-700 font-medium animate-pulse">
                  Analyse du QR code en cours...
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4">
                <div className="text-red-600 font-semibold max-w-md text-center">
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4">
                <div className="text-green-600 font-semibold max-w-md text-center">
                  QR code détecté avec succès !
                </div>
              </div>
            )}

            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded mb-4">
              <div><strong>Debug:</strong> {debugInfo}</div>
              <div><strong>Mode:</strong> {useFallback ? 'Fallback' : 'Caméra PI'}</div>
              <div><strong>Statut:</strong> {cameraAvailable ? 'Connecté' : 'Non connecté'} | Stream: {streaming ? 'Actif' : 'Inactif'}</div>
            </div>

            <button
              onClick={() => {
                cleanup();
                setIsModalOpen(false);
                setScanType(null);
                setError("");
                setLoading(false);
                setSuccess(false);
              }}
              className="px-8 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition shadow-md"
            >
              Annuler le scan
            </button>
          </div>
        </ModalCamera>
      )}
    </div>
  );
}

export default StepOrdonnance;