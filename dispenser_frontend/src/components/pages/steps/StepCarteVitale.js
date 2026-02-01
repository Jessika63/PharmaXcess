import React, { useState, useRef, useEffect } from "react";
import { useAutoVoiceOver, useVoiceOver } from '../../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../../config/voiceOverTexts';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers'; 
import { useNavigate } from "react-router-dom";
import CameraComponent from "../../camera_component";
import config from "../../../config";
import { usePrescription } from "../../../context/PrescriptionContext";

function StepCarteVitale({ goToNextStep, goBackStep }) {
  useAutoVoiceOver(voiceOverTexts.scanCarteVitale);
  const { speak } = useVoiceOver();
  const { updatePrescriptionData } = usePrescription();
  const navigate = useNavigate();

  const [showCamera, setShowCamera] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null, "valid", "skipped"

  // Keyboard navigation - 3 éléments: back + 2 cartes
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef([]);
  const backButtonSelectionRef = useRef(null);
  const backButtonCameraRef = useRef(null);

  const openCamera = () => {
    setShowCamera(true);
    setError('');
    setSuccess(false);
  };

  const closeCamera = () => {
    setShowCamera(false);
    setError('');
  };

  // Fonction pour valider sans vérification
  const skipVerification = () => {
    const carteData = {
      extractedText: 'Validé sans vérification',
      numeroSecu: '',
      nom: '',
      prenom: '',
      skipped: true
    };
    
    updatePrescriptionData({ carteVitale: carteData });
    localStorage.setItem('carteVitale', JSON.stringify(carteData));
    
    setValidationStatus("skipped");
    setSuccess(true);
    setTimeout(() => {
      goToNextStep();
    }, 500);
  };

  const handlePhotoCaptured = async (base64Image) => {
    try {
      setLoading(true);
      setError('');

      const byteString = atob(base64Image.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      formData.append("doc_type", "CV");

      const response = await fetch(`${config.backendUrl}/extractText`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const carteData = {
          extractedText: data.extracted_text || '',
          numeroSecu: data.numero_secu || '',
          nom: data.nom || '',
          prenom: data.prenom || '',
          skipped: false
        };
        
        updatePrescriptionData({ carteVitale: carteData });
        localStorage.setItem('carteVitale', JSON.stringify(carteData));
        
        setValidationStatus("valid");
        setSuccess(true);
        setTimeout(() => {
          goToNextStep();
        }, 1000);
      } else {
        setError(data.error || "Erreur lors de l'analyse de la carte vitale");
        setLoading(false);
      }
    } catch (error) {
      setError("Erreur lors de l'analyse de la carte vitale");
      setLoading(false);
      console.error("Erreur client:", error);
    }
  };

  // Keyboard navigation for selection page (back button + 2 cartes)
  useEffect(() => {
    if (!showCamera) {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
            setFocusedIndex((prev) => (prev + 1) % 3); // 3 éléments: back + 2 cartes
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
            setFocusedIndex((prev) => (prev - 1 + 3) % 3);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedIndex === 0 && backButtonSelectionRef.current) {
            backButtonSelectionRef.current.click();
          } else if (focusedIndex === 1 && buttonRefs.current[0]) {
            buttonRefs.current[0].click();
          } else if (focusedIndex === 2 && buttonRefs.current[1]) {
            buttonRefs.current[1].click();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedIndex, showCamera]);

  // Keyboard navigation for camera view
  useEffect(() => {
    if (showCamera) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (backButtonCameraRef.current) {
            backButtonCameraRef.current.click();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showCamera]);

  // Focus management for selection page
  useEffect(() => {
    if (!showCamera) {
      if (focusedIndex === 0 && backButtonSelectionRef.current) {
        backButtonSelectionRef.current.focus();
      } else if (focusedIndex === 1 && buttonRefs.current[0]) {
        buttonRefs.current[0].focus();
      } else if (focusedIndex === 2 && buttonRefs.current[1]) {
        buttonRefs.current[1].focus();
      }
    }
  }, [focusedIndex, showCamera]);

  return (
    <div className="w-full h-screen flex flex-col">
      {showCamera ? (
        // Camera View (inchangé)
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button onClick={closeCamera}
                ref={backButtonCameraRef}
                tabIndex={0}
                className="flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg"
                {...createVoiceOverHandlers(speak)}>
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan carte vitale</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mb-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
                <config.icons.addressCard className="text-3xl text-black" />
              </div>
              <p className="text-xl text-black font-semibold">
                Prenez une photo de votre carte vitale
              </p>
            </div>

            {!success && (
              <div className="w-full max-w-2xl h-[400px]">
                <CameraComponent onPhotoCapture={handlePhotoCaptured} />
              </div>
            )}

            {loading && (
              <p className="text-gray-700 font-medium text-xl animate-pulse mt-8">Analyse en cours, veuillez patienter...</p>
            )}

            {error && (
              <div className="text-red-600 font-semibold text-lg mt-8 max-w-md">{error}</div>
            )}

            {success && validationStatus === "valid" && (
              <div className="text-green-600 font-semibold text-xl mt-8 max-w-md">Carte vitale validée avec succès !</div>
            )}
          </div>
        </>
      ) : (
        // Selection Page - MODIFIÉ: 2 cartes côte à côte
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button onClick={goBackStep}
                ref={backButtonSelectionRef}
                tabIndex={0}
                className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                  ${focusedIndex === 0 ? 'ring-2 ring-pink-300' : ''}`}
                {...createVoiceOverHandlers(speak)}>
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan carte vitale</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Choisissez comment valider votre carte vitale
            </h2>

            {/* DEUX CARTES CÔTE À CÔTE */}
            <div className="flex gap-8 max-w-5xl w-full mb-8">
              {/* Carte 1: Vérifier avec photo */}
              <div className={`flex-1 bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-lg min-h-[380px] transition-all
                ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.addressCard className="text-3xl text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Vérifier</h3>
                <p className="text-lg text-gray-600 mb-8 flex-1">
                  Prenez une photo de votre carte vitale pour la vérifier
                </p>
                {validationStatus === "valid" && (
                  <p className="text-green-600 font-semibold mb-4">✔ Vérifiée</p>
                )}
                <button onClick={openCamera}
                  ref={el => buttonRefs.current[0] = el}
                  tabIndex={0}
                  className={`bg-black text-white px-10 py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${focusedIndex === 1 ? 'scale-105' : ''}`}
                  {...createVoiceOverHandlers(speak)}>
                  PRENDRE EN PHOTO
                </button>
              </div>

              {/* Carte 2: Passer sans vérification */}
              <div className={`flex-1 bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-lg min-h-[380px] transition-all
                ${focusedIndex === 2 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <div className="text-3xl text-black font-bold">→</div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Passer</h3>
                <p className="text-lg text-gray-600 mb-8 flex-1">
                  Validez sans vérification si vous n'avez pas de carte vitale
                </p>
                {validationStatus === "skipped" && (
                  <p className="text-blue-600 font-semibold mb-4">✓ Passée</p>
                )}
                <button onClick={skipVerification}
                  ref={el => buttonRefs.current[1] = el}
                  tabIndex={0}
                  className={`bg-black text-white px-10 py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${focusedIndex === 1 ? 'scale-105' : ''}`}
                  {...createVoiceOverHandlers(speak)}>
                  PASSER
                </button>
              </div>
            </div>

            {/* Messages d'état */}
            {loading && ( 
              <p className="text-gray-700 font-medium animate-pulse mt-6"> 
                Analyse en cours, veuillez patienter...
              </p>
            )}
            {error && ( 
              <div className="text-red-600 font-semibold mt-6">{error}</div> 
            )}
            
            {/* Message quand validée */}
            {validationStatus && (
              <div className={`font-semibold text-xl mt-4 ${validationStatus === "valid" ? 'text-green-600' : 'text-blue-600'}`}>
                {validationStatus === "valid" 
                  ? "✓ Carte vitale vérifiée" 
                  : "✓ Étape passée sans vérification"}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StepCarteVitale;