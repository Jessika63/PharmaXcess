import React, { useState, useRef, useEffect } from "react";
import { useAutoVoiceOver, useVoiceOver } from '../../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../../config/voiceOverTexts';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers'; 
import { useNavigate } from "react-router-dom";
import CameraComponent from "../../camera_component";
import config from "../../../config";
import { usePrescription } from "../../../context/PrescriptionContext";

function StepCarteVitale({ goToNextStep, goBackStep }) {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.scanCarteVitale);
  const { speak } = useVoiceOver();

  const { updatePrescriptionData } = usePrescription();
  const navigate = useNavigate();

  const [showCamera, setShowCamera] = useState(false); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Keyboard navigation
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
        // Save the carte vitale data
        const carteData = {
          extractedText: data.extracted_text || '',
          numeroSecu: data.numero_secu || '',
          nom: data.nom || '',
          prenom: data.prenom || ''
        };
        
        updatePrescriptionData({ carteVitale: carteData });
        localStorage.setItem('carteVitale', JSON.stringify(carteData));
        
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

  // Keyboard navigation for selection page (back button + photo button)
  useEffect(() => {
    if (!showCamera) {
      const handleKeyDown = (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey) || (event.key === "Tab" && event.shiftKey)) {
          event.preventDefault();
          if (event.key === "ArrowRight" || event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
            setFocusedIndex((prevIndex) => (prevIndex + 1) % 2);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
            setFocusedIndex((prevIndex) => (prevIndex - 1 + 2) % 2);
          }
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (focusedIndex === 0 && backButtonSelectionRef.current) {
            backButtonSelectionRef.current.click();
          } else if (focusedIndex === 1 && buttonRefs.current[0]) {
            buttonRefs.current[0].click();
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [focusedIndex, showCamera]);
  // Keyboard navigation for camera view - Only Escape key for back button (CameraComponent handles its own buttons)
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
      }
    }
  }, [focusedIndex, showCamera]);

  // Focus management for camera view - CameraComponent handles its own focus
  useEffect(() => {
    if (showCamera && backButtonCameraRef.current) {
      // Set initial focus on back button, but don't manage it further
      // CameraComponent will take over focus management for its buttons
    }
  }, [showCamera]);

  return (
    <div className="w-full h-screen flex flex-col">
      
      
      {showCamera ? (
        // Camera View
        <>
          {/* Header */}
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

          {/* Camera Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mb-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
                <config.icons.addressCard className="text-3xl text-black" />
              </div>
              <p className="text-xl text-black font-semibold">
                Prenez une photo de votre carte vitale
              </p>
            </div>

            {/* Camera Component */}
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

            {success && (
              <div className="text-green-600 font-semibold text-xl mt-8 max-w-md">Carte vitale validée avec succès !</div>
            )}
          </div>
        </>
      ) : (
        // Selection Page
        <>
          {/* Header */}
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button onClick={goBackStep}
                ref={backButtonSelectionRef}
                tabIndex={0}
                className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                  ${focusedIndex === 0 && !showCamera ? 'ring-2 ring-pink-300' : ''}`}
            {...createVoiceOverHandlers(speak)}>
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan carte vitale</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Validez votre carte vitale
            </h2>

            {/* Card */}
            <div className="max-w-2xl w-full mb-8">
              <div className={`bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px] transition-all
                ${focusedIndex === 1 && !showCamera ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.addressCard className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Carte Vitale</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Prenez une photo de votre carte vitale
                </p>
                <button onClick={openCamera}
                  ref={el => buttonRefs.current[0] = el}
                  tabIndex={0}
                  className={`bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${focusedIndex === 1 && !showCamera ? 'scale-105' : ''}`}
            {...createVoiceOverHandlers(speak)}>
                  PRENDRE EN PHOTO
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StepCarteVitale;
