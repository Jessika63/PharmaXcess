import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import CameraComponent from '../../camera_component';
import ModalCamera from '../../modal_camera';
import config from '../../../config';
import useInactivityRedirect from '../../../utils/useInactivityRedirect';
import { FaPrint, FaCamera, FaIdCard, FaExclamationTriangle } from 'react-icons/fa';

function StepCarteIdentite({ goToNextStep, goBackStep }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const [statusSides, setStatusSides] = useState({ R: null, V: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const focusedIndexRef = useRef(1);
  const [focusedIndex, setFocusedIndex] = useState(1);
  const buttonsRef = useRef([]);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  // URLs
  const BACKEND_PC = "http://57.128.57.96:5000";

  // ==================== SCANNER PHYSIQUE ====================

  

  const openScanner = async (side) => {
  const docType = side === 'recto' ? 'R' : 'V';
  setCurrentDocType(docType);
  
  try {
    setLoading(true);
    setError("");
    console.log(`🖨️ Lancement scanner pour ${side} (${docType})...`);

    const formData = new FormData();
    formData.append("doc_type", docType);

    const res = await fetch(`${BACKEND_PC}/api/scanner/scan`, {
      method: "POST",
      body: formData
    });

    const responseText = await res.text();
    console.log("📋 Réponse brute:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Réponse non-JSON: ${responseText.substring(0, 100)}`);
    }

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${data.error || responseText}`);
    }

    if (!data.success) {
      // Vérifier le message d'erreur spécifique
      const errorMsg = data.error || "Échec du scan";
      console.error("❌ Erreur backend:", errorMsg);
      
      // Afficher un message plus explicite
      if (errorMsg.includes("recto") || errorMsg.includes("carte d'identité")) {
        setError(`Le document scanné ne semble pas être un recto valide. Vérifiez que :
          - La carte est bien orientée (face avant)
          - Le document est bien une carte d'identité française
          - La carte est correctement placée sur le scanner`);
      } else {
        setError(`Erreur: ${errorMsg}`);
      }
      
      setStatusSides(prev => ({ ...prev, [docType]: "invalid" }));
      return;
    }

    console.log("✅ Scan + OCR réussi:", data);

    // Mettre à jour le statut
    setStatusSides(prev => {
      const updated = { ...prev, [docType]: "valid" };
      if (updated.R === "valid" && updated.V === "valid") {
        setTimeout(() => goToNextStep(), 800);
      }
      return updated;
    });

  } catch (err) {
    console.error("❌ Erreur complète:", err);
    setError(`Échec du scan: ${err.message}`);
    setStatusSides(prev => ({ ...prev, [docType]: "invalid" }));
  } finally {
    setLoading(false);
  }
};

  // ==================== FONCTIONS EXISTANTES (CAMERA) ====================
  const openCameraForSide = (side) => {
    const docType = side === 'recto' ? 'R' : 'V';
    setCurrentDocType(docType);
    setShowCamera(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCamera(false);
  };

  const handlePhotoCaptured = async (base64Image) => {
    closeModal();

    try {
      const response = await fetch(`${config.backendUrl}/extractText`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append("image", base64ToBlob(base64Image), "photo.jpg");
          formData.append("doc_type", currentDocType);
          return formData;
        })(),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatusSides(prev => {
          const updated = { ...prev, [currentDocType]: "valid" };
          if (updated.R === "valid" && updated.V === "valid") {
            setTimeout(() => goToNextStep(), 800);
          }
          return updated;
        });
      } else {
        setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
        setError(data.error || "Erreur OCR");
      }
    } catch (error) {
      setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
      setError("Erreur de connexion");
    }
  };

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

  const renderStatus = (side) => {
    const docType = side === 'recto' ? 'R' : 'V';
    if (statusSides[docType] === "valid") {
      return <p className="text-green-600 font-semibold mt-2">✔ Vérifié</p>;
    }
    if (statusSides[docType] === "invalid") {
      return <p className="text-red-600 font-semibold mt-2">❌ Refusé</p>;
    }
    return null;
  };

  // ==================== GESTION CLAVIER ====================
  const handleKeyDown = useCallback((event) => {
    if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % 8; // 8 boutons maintenant
        focusedIndexRef.current = newIndex;
        return newIndex;
      });
    } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + 8) % 8;
        focusedIndexRef.current = newIndex;
        return newIndex;
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      const index = focusedIndexRef.current;
      
      // Mapping des boutons
      if (index === 0) openScanner("recto");
      else if (index === 1) openCameraForSide("recto");
      else if (index === 2) openScanner("verso");
      else if (index === 3) openCameraForSide("verso");
      else if (index === 6) navigate('/');
      else if (index === 7) goBackStep();
    }
  }, [navigate, goBackStep]);

  // ==================== HOOKS ====================
  useInactivityRedirect(() => setShowInactivityModal(true));
  
  useEffect(() => {
    if (!showInactivityModal) return;
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (buttonsRef.current[focusedIndex]) {
      buttonsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // ==================== RENDER ====================
  return (
    <div className="w-full h-full flex flex-col items-center bg-background_color p-6">
      {/* En-tête */}
      <div className="w-full flex justify-between items-center mb-8">
        <button
          ref={(el) => (buttonsRef.current[7] = el)}
          tabIndex={0}
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
          onClick={goBackStep}
        >
          Retour
        </button>

        <button
          ref={(el) => (buttonsRef.current[6] = el)}
          tabIndex={0}
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
          onClick={() => navigate("/")}
        >
          Menu
        </button>
      </div>

      {/* Titre */}
      <h1 className={`${config.fontSizes["2xl"]} font-bold text-primary mb-2`}>
        Scanner votre Carte d'Identité
      </h1>
      <p className="text-gray-600 mb-10">
        Utilisez le scanner ou la caméra pour le recto et le verso
      </p>

      {/* BOUTONS RECT/VERSO AVEC SCANNER */}
      <div className="flex flex-col space-y-12 w-full max-w-4xl">
        
        {/* RECTO */}
        <div className="w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Recto de la carte
          </h3>
          
          <div className="flex justify-center space-x-12">
            {/* Scanner physique */}
            <div className="flex flex-col items-center">
              <button
                ref={(el) => (buttonsRef.current[0] = el)}
                onClick={() => openScanner('recto')}
                disabled={loading}
                className={`
                  w-56 h-56 flex flex-col items-center justify-center
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
                {loading && currentDocType === 'R' && (
                  <span className="text-xs mt-2 text-yellow-600 animate-pulse">
                    Scan en cours...
                  </span>
                )}
              </button>
              {renderStatus("recto")}
            </div>

          </div>
        </div>

        {/* VERSO */}
        <div className="w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Verso de la carte
          </h3>
          
          <div className="flex justify-center space-x-12">
            {/* Scanner physique */}
            <div className="flex flex-col items-center">
              <button
                ref={(el) => (buttonsRef.current[2] = el)}
                onClick={() => openScanner('verso')}
                disabled={loading}
                className={`
                  w-56 h-56 flex flex-col items-center justify-center
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
                {loading && currentDocType === 'V' && (
                  <span className="text-xs mt-2 text-yellow-600 animate-pulse">
                    Scan en cours...
                  </span>
                )}
              </button>
              {renderStatus("verso")}
            </div>

          </div>
        </div>
      </div>

      {/* Messages d'état */}
      <div className="mt-8 max-w-2xl w-full">
        {loading && (
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
                  {currentDocType === 'R' || currentDocType === 'V' ? "Erreur scanner" : "Erreur traitement"}
                </p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statut global */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold text-gray-700 mb-2">Progression:</h4>
          <div className="flex items-center justify-center space-x-8">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full mb-1 ${statusSides.R === "valid" ? 'bg-green-500' : statusSides.R === "invalid" ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-600">Recto</span>
              {statusSides.R === "valid" && <span className="text-xs text-green-600">✓</span>}
              {statusSides.R === "invalid" && <span className="text-xs text-red-600">✗</span>}
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full mb-1 ${statusSides.V === "valid" ? 'bg-green-500' : statusSides.V === "invalid" ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-600">Verso</span>
              {statusSides.V === "valid" && <span className="text-xs text-green-600">✓</span>}
              {statusSides.V === "invalid" && <span className="text-xs text-red-600">✗</span>}
            </div>
          </div>
          {statusSides.R === "valid" && statusSides.V === "valid" && (
            <p className="mt-3 text-center text-green-600 font-semibold">
              ✅ Carte d'identité complète, vous pouvez continuer
            </p>
          )}
        </div>
      </div>

      {/* MODAL POUR CAMERA (inchangé) */}
      {isModalOpen && showCamera && (
        <ModalCamera onClose={closeModal}>
          <CameraComponent onPhotoCapture={handlePhotoCaptured} />
        </ModalCamera>
      )}
    </div>
  );
}

export default StepCarteIdentite;