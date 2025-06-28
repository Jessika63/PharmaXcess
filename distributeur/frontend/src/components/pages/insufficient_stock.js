import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'
import config from '../../config';
import ModalStandard from '../modal_standard';
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

function InsufficientStock() {

  const navigate = useNavigate()
  const location = useLocation()

  const retryButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const goBackButtonRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [pharmaciesModalOpen, setPharmaciesModalOpen] = useState(false);
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [userCoords, setUserCoords] = useState({ lat: null, lon: null });
  const [selectedPharmacyIndex, setSelectedPharmacyIndex] = useState(0);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [error, setError] = useState(null);
  const [transportModalOpen, setTransportModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [focusedTransportIndex, setFocusedTransportIndex] = useState(0);
  const transportModes = [
    { mode: 'foot', label: 'À pied', icon: <config.icons.walking /> },
    { mode: 'bicycle', label: 'Vélo', icon: <config.icons.bicycle /> },
    { mode: 'transit', label: 'Transports', icon: <config.icons.bus /> },
    { mode: 'car', label: 'Voiture', icon: <config.icons.car /> },
  ];
  
  const modalContentRef = useRef(null);
  const cardRefs = useRef([]);

  // Add a ref to prevent double fetch in StrictMode
  const fetchedOnce = useRef(false);

  // Add a ref to the close button
  const closeButtonRef = useRef(null);

  // Add a cache for pharmacies
  const pharmaciesCache = useRef({});

  const [showInactivityModal, setShowInactivityModal] = useState(false);
  useInactivityRedirect(() => setShowInactivityModal(true));

  // Dismiss inactivity modal on user activity
  useEffect(() => {
    if (!showInactivityModal) return;
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  const buttonRefs = [goBackButtonRef, retryButtonRef, cancelButtonRef];
  const buttonCount = buttonRefs.length;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (pharmaciesModalOpen || transportModalOpen) return; // Don't interfere with modal navigation
      if (event.key === 'ArrowRight') {
        setFocusedIndex((prev) => (prev + 1) % buttonCount);
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        setFocusedIndex((prev) => (prev - 1 + buttonCount) % buttonCount);
        event.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pharmaciesModalOpen, transportModalOpen, buttonCount]);

  useEffect(() => {
    if (buttonRefs[focusedIndex] && buttonRefs[focusedIndex].current) {
      buttonRefs[focusedIndex].current.focus();
    }
  }, [focusedIndex, buttonRefs]);

  useEffect(() => {
    if (pharmaciesModalOpen && modalContentRef.current) {
        modalContentRef.current.focus();
    }
  }, [pharmaciesModalOpen]);

  useEffect(() => {
    if (pharmaciesModalOpen && cardRefs.current[selectedPharmacyIndex]) {
        cardRefs.current[selectedPharmacyIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedPharmacyIndex, pharmaciesModalOpen]);

  // Add effect to focus the correct element when selectedPharmacyIndex changes
  useEffect(() => {
    if (!pharmaciesModalOpen) return;
    if (selectedPharmacyIndex === -1 && closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else if (selectedPharmacyIndex >= 0 && cardRefs.current[selectedPharmacyIndex]) {
      cardRefs.current[selectedPharmacyIndex].focus();
      setTimeout(() => {
        cardRefs.current[selectedPharmacyIndex]?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
      }, 0);
    }
  }, [selectedPharmacyIndex, pharmaciesModalOpen]);

  // Keyboard navigation for pharmacy modal
  useEffect(() => {
    if (!pharmaciesModalOpen) return;
    const handlePharmacyKeyDown = (event) => {
      if (["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === "ArrowRight") {
        setSelectedPharmacyIndex((prev) => Math.min(prev + 1, pharmaciesList.length - 1));
      } else if (event.key === "ArrowLeft") {
        setSelectedPharmacyIndex((prev) => Math.max(prev - 1, -1));
      } else if (event.key === "Enter") {
        if (selectedPharmacyIndex === -1) {
          setPharmaciesModalOpen(false);
        } else if (selectedPharmacyIndex >= 0 && selectedPharmacyIndex < pharmaciesList.length) {
          setSelectedPharmacy(pharmaciesList[selectedPharmacyIndex]);
          setTransportModalOpen(true);
          setFocusedTransportIndex(0);
        }
      }
    };
    document.addEventListener("keydown", handlePharmacyKeyDown);
    return () => document.removeEventListener("keydown", handlePharmacyKeyDown);
  }, [pharmaciesModalOpen, selectedPharmacyIndex, pharmaciesList]);

  // Keyboard navigation for transport modal
  useEffect(() => {
    if (!transportModalOpen) return;
    const handleTransportKeyDown = (event) => {
      if (["ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === "ArrowRight") {
        setFocusedTransportIndex((prev) => (prev + 1) % transportModes.length);
      } else if (event.key === "ArrowLeft") {
        setFocusedTransportIndex((prev) => (prev - 1 + transportModes.length) % transportModes.length);
      } else if (event.key === "Enter") {
        handleTransportSelect(transportModes[focusedTransportIndex].mode);
      } else if (event.key === "Escape") {
        setTransportModalOpen(false);
        setPharmaciesModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleTransportKeyDown);
    return () => document.removeEventListener("keydown", handleTransportKeyDown);
  }, [transportModalOpen, focusedTransportIndex, transportModes]);

  const openPharmaciesModal = async () => {
    setPharmaciesModalOpen(true);
    setSelectedPharmacyIndex(0);
    setLoadingPharmacies(true);
    setPharmaciesList([]); // Clear previous list
    let lat, lon;
    try {
      if (navigator.geolocation) {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lon = position.coords.longitude;
              resolve();
            },
            (error) => {
              resolve();
            }
          );
        });
      }
    } catch (geoError) {
      // Geolocation error handled silently
    }
    if (lat && lon) {
      setUserCoords({ lat, lon });
      const cacheKey = `${lat},${lon}`;
      if (pharmaciesCache.current[cacheKey]) {
        setPharmaciesList(pharmaciesCache.current[cacheKey]);
        setLoadingPharmacies(false);
        return;
      }
      try {
        const response = await fetchWithTimeout(`${config.backendUrl}/get_pharmacies?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        if (data.pharmacies && data.pharmacies.length > 0) {
          setPharmaciesList(data.pharmacies);
          pharmaciesCache.current[cacheKey] = data.pharmacies;
        }
      } catch (err) {
        if (err.message === 'Timeout') {
          setError('Le serveur ne répond pas (délai dépassé). Veuillez réessayer plus tard.');
        } else {
          setError('Network Error');
        }
      }
    }
    setLoadingPharmacies(false);
  };

  const handleTransportSelect = (mode) => {
    setTransportModalOpen(false);
    setPharmaciesModalOpen(false);
    navigate(`/directions-map?lat=${selectedPharmacy.latitude}&lon=${selectedPharmacy.longitude}&name=${encodeURIComponent(selectedPharmacy.name)}&transport=${mode}`);
  };

  return (
      <div className={`bg-background_color min-h-screen w-full flex flex-col items-center justify-center`}>

          {/* Go Back Button */}
          <div className="w-4/5 flex items-center mt-6 mb-2">
            <button
              ref={goBackButtonRef}
              tabIndex={0}
              className={`${config.fontSizes.md} ${config.buttonColors.mainGradient} ${config.padding.button} ${config.borderRadius.lg} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${config.focusStates.outline} flex items-center ${focusedIndex === 0 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`}
              onClick={() => navigate('/non-prescription-drugs')}
            >
              <config.icons.arrowLeft className="mr-3" /> Retour
            </button>
          </div>

          {/* Header */}
          <div className="w-4/5 h-28 flex justify-center items-center mb-4 mt-2">
              {/* Logo */}
              <div className="flex justify-center items-center w-full">
                  <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-80 h-20" />
              </div>
          </div>

          {/* Information Message Container */}
          <div className={`w-3/4 bg-background_color ${config.padding.modal} ${config.borderRadius.md} text-center mb-4`}>
              <p className={`${config.fontSizes.md} ${config.textColors.primary}`}>
                  Le stock est insuffisant pour ce médicament.<br />
                  Que souhaitez-vous faire ?
              </p>
          </div>

          {/* Container for centering both buttons */}
          <div className={`flex flex-col items-center ${config.spacing.sm} w-full max-w-xl`}>
      
              {/* Button 'Précommander ou récupérer plus tard' */}
              <button
                  ref={retryButtonRef}
                  tabIndex={0}
                  onClick={() => navigate('/preorder')}
                  className={`w-full h-24 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md} 
                      ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} cursor-pointer
                      ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.ring}
                      ${config.scaleEffects.hover} ${config.focusStates.ring}
                      ${focusedIndex === 1 ? config.scaleEffects.focus : ''}`}
              >
                  <config.icons.clock className="mr-4" />
                  Précommander ou récupérer plus tard
              </button>

              {/* Button 'Aller dans une autre pharmacie' */}
              <button
                  ref={cancelButtonRef}
                  tabIndex={0}
                  onClick={openPharmaciesModal}
                  className={`w-full h-24 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md} 
                      ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md}
                      ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.outline}
                      ${config.scaleEffects.hover} ${config.focusStates.ring}
                      ${focusedIndex === 2 ? config.scaleEffects.focus : ''}`}
              >
                  <config.icons.mapMarker className="mr-4" />
                  Aller dans une autre pharmacie
              </button>

          </div>

          {/* Pharmacies Modal */}
          {pharmaciesModalOpen && (
              <ModalStandard onClose={() => setPharmaciesModalOpen(false)}>
                  <div
                      ref={modalContentRef}
                      tabIndex={transportModalOpen ? -1 : 0}
                      autoFocus={!transportModalOpen}
                      className="w-full max-w-6xl flex flex-col items-center justify-center p-8"
                      onKeyDown={(e) => {
                          
                          // Don't handle keys if transport modal is open
                          if (transportModalOpen) {
                              return;
                          }
                          
                          if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
                              e.stopPropagation();
                              e.preventDefault();
                              
                              if (e.key === "ArrowRight") {
                                  const newIndex = Math.min(selectedPharmacyIndex + 1, pharmaciesList.length - 1);
                                  setSelectedPharmacyIndex(newIndex);
                              } else if (e.key === "ArrowLeft") {
                                  const newIndex = Math.max(selectedPharmacyIndex - 1, -1);
                                  setSelectedPharmacyIndex(newIndex);
                              }
                          } else if (e.key === "Tab") {
                            // Trap focus to close button and cards
                          } else if (e.key === "Enter" && selectedPharmacyIndex === -1) {
                            setPharmaciesModalOpen(false);
                            setTimeout(() => {
                              if (cancelButtonRef.current) cancelButtonRef.current.focus();
                            }, 100);
                          }
                      }}
                  >
                      <button
                          ref={closeButtonRef}
                          className={`absolute top-6 right-8 flex items-center gap-2 ${config.padding.button} ${config.buttonColors.red} ${config.borderRadius.md} ${config.fontSizes.sm} ${config.shadows.md} ${config.buttonColors.redHover} ${config.transitions.default} ${config.focusStates.ring} ${selectedPharmacyIndex === -1 ? `${config.focusStates.ring} ${config.scaleEffects.focus} z-10` : ''}`}
                          tabIndex={0}
                          style={{ zIndex: 10 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPharmaciesModalOpen(false);
                            setTimeout(() => {
                              if (cancelButtonRef.current) cancelButtonRef.current.focus();
                            }, 100);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              setPharmaciesModalOpen(false);
                              setTimeout(() => {
                                if (cancelButtonRef.current) cancelButtonRef.current.focus();
                              }, 100);
                            }
                          }}
                      >
                          <config.icons.times className="mr-2" /> Fermer
                      </button>
                      <div className={`${config.fontSizes.md} ${config.textColors.primary} font-bold mb-6`}>Pharmacies à proximité</div>
                      {loadingPharmacies ? (
                          <div className="flex flex-col items-center justify-center w-full h-64">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
                              <div className={`${config.fontSizes.sm} ${config.textColors.secondary}`}>Chargement...</div>
                          </div>
                      ) : (
                          <div className="flex flex-row items-center gap-4 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200" style={{ minHeight: '220px' }}>
                              {/* Blank card before first */}
                              <div className="w-64 flex-shrink-0" style={{ minHeight: '140px' }}></div>
                              
                              {pharmaciesList.map((ph, i) => {
                                  function haversine(lat1, lon1, lat2, lon2) {
                                      const R = 6371; // km
                                      const toRad = (x) => x * Math.PI / 180;
                                      const dLat = toRad(lat2 - lat1);
                                      const dLon = toRad(lon2 - lon1);
                                      const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
                                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                      return R * c;
                                  }
                                  const dist = userCoords.lat && userCoords.lon ? haversine(Number(userCoords.lat), Number(userCoords.lon), ph.latitude, ph.longitude) : null;
                                  return (
                                      <div
                                          key={i}
                                          ref={el => cardRefs.current[i] = el}
                                          className={`bg-gradient-to-r from-pink-100 to-rose-100 ${config.borderRadius.lg} ${config.shadows.md} p-3 w-64 flex flex-col items-start border-2 ${config.transitions.default} cursor-pointer 
                                          ${selectedPharmacyIndex === i ? 'border-pink-500 scale-105 ring-4 ring-pink-300 z-10' : 'border-pink-200'} 
                                          ${config.scaleEffects.hover} ${config.focusStates.ring} ${config.shadows.lg} ${config.focusStates.outline}`}
                                          tabIndex={transportModalOpen ? -1 : (selectedPharmacyIndex === i ? 0 : -1)}
                                          style={{ minHeight: '140px', flex: '0 0 auto' }}
                                          onClick={e => {
                                              e.stopPropagation();
                                              setSelectedPharmacy(ph);
                                              setPharmaciesModalOpen(false);
                                              setTimeout(() => {
                                                  setTransportModalOpen(true);
                                                  setFocusedTransportIndex(0);
                                              }, 100);
                                          }}
                                          onKeyDown={e => {
                                              if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  setSelectedPharmacy(ph);
                                                  setPharmaciesModalOpen(false);
                                                  setTimeout(() => {
                                                      setTransportModalOpen(true);
                                                      setFocusedTransportIndex(0);
                                                  }, 100);
                                              }
                                          }}
                                      >
                                          <div className="text-base font-semibold mb-1">{ph.name}</div>
                                          {ph.address && <div className="text-sm text-gray-600 mb-1">{ph.address}</div>}
                                          {dist !== null && <div className="text-sm text-pink-600 font-bold mt-auto whitespace-pre-line">Distance :{`\n`}{dist.toFixed(2)} km</div>}
                                      </div>
                                  );
                              })}
                              
                              {/* Blank card after last */}
                              <div className="w-64 flex-shrink-0" style={{ minHeight: '140px' }}></div>
                          </div>
                      )}
                  </div>
              </ModalStandard>
          )}

          {/* Transport Modal */}
          {transportModalOpen && selectedPharmacy && (
              <ModalStandard onClose={() => setTransportModalOpen(false)}>
                  <div className="flex flex-col items-center">
                      <button
                          className={`absolute top-4 right-4 ${config.padding.button} ${config.buttonColors.red} ${config.borderRadius.md} ${config.fontSizes.sm} ${config.shadows.md} ${config.buttonColors.redHover} ${config.transitions.default} ${config.focusStates.ring}`}
                          onClick={() => {
                              setTransportModalOpen(false);
                              setPharmaciesModalOpen(false);
                          }}
                      >
                          <config.icons.times className="mr-2" /> Fermer
                      </button>
                      <div className={`${config.fontSizes.md} font-bold mb-4`}>Choisissez le mode de transport</div>
                      <div className="flex flex-row gap-6">
                          {transportModes.map((t, idx) => (
                              <button
                                  key={t.mode}
                                  className={`flex flex-col items-center ${config.padding.button} ${config.borderRadius.md} ${config.fontSizes.sm} font-semibold border-2 ${config.transitions.default} ${config.focusStates.outline} 
                                    ${focusedTransportIndex === idx ? 'border-pink-500 ring-4 ring-pink-300 scale-110 bg-white' : 'border-gray-300 bg-gray-100'}
                                  `}
                                  tabIndex={focusedTransportIndex === idx ? 0 : -1}
                                  onClick={() => {
                                      handleTransportSelect(t.mode);
                                  }}
                                  onKeyDown={(e) => {
                                      if (e.key === "ArrowRight") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const newIndex = (focusedTransportIndex + 1) % transportModes.length;
                                          setFocusedTransportIndex(newIndex);
                                      } else if (e.key === "ArrowLeft") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const newIndex = (focusedTransportIndex - 1 + transportModes.length) % transportModes.length;
                                          setFocusedTransportIndex(newIndex);
                                      } else if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleTransportSelect(t.mode);
                                      }
                                  }}
                                  autoFocus={focusedTransportIndex === idx}
                              >
                                  <span className={`${config.fontSizes.xl} mb-2`}>{t.icon}</span>
                                  {t.label}
                              </button>
                          ))}
                      </div>
                  </div>
              </ModalStandard>
          )}

          {showInactivityModal && (
            <ModalStandard onClose={() => setShowInactivityModal(false)}>
              <div className={`${config.fontSizes.lg} font-bold mb-4`}>Inactivité détectée</div>
              <div className={`${config.fontSizes.sm} mb-4`}>Vous allez être redirigé vers l'accueil dans 1 minute...</div>
              <button className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`} onClick={() => setShowInactivityModal(false)}>Rester sur la page</button>
            </ModalStandard>
          )}
      </div>
  );

}

export default InsufficientStock; 