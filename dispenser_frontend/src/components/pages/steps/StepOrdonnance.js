import React, { useState, useEffect, useRef } from "react";
import { useAutoVoiceOver, useVoiceOver } from '../../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../../config/voiceOverTexts';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers';
import { useNavigate, useSearchParams } from "react-router-dom";
import jsQR from 'jsqr';
import CameraComponent from "../../camera_component";
import ModalCamera from "../../modal_camera";
import QrCameraScanner from "../../qr_camera_scanner";
import { usePrescription } from "../../../context/PrescriptionContext";
import config from "../../../config";
import { FaPrint, FaSync, FaExclamationTriangle, FaCamera, FaQrcode } from "react-icons/fa";

const CAMERA_PI = "http://10.180.55.168:5000/api";

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  const { speak } = useVoiceOver();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanType, setScanType] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const intervalRef = useRef(null);
  const imgRef = useRef(null);
  const isStreamingRef = useRef(false);
  const isMountedRef = useRef(true);
  const consecutiveFailsRef = useRef(0);

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

  // Initialisation caméra PI et cleanup
  useEffect(() => {
    isMountedRef.current = true;
    testCameraConnection();
    
    return () => {
      cleanup();
    };
  }, []);

  // Fonctions pour le scan QR (décodage jsQR local avec support QR colorés)
  const checkQRCode = async (imageBlob) => {
    if (!isMountedRef.current) return { success: false, error: "Composant démonté" };
    
    return new Promise((resolve) => {
      console.log("🔍 === DÉBUT checkQRCode (prescription) ===");
      console.log("📦 Blob reçu:", imageBlob);
      console.log("📏 Taille blob:", imageBlob.size, "bytes");
      console.log("🎨 Type blob:", imageBlob.type);
      
      // Convertir le blob en image pour décoder le QR
      const img = new Image();
      const blobUrl = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        console.log("🖼️ Image chargée, dimensions:", img.width, "x", img.height);
        
        // Créer un canvas pour extraire les pixels
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Extraire les données de pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // CONVERSION NOIR & BLANC pour les QR codes colorés (rose/noir, blanc/rose)
        console.log("🎨 Conversion N&B pour QR colorés...");
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculer la luminosité
          const brightness = (r + g + b) / 3;
          
          // Convertir en noir ou blanc pur avec un seuil
          const threshold = brightness > 128 ? 255 : 0;
          data[i] = threshold;     // R
          data[i + 1] = threshold; // G
          data[i + 2] = threshold; // B
        }
        
        console.log("🔎 Décodage QR avec jsQR...");
        setDebugInfo("Analyse QR locale...");
        
        // Décoder le QR code avec jsQR (tenter normal + inversé)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        
        URL.revokeObjectURL(blobUrl);
        
        if (code) {
          console.log("✅ QR code décodé:", code.data);
          console.log("📍 Position:", code.location);
          
          // Le QR code contient des données cryptées, on envoie au backend pour décryptage
          const qrContent = code.data.trim();
          console.log("🔐 Contenu crypté, longueur:", qrContent.length);
          setDebugInfo("Décryptage QR...");
          
          // Appeler le backend pour décrypter et récupérer la prescription
          fetch(`${config.backendUrl}/read_prescription_qr_content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: qrContent
            })
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then(data => {
              console.log("✅ Données prescription décryptées:", data);
              setDebugInfo("Prescription chargée ✅");
              resolve({
                success: true,
                ...data
              });
            })
            .catch(err => {
              console.error("❌ Erreur décryptage/récupération prescription:", err);
              setDebugInfo("Erreur décryptage");
              resolve({
                success: false,
                error: "Impossible de décrypter le QR code"
              });
            });
        } else {
          console.log("❌ Aucun QR code détecté dans l'image");
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
            const data = endpoint === '/' ? { status: 'html page' } : await response.json();
            console.log(`📊 Données:`, data);
            setCameraAvailable(true);
            return true;
          }
        } catch (err) {
          console.log(`⚠️ Endpoint ${endpoint} non accessible:`, err.message);
        }
      }
      
      console.error("❌ Aucun endpoint de la caméra n'est accessible");
      setDebugInfo("Caméra non accessible - Vérifiez l'adresse IP et le port");
      setCameraAvailable(false);
      return false;
      
    } catch (err) {
      console.error("❌ Erreur test connexion:", err);
      setDebugInfo(`Erreur: ${err.message}`);
      setCameraAvailable(false);
      return false;
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
    
    isMountedRef.current = false;
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
  // FONCTIONS CAMÉRA
  // ----------------------------
















  // Fonction d'heuristique pour détecter si une image pourrait contenir un QR code
const mightContainQRCode = async (imageBlob) => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Analyser une version réduite de l'image pour plus de rapidité
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        
        const imageData = ctx.getImageData(0, 0, 200, 200);
        const data = imageData.data;
        
        // Compter les pixels très noirs et très blancs (caractéristiques des QR codes)
        let blackPixels = 0;    // pixels très sombres (< 30)
        let whitePixels = 0;    // pixels très clairs (> 225)
        let contrastPixels = 0; // pixels avec fort contraste local
        
        // Analyser par blocs de 4x4 pixels
        for (let y = 0; y < 200; y += 4) {
          for (let x = 0; x < 200; x += 4) {
            const index = (y * 200 + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / 3;
            
            if (brightness < 30) blackPixels++;
            if (brightness > 225) whitePixels++;
            
            // Vérifier le contraste local (différence entre pixels adjacents)
            if (x < 196 && y < 196) {
              const nextIndex = (y * 200 + (x + 4)) * 4;
              const r2 = data[nextIndex];
              const g2 = data[nextIndex + 1];
              const b2 = data[nextIndex + 2];
              const brightness2 = (r2 + g2 + b2) / 3;
              
              if (Math.abs(brightness - brightness2) > 100) {
                contrastPixels++;
              }
            }
          }
        }
        
        const totalBlocks = (200/4) * (200/4); // 2500 blocs
        const blackRatio = blackPixels / totalBlocks;
        const whiteRatio = whitePixels / totalBlocks;
        const contrastRatio = contrastPixels / totalBlocks;
        
        URL.revokeObjectURL(url);
        
        // Logique d'heuristique pour détecter un QR code potentiel
        // Les QR codes ont généralement :
        // - Des zones noires et blanches bien définies
        // - Un fort contraste entre pixels adjacents
        // - Une certaine proportion de noir et de blanc
        
        const isQRCodeLikely = (
          // Soit bon ratio de noir ET de blanc
          (blackRatio > 0.08 && whiteRatio > 0.08) ||
          // Soit très fort contraste
          (contrastRatio > 0.15) ||
          // Soit beaucoup de noir OU beaucoup de blanc (pour QR codes simples)
          (blackRatio > 0.15 || whiteRatio > 0.15)
        );
        
        console.log(`Heuristique QR: noir=${(blackRatio*100).toFixed(1)}%, blanc=${(whiteRatio*100).toFixed(1)}%, contraste=${(contrastRatio*100).toFixed(1)}% => ${isQRCodeLikely ? 'POTENTIEL' : 'NON'}`);
        resolve(isQRCodeLikely);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    } catch (err) {
      console.error('Erreur heuristique QR:', err);
      resolve(false);
    }
  });
};

// Modifier la fonction startQrScanning pour utiliser des photos individuelles
const startQrScanning = () => {
  const SCAN_INTERVAL = 2500; // 1 seconde
  let scanAttempts = 0;
  let lastCaptureTime = 0;

  const performScan = async () => {
    if (!isStreamingRef.current) {
      console.log("Attente caméra...");
      return;
    }

    scanAttempts++;
    setScanCount(scanAttempts);
    
    console.log(`Capture #${scanAttempts}`);

    try {
      // 1. Capturer une photo
      let imageBlob;
      try {
        imageBlob = await captureForQR();
        lastCaptureTime = Date.now();
      } catch (err) {
        console.log("Capture ratée:", err);
        consecutiveFailsRef.current++;
        return;
      }

      // 2. Afficher la photo immédiatement dans le modal
      if (imgRef.current) {
        const url = URL.createObjectURL(imageBlob);
        imgRef.current.src = url;
        // Nettoyer l'URL précédente si elle existe
        if (imgRef.current.dataset.lastUrl) {
          URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
        }
        imgRef.current.dataset.lastUrl = url;
      }

      // 3. Vérifier heuristique si c'est potentiellement un QR code
      const isLikelyQR = await mightContainQRCode(imageBlob);
      
      if (isLikelyQR) {
        console.log("Image semble contenir un QR code, analyse backend...");
        
        // 4. Envoyer au backend pour lecture réelle du QR code
        const formData = new FormData();
        formData.append("image", imageBlob, `qr_${Date.now()}.jpg`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
          const res = await fetch(`${config.backendUrl}/read_prescription_qr`, {
            method: "POST",
            body: formData,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          
          if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
          }
          
          const data = await res.json();

          if (data.success && data.ordonnance) {
            console.log("QR CODE TROUVÉ ET VALIDE!");
            
            // Arrêter le scanning
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // Nettoyer les URLs
            if (imgRef.current && imgRef.current.dataset.lastUrl) {
              URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
            }
            
            // Mettre à jour le contexte et passer à l'étape suivante
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
            return;
            
          } else {
            console.log("QR code détecté mais invalide ou vide");
            consecutiveFailsRef.current = 0; // Réinitialiser car on a trouvé quelque chose
          }
          
        } catch (fetchErr) {
          if (fetchErr.name === 'AbortError') {
            console.log("Timeout analyse QR code");
          } else {
            console.error("Erreur analyse QR:", fetchErr);
          }
        }
        
      } else {
        console.log("Image ne semble pas contenir de QR code, skip backend");
        consecutiveFailsRef.current++;
        
        // Si trop d'échecs consécutifs, on pourrait ajuster l'intervalle
        if (consecutiveFailsRef.current > 5) {
          console.log("ℹBeaucoup d'images sans QR, continuons le scan...");
        }
      }

    } catch (err) {
      console.error(`Erreur scan cycle:`, err);
      consecutiveFailsRef.current++;
    }
  };

  // Démarrer immédiatement et régulièrement
  performScan();
  intervalRef.current = setInterval(performScan, SCAN_INTERVAL);
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
    console.log("Démarrage stream caméra");

    const res = await fetch(`${CAMERA_PI}/camera/start_stream`, {
      method: "POST"
    });

    if (!res.ok) throw new Error("Start failed");

    isStreamingRef.current = true;
    setStreaming(true);
    setCameraStatus("streaming");

  } catch (err) {
    console.error("Erreur caméra:", err);
    setError("Erreur démarrage caméra");
    setCameraStatus("error");
  }
};


  const stopVideoStream = async () => {
    console.log("Arrêt stream...");
    
    isStreamingRef.current = false;
    setStreaming(false);

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
  const res = await fetch(`${CAMERA_PI}/camera/snapshot`);
  if (!res.ok) throw new Error("Snapshot failed");
  return await res.blob();
};


  const openQrCamera = () => {
    setScanType("qr");
    setIsModalOpen(true);
    setError("");
    setScanCount(0);
    consecutiveFailsRef.current = 0;

    console.log("🔍 Mode QR");

    setTimeout(() => {
      startVideoStream();
      setTimeout(startQrScanning, 2000);
    }, 300);
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



{/* MODAL pour scan QR */}
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
          alt="Scan QR code en direct"
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
        
        {/* Indicateur de capture */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
          Capture #{scanCount}
        </div>
        
        {/* Indicateur statut */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
          {streaming ? "Actif" : "Inactif"}
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Scanner QR Code - Mode Photo
        </h3>
        <p className="text-gray-600 mb-1">
          Positionnez le QR code dans le cadre vert
        </p>
        <p className="text-gray-500 text-sm">
          1 photo/seconde • ⚡ Analyse en temps réel
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
        Annuler le scan
      </button>
    </div>
  </ModalCamera>
)}















    </div>
  );
}

export default StepOrdonnance;