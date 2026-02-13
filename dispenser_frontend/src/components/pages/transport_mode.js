import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import config from '../../config';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';

function TransportMode() {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.transportMode);
  const { speak } = useVoiceOver();

  const navigate = useNavigate();
  const location = useLocation();

  // Get pharmacy and drug information from navigation
  const pharmacy = location.state?.pharmacy || { name: 'Pharmacie', address: '' };
  const drug = location.state?.drug || { label: 'Médicament', price: 0 };
  const distance = location.state?.distance || 0;
  const userCoords = location.state?.userCoords || { lat: null, lon: null };

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const goBackButtonRef = useRef(null);

  // Transport modes: Walking, Car, Bicycle
  const transportModes = useMemo(() => [
    { 
      mode: 'foot', 
      label: 'A pied', 
      icon: <config.icons.walking className="text-4xl text-gray-600" />,
      getTime: (dist) => Math.round(dist * 12) // ~12 min per km walking
    },
    { 
      mode: 'car', 
      label: 'En voiture', 
      icon: <config.icons.car className="text-4xl text-gray-600" />,
      getTime: (dist) => Math.max(1, Math.round(dist * 2)) // ~2 min per km driving
    },
    { 
      mode: 'bicycle', 
      label: 'Vélo', 
      icon: <config.icons.bicycle className="text-4xl text-gray-600" />,
      getTime: (dist) => Math.round(dist * 4) // ~4 min per km cycling
    },
  ], []);

  const cardRefs = useRef([]);

  useInactivityRedirect(() => setShowInactivityModal(true));

  // Inactivity modal
  useEffect(() => {
    if (!showInactivityModal) return;
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["ArrowLeft", "ArrowRight", "Tab"].includes(event.key)) {
        event.stopPropagation();
        event.preventDefault();

        // -1 = back button, 0..2 = transport modes
        if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
          setFocusedIndex((prev) => {
            if (prev === transportModes.length - 1) return -1; // Last mode -> back button
            return prev + 1; // -1 -> 0, 0 -> 1, etc.
          });
        } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
          setFocusedIndex((prev) => {
            if (prev === -1) return transportModes.length - 1; // Back button -> last mode
            return prev - 1; // 0 -> -1, 1 -> 0, etc.
          });
        }
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (focusedIndex === -1 && goBackButtonRef.current) {
          goBackButtonRef.current.click();
        } else if (focusedIndex >= 0 && focusedIndex < transportModes.length) {
          handleTransportSelect(transportModes[focusedIndex].mode);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, transportModes]);

  // Focus management
  useEffect(() => {
    if (focusedIndex === -1 && goBackButtonRef.current) {
      goBackButtonRef.current.focus();
    } else if (focusedIndex >= 0 && cardRefs.current[focusedIndex]) {
      cardRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  const handleTransportSelect = (mode) => {
    const selected = transportModes.find(t => t.mode === mode);
    const estimate = selected ? selected.getTime(distance) : null;
    const qs = `lat=${pharmacy.latitude}&lon=${pharmacy.longitude}&name=${encodeURIComponent(pharmacy.name)}&transport=${mode}${estimate ? `&estimate=${estimate}` : ''}`;
    navigate(`/directions-map?${qs}`); 
  };

  // Calculate walking time for pharmacy card
  const walkingTime = distance ? Math.round(distance * 12) : null;

  return (
    <div className="w-full min-h-screen flex flex-col bg-background_color">
      
      
      {/* Header */}
      <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <Link to="/nearby-pharmacies"
            state={{ drug }}
            ref={goBackButtonRef}
            className={`flex items-center text-black hover:text-gray-600 transition-all duration-300
              ${focusedIndex === -1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
            tabIndex={focusedIndex === -1 ? 0 : -1}
            {...createVoiceOverHandlers(speak)}>
            <config.icons.arrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-semibold text-black">Mode de transport</h1>
        </div>
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
      </div>

      {/* Pharmacy Info Card */}
      <div className="px-8 py-4 flex justify-center">
        <div className="bg-white rounded-xl p-6 flex justify-between items-center max-w-4xl w-full">
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-black">{pharmacy.name}</span>
            {pharmacy.address && (
              <span className="text-base text-gray-500 mt-1">{pharmacy.address}</span>
            )}
          </div>
          <div className="text-right">
            {distance > 0 && (
              <>
                <div className="text-lg font-semibold text-black">{distance.toFixed(1)}km</div>
                {walkingTime && (
                  <div className="text-sm text-gray-500">~{walkingTime} min</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transport Mode Cards */}
      <div className="flex-1 px-8 py-8 flex items-start justify-center">
        <div className="flex gap-6 max-w-5xl w-full justify-center">
          {transportModes.map((transport, index) => {
            const estimatedTime = transport.getTime(distance);
            return (
              <div
                key={transport.mode}
                ref={el => cardRefs.current[index] = el}
                tabIndex={focusedIndex === index ? 0 : -1}
                className={`bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm min-w-[200px] flex-1 max-w-[280px]
                  transition-all duration-300
                  ${focusedIndex === index ? 'ring-2 ring-pink-300 scale-105' : ''}`}
              >
                {/* Icon */}
                <div className="mb-4">
                  {transport.icon}
                </div>
                
                {/* Label */}
                <h2 className="text-xl font-semibold text-black mb-2">
                  {transport.label}
                </h2>
                
                {/* Estimated Time */}
                <p className="text-lg text-gray-500 mb-6">
                  {estimatedTime} min
                </p>
                
                {/* Button */}
                <button {...createVoiceOverHandlers(speak)}
            onClick={() => handleTransportSelect(transport.mode)}
                  className="bg-black text-white px-8 py-2 rounded-lg text-sm font-semibold
                    hover:scale-105 transition-transform duration-300"
                >
                  CHOISIR
                </button>
              </div>
            );
          })}
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
            <button className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`}
              {...createVoiceOverHandlers(speak)}
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

export default TransportMode;
