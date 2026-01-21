import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import '../../App.css'
import config from '../../config';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

function InsufficientStock() {

  const navigate = useNavigate()
  const location = useLocation();

  // Get medication information from navigation
  const drug = location.state?.drug || { label: 'Médicament', price: 0 }; 

  const retryButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const goBackButtonRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  useInactivityRedirect(() => setShowInactivityModal(true));

  // Inactivity modal
  useEffect(() => {
    if (!showInactivityModal) {
      return;
    }
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  // Main buttons navigation
  const buttonRefs = useMemo(() => [goBackButtonRef, retryButtonRef, cancelButtonRef], []);
  const buttonCount = buttonRefs.length;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
        setFocusedIndex((prev) => (prev + 1) % buttonCount);
        event.preventDefault();
      } else if (event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
        setFocusedIndex((prev) => (prev - 1 + buttonCount) % buttonCount);
        event.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [buttonCount]);

  useEffect(() => {
    if (buttonRefs[focusedIndex]?.current) {
      buttonRefs[focusedIndex].current.focus();
    }
  }, [focusedIndex, buttonRefs]);

    return (
      <div className="w-full min-h-screen flex flex-col bg-background_color">
        {/* Header */}
        <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <Link
              to="/non-prescription-drugs"
              ref={goBackButtonRef}
              className={`flex items-center text-black hover:text-gray-600 transition-colors
                ${focusedIndex === 0 ? 'scale-105' : ''}`}
            >
              <config.icons.arrowLeft className="text-xl" />
            </Link>
            <h1 className="text-3xl font-semibold text-black">Médicament non disponible</h1>
          </div>
          <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
        </div>

        {/* Medication Info Card */}
        <div className="px-8 py-8 flex justify-center mt-8">
          <div className="bg-white rounded-xl p-6 flex justify-between items-center max-w-xl w-full">
            <span className="text-xl font-semibold text-black">{drug.label}</span>
            <span className="text-xl font-semibold text-black">
              {drug.price ? `${drug.price.toFixed(2)} € / unité` : ''}
            </span> 
          </div>
        </div>

        {/* Options Cards */}
        <div className="flex-1 px-8 py-6 flex items-center justify-center">
          <div className="flex gap-8 max-w-5xl w-full">
            {/* Commander et récupérer plus tard */}
            <div 
              className={`flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[350px]
                transition-transform duration-300 hover:scale-105
                ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
            >
              <h2 className="text-3xl font-bold text-black mb-6">
                Commander et récupérer plus tard
              </h2>
              <p className="text-xl text-gray-600 mb-10 flex-1">
                Vous serez contacté lorsque le médicament sera disponible
              </p>
              <button
                ref={retryButtonRef}
                tabIndex={0}
                onClick={() => navigate('/preorder', { state: { drug } })}
                className={`bg-black text-white px-12 py-5 rounded-full text-lg font-semibold
                  hover:scale-105 transition-transform duration-300
                  ${focusedIndex === 1 ? 'scale-105' : ''}`}
              >
                COMMANDER
              </button>
            </div>

            {/* Trouver une pharmacie proche */}
            <div 
              className={`flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[350px]
                transition-transform duration-300 hover:scale-105
                ${focusedIndex === 2 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
            >
              <h2 className="text-3xl font-bold text-black mb-6">
                Trouver une pharmacie proche
              </h2>
              <p className="text-xl text-gray-600 mb-10 flex-1">
                Localiser les pharmacies ayant ce médicament en stock
              </p>
              <button
                ref={cancelButtonRef}
                tabIndex={0}
                onClick={() => navigate('/nearby-pharmacies', { state: { drug } })}
                className={`bg-black text-white px-12 py-5 rounded-full text-lg font-semibold
                  hover:scale-105 transition-transform duration-300
                  ${focusedIndex === 2 ? 'scale-105' : ''}`}
              >
                VOIR LES PHARMACIES
              </button>
            </div>
          </div>
        </div>

      {/* Inactivity Modal */}
      {showInactivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <ModalStandard onClose={() => setShowInactivityModal(false)}>
            <div className={`${config.fontSizes.lg} font-bold mb-4`}>
              Inactivité détectée
            </div>
            <div className={`${config.fontSizes.sm} mb-4`}>
              Vous allez être redirigé vers l'accueil dans 1 minute...
            </div>
            <button
              className={
                `${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`
              }
              onClick={() => setShowInactivityModal(false)}
            >
              Rester sur la page
            </button>
          </ModalStandard>
        </div>
      )}
    </div>
  );
}

export default InsufficientStock;
