// src/pages/PaymentError.js
import React, { useState, useEffect, useRef } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { Link, useLocation } from 'react-router-dom';
import config from '../../config';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';

function PaymentError() {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.paymentError);
  const { speak } = useVoiceOver();

    // Keyboard navigation
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefs = useRef([]);

  const location = useLocation();
  const errorMessage = location.state?.errorMessage || "Désolé, une erreur s'est produite lors du traitement de votre paiement.";
  const fromPath = location.state?.from || '/non-prescription-drugs';

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            const maxIndex = buttonRefs.current.length - 1;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (buttonRefs.current[focusedIndex]) {
                        buttonRefs.current[focusedIndex].click();
                    }
                    break;
                default:
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex]);
    
    // Focus management
    useEffect(() => {
        if (buttonRefs.current[focusedIndex]) {
            buttonRefs.current[focusedIndex].focus();
        }
    }, [focusedIndex]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background_color">
      
      
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className={`${config.fontSizes.xxl} font-bold text-red-600 mb-4`}>
          Erreur de Paiement
        </h1>

        <div className={`${config.fontSizes.md} bg-red-100 text-red-700 p-4 rounded mb-8`}>
          {errorMessage}
        </div>

        <p className={`${config.fontSizes.xl} mb-8`}>
          Désolé, une erreur s'est produite lors du traitement de votre paiement.
          Veuillez réessayer ou contacter le support.
        </p>

        {/* Correct path usage */}
        <Link ref={el => buttonRefs.current[0] = el} to={fromPath}
          className={
            `${config.fontSizes.md} ${config.buttonColors.red} ${config.padding.button} ${config.borderRadius.md}
            ${config.shadows.md} ${config.transitions.default} hover:opacity-90`
          }
            {...createVoiceOverHandlers(speak)}>
          Retour aux médicaments
        </Link>
      </div>
    </div>
  );
}

export default PaymentError;
