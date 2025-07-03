import React, { useRef, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';

function StartingPage() {
  const prescriptionButtonRef = useRef(null);
  const nonPrescriptionButtonRef = useRef(null);
  
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event) => {
    if (event.key === "ArrowRight") {
      setFocusedIndex((prevIndex) => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowLeft") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndex === 0) {
        navigate('/documents-checking');
      } else if (focusedIndex === 1) {
        navigate('/non-prescription-drugs');
      }
    }
  }, [focusedIndex, navigate]);

  useEffect(() => {
    const refs = [prescriptionButtonRef, nonPrescriptionButtonRef];
    if (refs[focusedIndex] && refs[focusedIndex].current) {
      refs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={`bg-background_color w-full min-h-screen flex flex-col justify-center items-center overflow-hidden`}>
      {/* Header */}
      <div className="w-4/5 h-40 flex justify-center items-center mb-12">
        {/* Logo */}
        <div className="flex justify-center items-center w-full">
          <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-96 h-24" />
        </div>
      </div>

      {/* Container for centering both buttons */}
      <div className={`flex flex-col items-center ${config.spacing.xxl} w-full`}>

        {/* Button 'Médicaments sous ordonnance' */}
        <Link to="/documents-checking" className="w-full flex justify-center">
          <div
            ref={prescriptionButtonRef}
            tabIndex={0}
            className={`w-2/5 h-40 flex items-center justify-center ${config.borderRadius.xl} ${config.shadows.md} 
              ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.xl}
              ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.ring}
              ${focusedIndex === 0 ? config.scaleEffects.focus : ''}`}
          >
            <config.icons.prescription className="mr-6" />
            Médicaments avec ordonnance
          </div>
        </Link>

        {/* Button 'Médicaments sans ordonnance' */}
        <Link to="/non-prescription-drugs" className="w-full flex justify-center">
          <div
            ref={nonPrescriptionButtonRef}
            tabIndex={0}
            className={`w-2/5 h-40 flex items-center justify-center ${config.borderRadius.xl} ${config.shadows.md} 
              ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.xl}
              ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.ring}
              ${focusedIndex === 1 ? config.scaleEffects.focus : ''}`}
          >
            <config.icons.pills className="mr-6" />
            Médicaments sans ordonnance
          </div>
        </Link>
  
      </div>
    </div>
  );
  
}

export default StartingPage;
