
import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentIntent = location.state?.paymentIntent;

  const [focusedIndex, setFocusedIndex] = useState(0);
  const medListRef = useRef(null);
  const homeRef = useRef(null);

  // Gestion du focus
  useEffect(() => {
    if (focusedIndex === 0 && medListRef.current) {
      medListRef.current.focus();
    } else if (focusedIndex === 1 && homeRef.current) {
      homeRef.current.focus();
    }
  }, [focusedIndex]);

  // Navigation au clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
        setFocusedIndex(prev => (prev - 1 + 2) % 2);
      } else if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
        setFocusedIndex(prev => (prev + 1) % 2);
      } else if (event.key === "Enter") {
        if (focusedIndex === 0) {
          navigate('/non-prescription-drugs');
        } else if (focusedIndex === 1) {
          navigate('/');
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, navigate]);

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${config.padding.container} bg-background_color`}>
      <div className="w-full flex justify-center mb-8">
        <img
          src={config.icons.logo}
          alt="Logo PharmaXcess"
          className="w-72 h-auto opacity-90"
        />
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className={`${config.padding.modal} text-center bg-white rounded-2xl ${config.shadows.lg} p-12 max-w-3xl`}>
          <div className="text-green-500 text-8xl mb-6">✓</div>
          <h1 className={`${config.fontSizes.xxl} font-bold ${config.textColors.primary} mb-4`}>
            Paiement Réussi!
          </h1>

          <div className={`${config.fontSizes.xl} mb-12`}>
            <p className="mb-4">Merci pour votre achat chez PharmaXcess</p>
            {paymentIntent && (
              <p className={`${config.fontSizes.md} text-gray-600`}>
                Référence: {paymentIntent.id}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              ref={medListRef}
              tabIndex={focusedIndex === 0 ? 0 : -1}
              className={`${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${focusedIndex === 0 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''} flex items-center justify-center`}
              onClick={() => navigate('/non-prescription-drugs')}
            >
              <config.icons.pills className="mr-2" /> Liste des médicaments
            </button>
            <button
              ref={homeRef}
              tabIndex={focusedIndex === 1 ? 0 : -1}
              className={`${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${focusedIndex === 1 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''} flex items-center justify-center`}
              onClick={() => navigate('/')}
            >
              <config.icons.home className="mr-2" /> Accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
