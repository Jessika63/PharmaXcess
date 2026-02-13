import React, { useState, useEffect, useRef } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';
import { useCart } from '../../context/CartContext';

function PreorderSuccess() {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.preorderSuccess);
  const { speak } = useVoiceOver();

    // Keyboard navigation
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefs = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;
  const { clearCart } = useCart();
  
  // Clear cart when component mounts (preorder completed)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
    <div style={{ backgroundColor: '#F8E6EA' }} className="min-h-screen w-full flex flex-col items-center justify-start">
      
      
      {/* Header */}
      <div className="w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button ref={el => buttonRefs.current[0] = el} {...createVoiceOverHandlers(speak)}
            onClick={() => navigate('/cart')}
            className="text-black text-lg flex items-center gap-3"
          >
            <config.icons.arrowLeft />
            <span className="text-xl font-semibold">Commander et récupérer plus tard</span>
          </button>
        </div>
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-8 mr-4" />
      </div>

      {/* Content */}
      <div className="w-full flex flex-col items-center justify-center mt-12 px-6">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6">
          <config.icons.check className="text-2xl text-black" />
        </div>

        <h2 className="text-2xl font-bold text-black mb-4">Scan terminé</h2>
        <p className="text-center text-black max-w-2xl mb-8">
          Nous avons bien récupéré vos informations, nous vous recontacterons lorsque votre commande sera disponible
        </p>

        <button ref={el => buttonRefs.current[1] = el} {...createVoiceOverHandlers(speak)}
            onClick={() => navigate('/non-prescription-drugs')}
          className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300"
        >
          TERMINER
        </button>
      </div>
    </div>
  );
}

export default PreorderSuccess;
