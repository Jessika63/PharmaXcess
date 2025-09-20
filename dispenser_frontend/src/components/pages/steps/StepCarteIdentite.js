import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import CameraComponent from '../../camera_component';
import ModalCamera from '../../modal_camera';
import config from '../../../config';
import useInactivityRedirect from '../../../utils/useInactivityRedirect';

function StepCarteIdentite({ goToNextStep, goBackStep }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const [statusSides, setStatusSides] = useState({ R: null, V: null });
  const navigate = useNavigate();
      const focusedIndexRef = useRef(1);
  
  const [focusedIndex, setFocusedIndex] = useState(1);
  const buttonsRef = useRef([]);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

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
        console.error("Erreur API :", data.error);
      }
    } catch (error) {
      setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
      console.error("Erreur client:", error);
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
    if (statusSides[side] === "valid") {
      return <p className="text-green-600 font-semibold mt-2">✔ Vérifié</p>;
    }
    if (statusSides[side] === "invalid") {
      return <p className="text-red-600 font-semibold mt-2">❌ Refusé</p>;
    }
    return null;
  };


  const handleKeyDown = useCallback((event) => {
    if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % 4;
        focusedIndexRef.current = newIndex;
        return newIndex;
      });
    } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + 4) % 4;
        focusedIndexRef.current = newIndex;
        return newIndex;
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndexRef.current === 1) {
        openCameraForSide("verso")
      } else if (focusedIndexRef.current === 2) {
        navigate('/');
      } else if (focusedIndexRef.current === 3) {
        goBackStep()
      } else if (focusedIndexRef.current === 0) {
        openCameraForSide("recto")
      }
    }
  }, [navigate, openCameraForSide]);


  useInactivityRedirect(() => setShowInactivityModal(true));
  useEffect(() => {
    if (!showInactivityModal) {
      return;
    }
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

  useEffect(() => {
  }, [focusedIndex]);

  return (

    <div className="w-full h-full flex flex-col items-center bg-background_color">
      <div className="w-4/5 flex justify-between items-center mt-8 mb-6">


        <button
          ref={(el) => (buttonsRef.current[3] = el)}
          tabIndex={0}
          className={`
            px-6 py-3 ${config.borderRadius.lg} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.md} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
          `}
          onClick={goBackStep}
        >
          Retour
        </button>

        <button
          ref={(el) => (buttonsRef.current[2] = el)}
          tabIndex={0}
          className={`
            px-6 py-3 ${config.borderRadius.lg} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.md} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
          `}
          onClick={() => navigate("/")}
        >
          Menu
        </button>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center space-y-12">

        <h2 className={`text-2xl font-bold ${config.textColors.primary}`}>
          Scanner votre Carte d'Identité
        </h2>

        <div className="flex space-x-8">
          <div className="flex flex-col items-center">
            <button
              onClick={() => openCameraForSide('recto')}
              ref={(el) => (buttonsRef.current[0] = el)}
              tabIndex={0}
              className={`
              w-40 h-40 flex items-center justify-center
              ${config.borderRadius.xl} ${config.shadows.md}
              ${config.buttonColors.mainGradient} ${config.textColors.primary}
              ${config.fontSizes.lg} ${config.transitions.slow}
              ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
            `}
            >
              Recto
            </button>
            {renderStatus("R")}
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => openCameraForSide('verso')}
              ref={(el) => (buttonsRef.current[1] = el)}
              tabIndex={0}
              className={`
              w-40 h-40 flex items-center justify-center
              ${config.borderRadius.xl} ${config.shadows.md}
              ${config.buttonColors.mainGradient} ${config.textColors.primary}
              ${config.fontSizes.lg} ${config.transitions.slow}
              ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
            `}
            >
              Verso
            </button>
            {renderStatus("V")}
          </div>
        </div>

        {isModalOpen && showCamera && (
          <ModalCamera onClose={closeModal}>
            <CameraComponent onPhotoCapture={handlePhotoCaptured} />
          </ModalCamera>
        )}
      </div>
    </div>

  );
}

export default StepCarteIdentite;
