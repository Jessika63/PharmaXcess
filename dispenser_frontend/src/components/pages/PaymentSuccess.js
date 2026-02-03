import config from '../../config';
import React, { useEffect, useState, useRef } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { FaCreditCard } from 'react-icons/fa';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers'; 


const PaymentSuccess = () => {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.paymentSuccess);
  const { speak } = useVoiceOver();

    // Keyboard navigation
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate(); 
  const paymentIntent = location.state?.paymentIntent;
  const items = location.state?.items; 

  // Automatic redirection to Medication Delivery page
  useEffect(() => { 
    const timer = setTimeout(() => { 
      navigate('/medication-delivery', { 
        state: {
          cartItems: items, 
          paymentId: paymentIntent?.id
        }
      });
    }, 5000); 

    return () => clearTimeout(timer); 
  }, [navigate, items, paymentIntent]); 





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
    <div className="w-full min-h-screen flex flex-col bg-background_color">
      
      
      {/* Header */}
      <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <Link ref={el => buttonRefs.current[0] = el} to="/cart"
            className="flex items-center text-black hover:text-gray-600 transition-colors"
            {...createVoiceOverHandlers(speak)}>
            <config.icons.arrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-semibold text-black">Paiement</h1>
        </div>
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className="bg-white rounded-full p-10 mb-8 shadow-lg">
          <FaCreditCard className="text-7xl text-gray-700" />
        </div>

        {/* Text */}
        <h2 className="text-4xl font-bold text-black mb-4">Paiement effectué</h2>
        <p className="text-2xl text-gray-600">Votre paiement a été traité avec succès</p>

        {paymentIntent && (
          <p className="text-lg text-gray-400 mt-6">
            Référence: {paymentIntent.id}
          </p>
        )}
        {/* Redirect message  */}

        <p className="text-lg text-gray-500 mt-8">
          Redirection vers la délivrance des médicaments...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
