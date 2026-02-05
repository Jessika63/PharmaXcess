
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

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  // Auto-play VoiceOver
  const { speak } = useVoiceOver();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [scanType, setScanType] = useState(null); // 'qr' or 'prescription'
  const [showQRScanner, setShowQRScanner] = useState(false); // for displaying the QR scan page 
  const [showPrescriptionScanner, setShowPrescriptionScanner] = useState(false); // for displaying the prescription scan page 
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

  const openCamera = (type) => {
    setScanType(type);
    if (type === 'qr') {
      // Display the QR scan page instead of modal
      setShowQRScanner(true); 
      setError("");
      setSuccess(false);
    } else { 
      // Display the prescription scan modal
      setShowPrescriptionScanner(true); 
      setError("");
      setSuccess(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCamera(false);
    setScanType(null);
  };

  // Fonction pour vérifier si l'image contient un QR code (avec jsQR frontend + conversion N&B)
  const checkQRCode = async (blob) => {
    return new Promise((resolve) => {
      console.log("🔍 === DÉBUT checkQRCode (ordonnance) ===");
      console.log("📦 Blob reçu:", blob.size, "bytes");
      
      const img = new Image();
      const blobUrl = URL.createObjectURL(blob);
      
      img.onload = () => {
        console.log("🖼️ Image chargée:", img.width, "x", img.height);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // CONVERSION NOIR & BLANC pour détecter QR codes colorés (rose/noir, bleu/rouge, etc)
        console.log("🎨 Conversion en noir & blanc pour QR coloré...");
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Luminosité moyenne
          const brightness = (r + g + b) / 3;
          
          // Seuil adaptatif : si clair (rose/blanc) -> blanc, si foncé (noir) -> noir
          const threshold = brightness > 128 ? 255 : 0;
          
          data[i] = threshold;     // R
          data[i + 1] = threshold; // G
          data[i + 2] = threshold; // B
        }
        
        console.log("🔎 Décodage QR avec jsQR (après conversion N&B)...");
        
        const code = jsQR(data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth", // Essayer normal ET inversé
        });
        
        URL.revokeObjectURL(blobUrl);
        
        if (code) {
          console.log("✅ QR code décodé:", code.data);
          
          const qrContent = code.data.trim();
          console.log("🔐 Contenu crypté, longueur:", qrContent.length);
          
          // Décrypter via backend
          fetch(`${config.backendUrl}/read_prescription_qr_content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: qrContent })
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then(data => {
              console.log("✅ Ordonnance décryptée:", data);
              resolve({ success: true, ...data });
            })
            .catch(err => {
              console.error("❌ Erreur décryptage:", err);
              resolve({ success: false, error: "Impossible de décrypter le QR code" });
            });
        } else {
          console.log("❌ Aucun QR code détecté");
          resolve({ success: false, error: "Aucun QR code trouvé" });
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

  // Fonction pour extraire le texte d'une ordonnance classique
  const extractPrescriptionText = async (blob) => {
    try {
      const docCode = "P";
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      formData.append("doc_type", docCode);

      const response = await fetch(`${config.backendUrl}/extractText`, {
        method: "POST",
        body: formData,
      });

      return await response.json();
    } catch (err) {
      console.error("Erreur lors de l'extraction de texte:", err);
      return { success: false, error: err.message };
    }
  };

const handlePhotoCaptured = async (base64Image) => {
  closeModal();
  try {
    setLoading(true);
    setError("");
    setExtractedText("");

    const byteString = atob(base64Image.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/jpeg" });

    if (scanType === 'qr') {
      // Traitement pour QR code
      const qrData = await checkQRCode(blob);

      if (qrData.success) {
        // Si un QR code valide est détecté
        setHasQRCode(true);

        // Transformer les données du QR code pour correspondre au format attendu
        const medicaments = qrData.prescription?.content?.map((med, index) => ({
          id: index + 1,
          nom: med.split(' - ')[0] || `Médicament ${index + 1}`,
          posologie: med.split(' - ')[1] || med
        })) || [];

        // Mettre à jour le contexte de prescription avec les données du QR code
        updatePrescriptionData({
          medicaments: medicaments,
          scanType: 'qr',
          hasQRCode: true,
          rawData: qrData.prescription,
          extractedText: ''
        });

        goToNextStep({ hasQRCode: true });
        return;
      } else {
        setError("Aucun QR code valide détecté. Veuillez réessayer ou scanner l'ordonnance.");
      }
    } else if (scanType === 'prescription') {
      // Traitement pour ordonnance classique
      const data = await extractPrescriptionText(blob);

      if (data.success) {
        setExtractedText(data.raw_text || "");
        
        // Mettre à jour le contexte de prescription avec les données de l'ordonnance
        updatePrescriptionData({
          medicaments: data.infos?.medicaments || [],
          scanType: 'prescription',
          hasQRCode: false,
          extractedText: data.raw_text || '',
          rawData: data.infos
        });
        
        goToNextStep();
      } else {
        setError(data.error || "Erreur lors de l'analyse de l'ordonnance");
      }
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Keyboard navigation for selection page (back button + 2 cards)
  useEffect(() => {
    if (!showQRScanner && !showPrescriptionScanner) {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
            setFocusedIndex((prev) => (prev + 1) % 3);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
            setFocusedIndex((prev) => (prev - 1 + 3) % 3);
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

  // Keyboard navigation for prescription scanner (back button + LANCER LE SCAN button)
  useEffect(() => {
    if (showPrescriptionScanner) {
      const handleKeyDown = (e) => {
        const maxIndex = (!loading && !success) ? 1 : 0; // 0 = back, 1 = scan button (if not loading/success)
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
            setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedIndex === 0 && backButtonPrescriptionRef.current) {
            backButtonPrescriptionRef.current.click();
          } else if (focusedIndex === 1 && scanButtonRef.current) {
            scanButtonRef.current.click();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPrescriptionScanner, loading, success, focusedIndex]);

  // Keyboard navigation for QR scanner (back button only)
  useEffect(() => {
    if (showQRScanner) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (backButtonQRRef.current) {
            backButtonQRRef.current.click();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showQRScanner]);

  // Focus management for prescription scanner
  useEffect(() => {
    if (showPrescriptionScanner) {
      if (focusedIndex === 0 && backButtonPrescriptionRef.current) {
        backButtonPrescriptionRef.current.focus();
      } else if (focusedIndex === 1 && !loading && !success && scanButtonRef.current) {
        scanButtonRef.current.focus();
      }
    }
  }, [showPrescriptionScanner, focusedIndex, loading, success]);

  // Focus management for QR scanner
  useEffect(() => {
    if (showQRScanner && backButtonQRRef.current) {
      backButtonQRRef.current.focus();
    }
  }, [showQRScanner]);

  // Focus management for selection page
  useEffect(() => {
    if (!showQRScanner && !showPrescriptionScanner) {
      if (focusedIndex === 0 && backButtonSelectionRef.current) {
        backButtonSelectionRef.current.focus();
      } else if (buttonRefs.current[focusedIndex - 1]) {
        buttonRefs.current[focusedIndex - 1].focus();
      }
    }
  }, [focusedIndex, showQRScanner, showPrescriptionScanner]);

  return (
    <div className="w-full h-screen flex flex-col">
      
      
      {showQRScanner ? (
        // Scan QR Code Page
        <>
          {/* Header */}
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

          {/* QR Scanner Content */}
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

            {/* Embedded QR Scanner */}
            {!success && (
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

                        const medicaments = qrData.prescription?.content?.map((med, index) => ({
                          id: index + 1,
                          nom: med.split(' - ')[0] || `Médicament ${index + 1}`,
                          posologie: med.split(' - ')[1] || med
                        })) || [];

                        updatePrescriptionData({
                          medicaments: medicaments,
                          scanType: 'qr',
                          hasQRCode: true,
                          rawData: qrData.prescription,
                          extractedText: ''
                        });

                        // Little delay to show success message
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
            )}

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
        // Scan Prescription Page
        <>
          {/* Header */}
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button {...createVoiceOverHandlers(speak)}
            onClick={() => setShowPrescriptionScanner(false)}
                ref={backButtonPrescriptionRef}
                tabIndex={0}
                className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                  ${focusedIndex === 0 && showPrescriptionScanner ? 'ring-2 ring-pink-300' : ''}`}
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan ordonnance</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          {/* Prescription Scanner Content */}
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

            {/* Button to validate scan */}
            {!success && !loading && (
              <button 
            {...createVoiceOverHandlers(speak)}
                ref={scanButtonRef}
                tabIndex={0}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError('');

                    // Créer une image factice pour le backend actuel
                    // En attendant l'intégration du vrai scanner
                    const canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 480;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    canvas.toBlob(async (blob) => {
                      const data = await extractPrescriptionText(blob);

                      if (data.success) {
                        setSuccess(true);
                        setExtractedText(data.raw_text || "");
                        
                        updatePrescriptionData({
                          medicaments: data.infos?.medicaments || [],
                          scanType: 'prescription',
                          hasQRCode: false,
                          extractedText: data.raw_text || '',
                          rawData: data.infos
                        });

                        setTimeout(() => {
                          goToNextStep();
                        }, 1000);
                      } else {
                        setError(data.error || "Erreur lors de l'analyse de l'ordonnance");
                        setLoading(false);
                      }
                    }, 'image/jpeg');
                  } catch (err) {
                    console.error(err);
                    setError("Erreur lors du scan de l'ordonnance");
                    setLoading(false);
                  }
                }}
                className={`px-16 py-5 bg-black text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300
                  ${focusedIndex === 1 && showPrescriptionScanner ? 'ring-2 ring-pink-300 scale-105' : ''}`}
              >
                LANCER LE SCAN
              </button>
            )}

            {loading && (
              <p className="text-gray-700 font-medium text-xl animate-pulse mt-2">Scan en cours, veuillez patienter...</p>
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
        // Original Selection Page 
        <>
          {/* Header matching the image */}
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

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Choisissez la méthode pour scanner votre ordonnance
            </h2>

            {/* Two cards side by side */}
            <div className="flex gap-8 max-w-5xl w-full mb-8">
              {/* Ordonnance Card */}
              <div className={`flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px] transition-all
                ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.filePrescription className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Ordonnance</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner votre ordonnance
                </p>
                <button {...createVoiceOverHandlers(speak)}
            onClick={() => openCamera('prescription')}
                  ref={el => buttonRefs.current[0] = el}
                  tabIndex={focusedIndex === 1 ? 0 : -1}
                  aria-label="Ordonnance - Scanner votre ordonnance - CHOISIR"
                  className="bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300"
                >
                  <span className="sr-only">Ordonnance - </span>CHOISIR
                </button>
              </div>

              {/* QR Code Card */}
              <div className={`flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px] transition-all
                ${focusedIndex === 2 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.qrCode className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">QR code</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner le code qr de votre ordonnance
                </p>
                <button {...createVoiceOverHandlers(speak)}
            onClick={() => openCamera('qr')}
                  ref={el => buttonRefs.current[1] = el}
                  tabIndex={focusedIndex === 2 ? 0 : -1}
                  aria-label="QR code - Scanner le code qr de votre ordonnance - CHOISIR"
                  className="bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300"
                >
                  <span className="sr-only">QR code - </span>CHOISIR
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
              <div className="text-red-600 font-semibold mt-6">L'ordonnance n'est pas reconnue, veuillez réessayer.</div> 
            )}
          </div>
        </> 
      )} 



      {isModalOpen && showCamera && (
        <ModalCamera onClose={closeModal}>
          <CameraComponent onPhotoCapture={handlePhotoCaptured} />
        </ModalCamera>
      )}
    </div>
  );
}

export default StepOrdonnance;
