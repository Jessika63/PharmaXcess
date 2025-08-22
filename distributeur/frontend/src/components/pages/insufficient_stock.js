import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css'
import config from '../../config';
import ModalStandard from '../modal_standard';
// import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { getPharmaciesCache, setPharmaciesCache } from '../../utils/pharmaciesCache';

function InsufficientStock() {

  const navigate = useNavigate()
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
  const transportModes = useMemo(() => [
    { mode: 'foot', label: 'À pied', icon: <config.icons.walking /> },
    { mode: 'bicycle', label: 'Vélo', icon: <config.icons.bicycle /> },
    { mode: 'transit', label: 'Transports', icon: <config.icons.bus /> },
    { mode: 'car', label: 'Voiture', icon: <config.icons.car /> },
  ], []);

  const transportElements = transportModes.length + 1; // +1 for the close button
  const modalContentRef = useRef(null);
  const cardRefs = useRef([]);

  // Add a ref to prevent double fetch in StrictMode
  // const fetchedOnce = useRef(false);

  // Add a ref to the close button
  const closeButtonRef = useRef(null);
  const transportCloseButtonRef = useRef(null);
  const pharmaciesCache = useRef({});
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  useInactivityRedirect(() => setShowInactivityModal(true));

  // Fetch pharmacies data
  useEffect(() => {
    const fetchAndCachePharmacies = async () => {
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
        console.log('Geolocation error:', geoError);
      }

      if (lat && lon) {
        setUserCoords({ lat, lon });
        const cacheKey = `${lat},${lon}`;

        if (pharmaciesCache.current[cacheKey]) {
          setPharmaciesList(pharmaciesCache.current[cacheKey]);
          return;
        }

        const globalCache = getPharmaciesCache();
        if (globalCache) {
          pharmaciesCache.current[cacheKey] = globalCache;
          setPharmaciesList(globalCache);
          return;
        }

        try {
          const response = await fetchWithTimeout(`${config.backendUrl}/get_pharmacies?lat=${lat}&lon=${lon}`);
          const data = await response.json();
          if (data.pharmacies && data.pharmacies.length > 0) {
            setPharmaciesList(data.pharmacies);
            pharmaciesCache.current[cacheKey] = data.pharmacies;
            setPharmaciesCache(data.pharmacies);
          }
        } catch (err) {
          console.log('Fetch pharmacies failed:', err.message);
        }
      }
    };

    fetchAndCachePharmacies();
  }, []);

  // Inactivity modal
  useEffect(() => {
    if (!showInactivityModal) return;
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
      if (pharmaciesModalOpen || transportModalOpen) return;
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
  }, [pharmaciesModalOpen, transportModalOpen, buttonCount]);

  useEffect(() => {
    if (buttonRefs[focusedIndex]?.current) {
      buttonRefs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  // Pharmacies modal focus
  useEffect(() => {
    if (pharmaciesModalOpen && modalContentRef.current) {
      modalContentRef.current.focus();
    }
  }, [pharmaciesModalOpen]);

  // Scroll to selected pharmacy
  useEffect(() => {
    if (pharmaciesModalOpen && cardRefs.current[selectedPharmacyIndex]) {
      cardRefs.current[selectedPharmacyIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [selectedPharmacyIndex, pharmaciesModalOpen]);

  // Focus management for pharmacies modal
  useEffect(() => {
    if (!pharmaciesModalOpen || transportModalOpen) return;

    if (selectedPharmacyIndex === pharmaciesList.length && closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else if (
      selectedPharmacyIndex >= 0 &&
      selectedPharmacyIndex < pharmaciesList.length &&
      cardRefs.current[selectedPharmacyIndex])
    {
      cardRefs.current[selectedPharmacyIndex].focus();
    }
  }, [selectedPharmacyIndex, pharmaciesModalOpen, transportModalOpen, pharmaciesList.length]);

  // Keyboard navigation for transport modal
  useEffect(() => {
    if (!transportModalOpen) return;

    let justOpened = true;
    const timeout = setTimeout(() => {
      justOpened = false;
    }, 100); // Ignore input for 100ms after the opening

      const handleTransportKeyDown = (event) => {
        if (["ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();

          if (event.key === "ArrowRight") {
            setFocusedTransportIndex((prev) => (prev + 1) % transportElements);
          } else if (event.key === "ArrowLeft") {
            setFocusedTransportIndex((prev) => (prev - 1 + transportElements) % transportElements);
          } else if (event.key === "Enter" && !justOpened) {
            if (focusedTransportIndex < transportModes.length) {
              handleTransportSelect(transportModes[focusedTransportIndex].mode);
            } else {
              setTransportModalOpen(false);
              setPharmaciesModalOpen(false);
            }
          } else if (event.key === "Escape") {
            setTransportModalOpen(false);
            setPharmaciesModalOpen(false);
          }
        }
      };

      document.addEventListener("keydown", handleTransportKeyDown);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener("keydown", handleTransportKeyDown);
      };
    }, [transportModalOpen, focusedTransportIndex, transportModes.length, transportElements]);

    // Pharmacy selection handler
    const handlePharmacySelect = (pharmacy) => {
      setSelectedPharmacy(pharmacy);
      setPharmaciesModalOpen(false);

      // Reset le focusedTransportIndex et ajouter un léger délai
      setFocusedTransportIndex(0);

      setTimeout(() => {
        setTransportModalOpen(true);
      }, 50); // Petit délai pour laisser le temps à l'événement Enter de se terminer
    };

    // Close modal handler
    const handleCloseModal = () => {
      setPharmaciesModalOpen(false);
      setTimeout(() => {
        if (cancelButtonRef.current) cancelButtonRef.current.focus();
      }, 100);
    };
    
    const handleTransportSelect = (mode) => {
      setTransportModalOpen(false);
      setPharmaciesModalOpen(false);
      navigate(`/directions-map?lat=${selectedPharmacy.latitude}&lon=${selectedPharmacy.longitude}&name=${encodeURIComponent(selectedPharmacy.name)}&transport=${mode}`);
    };

    // Keyboard navigation for transport modal
    useEffect(() => {
      if (transportModalOpen && transportCloseButtonRef.current) {
        // Focus sur le premier élément (ou le bouton Fermer si c'est le dernier)
        const elementToFocus = focusedTransportIndex === transportModes.length
          ? transportCloseButtonRef.current
          : document.querySelector(`button[tabindex="0"]`);

        if (elementToFocus) {
          elementToFocus.focus();
        }
      };
    }, [transportModalOpen, focusedTransportIndex, transportModes, handleTransportSelect]);

    // Open pharmacies modal
    const openPharmaciesModal = async () => {
      setPharmaciesModalOpen(true);
      setSelectedPharmacyIndex(0);
      setLoadingPharmacies(true);

      let lat, lon;
      try {
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                lat = position.coords.latitude;
                lon = position.coords.longitude;
                resolve();
              },
              () => resolve()
            );
          });
        }
      } catch (geoError) {
        console.log('Geolocation error:', geoError);
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
          if (data.pharmacies?.length > 0) {
            setPharmaciesList(data.pharmacies);
            pharmaciesCache.current[cacheKey] = data.pharmacies;
          }
        } catch (err) {
          setError(err.message === 'Timeout'
            ? 'Le serveur ne répond pas (délai dépassé). Veuillez réessayer plus tard.'
            : 'Network Error');
        }
      }
      setLoadingPharmacies(false);
    };

    // Calculate distance between user and pharmacy
    const calculateDistance = (userCoords, pharmacy) => {
      if (!userCoords.lat || !userCoords.lon) return null;

      const R = 6371; // Earth radius in km
      const toRad = (x) => x * Math.PI / 180;
      const dLat = toRad(pharmacy.latitude - Number(userCoords.lat));
      const dLon = toRad(pharmacy.longitude - Number(userCoords.lon));

      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(Number(userCoords.lat))) *
        Math.cos(toRad(pharmacy.latitude)) *
        Math.sin(dLon / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
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
          <div className="flex justify-center items-center w-full">
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-80 h-20" />
          </div>
        </div>

        {/* Information Message */}
        <div className={`w-3/4 bg-background_color ${config.padding.modal} ${config.borderRadius.md} text-center mb-4`}>
          <p className={`${config.fontSizes.md} ${config.textColors.primary}`}>
            Le stock est insuffisant pour ce médicament.<br />
            Que souhaitez-vous faire ?
          </p>
        </div>

        {/* Buttons Container */}
        <div className={`flex flex-col items-center ${config.spacing.sm} w-full max-w-xl`}>
          {/* Preorder Button */}
          <button
            ref={retryButtonRef}
            tabIndex={0}
            onClick={() => navigate('/preorder')}
            className={`w-full h-24 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md} 
            ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} cursor-pointer
            ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.ring}
            ${config.scaleEffects.hover} ${focusedIndex === 1 ? config.scaleEffects.focus : ''}`}
          >
            <config.icons.clock className="mr-4" />
            Précommander ou récupérer plus tard
          </button>

          {/* Other Pharmacy Button */}
          <button
            ref={cancelButtonRef}
            tabIndex={0}
            onClick={openPharmaciesModal}
            className={`w-full h-24 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md} 
            ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md}
            ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.outline}
            ${config.scaleEffects.hover} ${focusedIndex === 2 ? config.scaleEffects.focus : ''}`}
          >
            <config.icons.mapMarker className="mr-4" />
            Aller dans une autre pharmacie
          </button>
        </div>

        {/* Pharmacies Modal */}
        {pharmaciesModalOpen && (
          <ModalStandard onClose={handleCloseModal}>
            <div
              ref={modalContentRef}
              tabIndex={-1}
              className="w-full max-w-6xl flex flex-col items-center justify-center p-8"
              onKeyDown={(e) => {
                if (transportModalOpen) return;

                if (["ArrowRight", "ArrowLeft", "Tab"].includes(e.key)) {
                  e.stopPropagation();
                  e.preventDefault();

                  const lastCardIndex = pharmaciesList.length - 1;
                  const closeButtonIndex = pharmaciesList.length;

                  if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
                    if (selectedPharmacyIndex === lastCardIndex) {
                      setSelectedPharmacyIndex(closeButtonIndex);
                    } else if (selectedPharmacyIndex === closeButtonIndex) {
                      setSelectedPharmacyIndex(0);
                    } else {
                      setSelectedPharmacyIndex(selectedPharmacyIndex + 1);
                    }
                  } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
                    if (selectedPharmacyIndex === 0) {
                      setSelectedPharmacyIndex(closeButtonIndex);
                    } else if (selectedPharmacyIndex === closeButtonIndex) {
                      setSelectedPharmacyIndex(lastCardIndex);
                    } else {
                      setSelectedPharmacyIndex(selectedPharmacyIndex - 1);
                    }
                  }
                } else if (e.key === "Enter") {
                  if (selectedPharmacyIndex === pharmaciesList.length) {
                    handleCloseModal();
                  } else if (selectedPharmacyIndex >= 0 && selectedPharmacyIndex < pharmaciesList.length) {
                    handlePharmacySelect(pharmaciesList[selectedPharmacyIndex]);
                  }
                }
              }}
            >
              {/* Close Button */}
              <button
                ref={closeButtonRef}
                className={`absolute top-6 right-8 flex items-center gap-2 ${config.padding.button} ${config.buttonColors.red} ${config.borderRadius.md} ${config.fontSizes.sm} ${config.shadows.md} ${config.buttonColors.redHover} ${config.transitions.default} ${config.focusStates.ring} ${selectedPharmacyIndex === pharmaciesList.length ? `${config.focusStates.ring} ${config.scaleEffects.focus} z-10` : ''}`}
                tabIndex={selectedPharmacyIndex === pharmaciesList.length ? 0 : -1}
                style={{ zIndex: 10 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCloseModal();
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
                  {/* Blank cards */}
                  <div className="w-32 flex-shrink-0" style={{ minHeight: '140px' }}></div>

                  {pharmaciesList.map((ph, i) => {
                    const dist = calculateDistance(userCoords, ph);
                    return (
                      <div
                        key={i}
                        ref={el => {
                          cardRefs.current[i] = el;
                          if (i === 0 && selectedPharmacyIndex === 0 && el) {
                            setTimeout(() => el.focus(), 0);
                          }
                        }}
                        className={`bg-gradient-to-r from-pink-100 to-rose-100 ${config.borderRadius.lg} ${config.shadows.md} p-3 w-64 flex flex-col items-start border-2 ${config.transitions.default} cursor-pointer 
                        ${selectedPharmacyIndex === i ? 'border-pink-500 scale-105 ring-4 ring-pink-300 z-10' : 'border-pink-200'} 
                        ${config.scaleEffects.hover} ${config.focusStates.ring} ${config.shadows.lg} ${config.focusStates.outline}`}
                        tabIndex={selectedPharmacyIndex === i ? 0 : -1}
                        style={{ minHeight: '140px', flex: '0 0 auto' }}
                        onClick={() => handlePharmacySelect(ph)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handlePharmacySelect(ph);
                          }
                        }}
                      >
                        <div className="text-base font-semibold mb-1">{ph.name}</div>
                        {ph.address && <div className="text-sm text-gray-600 mb-1">{ph.address}</div>}
                        {dist !== null && (
                          <div className="text-sm text-pink-600 font-bold mt-auto whitespace-pre-line">
                            Distance :{`\n`}{dist.toFixed(2)} km
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="w-32 flex-shrink-0" style={{ minHeight: '140px' }}></div>
                </div>
              )}
            </div>
          </ModalStandard>
        )}

        {/* Transport Modal */}
        {transportModalOpen && selectedPharmacy && (
          <ModalStandard onClose={() => setTransportModalOpen(false)}>
            <div className="flex flex-col items-center">
              {/* Bouton Fermer - fait maintenant partie de la navigation */}
              <button
                ref={transportCloseButtonRef}
                className={`absolute top-4 right-4 ${config.padding.button} ${config.buttonColors.red} ${config.borderRadius.md} ${config.fontSizes.sm} ${config.shadows.md} ${config.buttonColors.redHover} ${config.transitions.default} ${config.focusStates.ring} 
                ${focusedTransportIndex === transportModes.length ? 'ring-4 ring-pink-300 scale-110' : ''}`}
                tabIndex={focusedTransportIndex === transportModes.length ? 0 : -1}
                onClick={() => handleTransportSelect('close')}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTransportSelect('close');
                  }
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
                    ${focusedTransportIndex === idx ? 'border-pink-500 ring-4 ring-pink-300 scale-110 bg-white' : 'border-gray-300 bg-gray-100'}`}
                    tabIndex={focusedTransportIndex === idx ? 0 : -1}
                    onClick={() => handleTransportSelect(t.mode)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleTransportSelect(t.mode);
                      }
                    }}
                  >
                    <span className={`${config.fontSizes.xl} mb-2`}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </ModalStandard>
        )}

        {/* Inactivity Modal */}
        {showInactivityModal && (
          <ModalStandard onClose={() => setShowInactivityModal(false)}>
            <div className={`${config.fontSizes.lg} font-bold mb-4`}>Inactivité détectée</div>
            <div className={`${config.fontSizes.sm} mb-4`}>Vous allez être redirigé vers l'accueil dans 1 minute...</div>
            <button
              className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`}
              onClick={() => setShowInactivityModal(false)}
            >
              Rester sur la page
            </button>
          </ModalStandard>
        )}
      </div>
    );
  }

export default InsufficientStock;
