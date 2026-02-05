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
        
        console.log("🔎 Décodage QR avec jsQR (multi-scale)...");
        setDebugInfo("Analyse QR locale...");
        
        // Multi-scale scanning: essayer différents crops/zooms
        const scales = [
          { name: "Full", x: 0, y: 0, w: canvas.width, h: canvas.height },
          { name: "Center 80%", x: canvas.width * 0.1, y: canvas.height * 0.1, w: canvas.width * 0.8, h: canvas.height * 0.8 },
          { name: "Center 60%", x: canvas.width * 0.2, y: canvas.height * 0.2, w: canvas.width * 0.6, h: canvas.height * 0.6 },
          { name: "Center 40%", x: canvas.width * 0.3, y: canvas.height * 0.3, w: canvas.width * 0.4, h: canvas.height * 0.4 },
        ];
        
        let code = null;
        
        for (const scale of scales) {
          console.log(`  🔍 Tentative ${scale.name}...`);
          
          // Créer un canvas temporaire pour le crop
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 600;
          tempCanvas.height = 600;
          const tempCtx = tempCanvas.getContext('2d');
          
          // Dessiner la zone croppée et zoomée
          tempCtx.drawImage(
            canvas,
            scale.x, scale.y, scale.w, scale.h,  // source crop
            0, 0, 600, 600  // destination (zoom à 600x600)
          );
          
          const scaledData = tempCtx.getImageData(0, 0, 600, 600);
          
          code = jsQR(scaledData.data, scaledData.width, scaledData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code) {
            console.log(`  ✅ QR détecté avec ${scale.name}!`);
            break;
          }
        }
        
        if (!code) {
          console.log("  ❌ Aucune échelle n'a détecté de QR");
        }
        
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
        throw new Error("Image trop petite, probablement vide");
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
      console.log("Note: Erreur lors de l'arrêt (peut être normal):", err);
    }
  };

  // Lancer le scanning automatique pour prescription
  const startPrescriptionScanning = () => {
    const SCAN_INTERVAL = 2000; // 2 secondes
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
            console.log("⚠️ Trop d'erreurs consécutives, basculement vers fallback");
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
            if (imgRef.current) {
              console.log("📐 Dimensions:", imgRef.current.naturalWidth, "x", imgRef.current.naturalHeight);
            }
          };
          
          imgRef.current.onerror = (e) => {
            console.error("❌ Erreur affichage image:", e);
          };
          
          imgRef.current.src = url;
          
          if (imgRef.current.dataset.lastUrl) {
            URL.revokeObjectURL(imgRef.current.dataset.lastUrl);
          }
          imgRef.current.dataset.lastUrl = url;
        }

        if (isMountedRef.current) {
          console.log("🎯 Analyse jsQR locale...");
          setDebugInfo("QR code - Analyse en cours...");
          
          setLoading(true);
          
          const qrData = await checkQRCode(imageBlob);
          
          setLoading(false);

          if (qrData.success && qrData.ordonnance && isMountedRef.current) {
            console.log("🎉 QR CODE PRESCRIPTION TROUVÉ!");
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
            
            setTimeout(() => {
              if (isMountedRef.current) {
                setHasQRCode(true);
                updatePrescriptionData({
                  scanType: "qr",
                  hasQRCode: true,
                  rawData: qrData.ordonnance,
                  medicaments: qrData.ordonnance?.medicaments || [],
                  extractedText: "",
                  qrId: qrData.qr_id
                });
                setIsModalOpen(false);
                cleanup();
                goToNextStep({ hasQRCode: true });
              }
            }, 1000);
            
            return;
            
          } else if (isMountedRef.current) {
            console.log("❌ QR code invalide");
            setError(qrData.error || "QR code invalide");
          }
        } else {
          console.log("👁️ Pas de QR code détecté");
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

  const openQrCamera = () => {
    setScanType("qr");
    setIsModalOpen(true);
    setError("");
    setScanCount(0);
    consecutiveFailsRef.current = 0;

    console.log("🔍 Mode QR");

    setTimeout(() => {
      startVideoStream();
      setTimeout(startPrescriptionScanning, 2000);
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