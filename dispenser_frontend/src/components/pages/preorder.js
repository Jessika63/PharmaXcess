import React, { useState, useRef, useEffect } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import config from '../../config';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';
import { FaSync } from "react-icons/fa";
import QrCameraScanner from '../qr_camera_scanner';

// Configuration de la caméra PI
const CAMERA_PI = "http://10.180.55.168:5000/api";

function Preorder() {
  useAutoVoiceOver(voiceOverTexts.preorder);
  const { speak } = useVoiceOver();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const intervalRef = useRef(null);
  const imgRef = useRef(null);
  const isStreamingRef = useRef(false);
  const isMountedRef = useRef(true);
  const goBackButtonRef = useRef(null);

  // Test de connexion à la caméra PI (sans timeout agressif)
  const testCameraConnection = async () => {
    try {
      console.log("🔍 Test connexion caméra PI...");
      setDebugInfo("Test de connexion à la caméra...");
      
      // Essayer plusieurs endpoints pour vérifier la connectivité
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
            return true;
          }
        } catch (err) {
          console.log(`⚠️ Endpoint ${endpoint} non accessible:`, err.message);
        }
      }
      
      console.error("❌ Aucun endpoint de la caméra n'est accessible");
      setDebugInfo("Caméra non accessible - Vérifiez l'adresse IP et le port");
      return false;
      
    } catch (err) {
      console.error("❌ Erreur test connexion:", err);
      setDebugInfo(`Erreur: ${err.message}`);
      return false;
    }
  };

  // Heuristique pour détecter si une image pourrait contenir un QR code
  const mightContainQRCode = async (imageBlob) => {
    if (!isMountedRef.current) return false;
    
    return new Promise((resolve) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);
        
        img.onload = () => {
          if (!isMountedRef.current) {
            URL.revokeObjectURL(url);
            resolve(false);
            return;
          }
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = 200;
          canvas.height = 200;
          ctx.drawImage(img, 0, 0, 200, 200);
          
          const imageData = ctx.getImageData(0, 0, 200, 200);
          const data = imageData.data;
          
          let blackPixels = 0;
          let whitePixels = 0;
          let contrastPixels = 0;
          
          for (let y = 0; y < 200; y += 4) {
            for (let x = 0; x < 200; x += 4) {
              const index = (y * 200 + x) * 4;
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              const brightness = (r + g + b) / 3;
              
              if (brightness < 30) blackPixels++;
              if (brightness > 225) whitePixels++;
              
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
          
          const totalBlocks = (200/4) * (200/4);
          const blackRatio = blackPixels / totalBlocks;
          const whiteRatio = whitePixels / totalBlocks;
          const contrastRatio = contrastPixels / totalBlocks;
          
          URL.revokeObjectURL(url);
          
          const isQRCodeLikely = (
            (blackRatio > 0.08 && whiteRatio > 0.08) ||
            (contrastRatio > 0.15) ||
            (blackRatio > 0.15 || whiteRatio > 0.15)
          );
          
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

  // Fonction pour capturer une photo via la caméra PI (version simplifiée)
  const captureForQR = async () => {
    if (!isMountedRef.current) throw new Error("Composant démonté");
    
    try {
      console.log("📸 Tentative de capture...");
      setDebugInfo("Capture en cours...");
      
      // Version sans timeout pour éviter les abort
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
      
      // Vérifier si c'est une erreur réseau
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') ||
          err.name === 'TypeError') {
        setUseFallback(true);
        setError("Problème de connexion à la caméra");
      }
      
      throw err;
    }
  };

  // Démarrer le flux vidéo (version simplifiée)
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

  // Fonction pour vérifier le QR code de profil
  const checkProfileQRCode = async (imageBlob) => {
    if (!isMountedRef.current) return { success: false, error: "Composant démonté" };
    
    return new Promise((resolve) => {
      console.log("🔍 === DÉBUT checkProfileQRCode ===");
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
        
        console.log("🔎 Décodage QR avec jsQR...");
        setDebugInfo("Analyse QR locale...");
        
        // Décoder le QR code avec jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        URL.revokeObjectURL(blobUrl);
        
        if (code) {
          console.log("✅ QR code décodé:", code.data);
          console.log("📍 Position:", code.location);
          
          // Le QR code contient un JSON: {"id": 123}
          try {
            const qrData = JSON.parse(code.data);
            const qrId = qrData.id;
            
            if (!qrId) {
              console.error("❌ Pas d'ID dans le QR code");
              resolve({ success: false, error: "QR code invalide (pas d'ID)" });
              return;
            }
            
            console.log("🆔 QR ID extrait:", qrId);
            setDebugInfo(`QR ID: ${qrId}, récupération profil...`);
            
            // Appeler le backend pour récupérer les données du profil
            fetch(`${config.backendUrl}/get_profile/${qrId}?scan_role=distributeur`)
              .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
              })
              .then(data => {
                console.log("✅ Données profil:", data);
                setDebugInfo("Profil chargé ✅");
                resolve({
                  success: true,
                  qr_id: qrId,
                  ...data
                });
              })
              .catch(err => {
                console.error("❌ Erreur récupération profil:", err);
                setDebugInfo("Erreur serveur");
                resolve({
                  success: false,
                  error: "Profil non trouvé"
                });
              });
          } catch (parseError) {
            console.error("❌ QR code n'est pas du JSON valide:", parseError);
            console.log("📄 Contenu brut:", code.data);
            resolve({
              success: false,
              error: "Format QR code invalide"
            });
          }
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

  // Lancer le scanning automatique
  const startProfileScanning = () => {
    const SCAN_INTERVAL = 2000; // 2 secondes pour être plus sûr
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
          consecutiveErrors = 0; // Réinitialiser les erreurs consécutives
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

        // Vérifier heuristique
        //const isLikelyQR = await mightContainQRCode(imageBlob);
        
        if (isMountedRef.current) {
          console.log("🎯 QR code potentiel détecté");
          setDebugInfo("QR code détecté - Analyse en cours...");
          
          setLoading(true);
          
          const qrData = await checkProfileQRCode(imageBlob);
          
          setLoading(false);

          if (qrData.success && qrData.profile && isMountedRef.current) {
            console.log("🎉 QR CODE PROFIL TROUVÉ!");
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
                navigate('/preorder-success', { 
                  state: { 
                    profile: qrData.profile,
                    scanType: "qr" 
                  } 
                });
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

  // Fonction de fallback
  const handleFallbackScan = async (blob) => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo("Analyse QR code (fallback)...");
      
      const qrData = await checkProfileQRCode(blob);
      
      if (qrData.success) {
        setSuccess(true);
        setError("");
        setDebugInfo("QR code valide trouvé!");
        
        setTimeout(() => {
          navigate('/preorder-success', { 
            state: { 
              profile: qrData.profile,
              scanType: "qr" 
            } 
          });
        }, 1000);
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

  // Initialisation
  useEffect(() => {
    isMountedRef.current = true;
    
    const initCamera = async () => {
      if (!isMountedRef.current) return;
      
      console.log("🚀 Initialisation Preorder");
      setDebugInfo("Initialisation...");
      
      // Tester la connexion
      const isAvailable = await testCameraConnection();
      setCameraAvailable(isAvailable);
      
      if (!isAvailable) {
        console.log("⚠️ Caméra PI non disponible, fallback immédiat");
        setUseFallback(true);
        setError("Caméra non disponible - Mode fallback activé");
        return;
      }
      
      console.log("✅ Caméra disponible, démarrage...");
      setDebugInfo("Caméra OK - Démarrage...");
      
      // Démarrer le streaming
      const started = await startVideoStream();
      
      if (started) {
        console.log("✅ Streaming démarré, lancement du scan");
        setDebugInfo("Streaming actif - Scan en cours...");
        
        // Délai avant de commencer le scan
        setTimeout(() => {
          if (isMountedRef.current && isStreamingRef.current) {
            startProfileScanning();
          }
        }, 2000);
      } else {
        console.log("❌ Échec streaming, fallback");
        setUseFallback(true);
        setError("Échec du streaming - Mode fallback");
      }
    };

    // Délai avant initialisation pour laisser le composant se monter
    setTimeout(initCamera, 500);

    return () => {
      console.log("🔴 Composant démonté");
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const handleGoBack = () => {
    cleanup();
    navigate('/cart');
  };

  return (
    <div style={{ backgroundColor: '#F8E6EA' }} className={`min-h-screen w-full flex flex-col items-center justify-start`}>
      
      {/* Header */}
      <div className="w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button ref={goBackButtonRef}
            {...createVoiceOverHandlers(speak)}
            onClick={handleGoBack}
            className="text-black text-lg flex items-center gap-3"
          >
            <config.icons.arrowLeft />
            <span className="text-xl font-semibold">Commander et récupérer plus tard</span>
          </button>
        </div>
        <img src={config.icons.logo} alt="Logo Pharmaxcess" className="h-8 mr-4" />
      </div>

      {/* Central content */}
      <div className="w-full flex flex-col items-center justify-center mt-8 px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mb-8">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
            <config.icons.qrCode className="text-2xl" />
          </div>
          <p className={`${config.fontSizes.md} text-black mb-4`}>
            Veuillez scanner votre QR code de profil
          </p>
          <p className={`${config.fontSizes.sm} text-black mb-6`}>
            PharmaXcess afin de vous recontacter lors de la disponibilité de votre commande
          </p>
        </div>

        {/* Zone de scan - Version conditionnelle */}
        {useFallback ? (
          // Fallback
          <div className="w-full max-w-2xl mb-8">
            <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '400px' }}>
              <QrCameraScanner 
                onFrame={handleFallbackScan}
                overlaySize={360}
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
          <div className="w-full max-w-2xl mb-8">
            <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '400px' }}>
              <img
                ref={imgRef}
                className="w-full h-full object-contain"
                alt="Scan QR code de profil en direct"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error("❌ Erreur image");
                  setUseFallback(true);
                }}
              />
              
              <div className="absolute inset-0 border-3 border-green-400 pointer-events-none flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-black bg-opacity-70 px-6 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaSync className="text-green-400 animate-spin" />
                      <span className="text-green-400 font-semibold">
                        {cameraAvailable ? 'Scan en cours' : 'Connexion...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                {cameraAvailable ? `Capture #${scanCount}` : 'Test...'}
              </div>
              
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                {cameraAvailable ? (streaming ? 'Caméra active' : 'Inactif') : 'Connexion...'}
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                {cameraAvailable 
                  ? "Positionnez votre QR code dans le cadre vert" 
                  : "Connexion à la caméra en cours..."}
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
              Profil détecté avec succès !
            </div>
          </div>
        )}

        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded">
          <div><strong>Debug:</strong> {debugInfo}</div>
          <div><strong>Mode:</strong> {useFallback ? 'Fallback' : 'Caméra PI'}</div>
          <div><strong>Statut:</strong> {cameraAvailable ? 'Connecté' : 'Non connecté'} | Stream: {streaming ? 'Actif' : 'Inactif'}</div>
        </div>

        {/* Bouton d'annulation */}
        <button
          onClick={handleGoBack}
          className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition shadow mt-4"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default Preorder;