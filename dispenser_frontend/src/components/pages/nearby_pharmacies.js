import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import config from '../../config';
import ModalStandard from '../modal_standard';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { getPharmaciesCache, setPharmaciesCache } from '../../utils/pharmaciesCache';
import ErrorPage from '../ErrorPage';
import { getDefaultPosition } from '../../utils/positionUtils';

function NearbyPharmacies() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get medication information from navigation
  const drug = location.state?.drug || { label: 'Médicament', price: 0 };

  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [userCoords, setUserCoords] = useState({ lat: null, lon: null });
  const [selectedPharmacyIndex, setSelectedPharmacyIndex] = useState(0);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [error, setError] = useState(null);
  const [pharmaciesFetched, setPharmaciesFetched] = useState(false);
  const [transportModalOpen, setTransportModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [focusedTransportIndex, setFocusedTransportIndex] = useState(0);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const transportModes = useMemo(() => [
    { mode: 'foot', label: 'À pied', icon: <config.icons.walking /> },
    { mode: 'bicycle', label: 'Vélo', icon: <config.icons.bicycle /> },
    { mode: 'transit', label: 'Transports', icon: <config.icons.bus /> },
    { mode: 'car', label: 'Voiture', icon: <config.icons.car /> },
  ], []);

  const transportElements = transportModes.length + 1;
  const cardRefs = useRef([]);
  const goBackButtonRef = useRef(null);
  const transportCloseButtonRef = useRef(null);
  const pharmaciesCache = useRef({});

  useInactivityRedirect(() => setShowInactivityModal(true));

  // Fetch pharmacies data
  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoadingPharmacies(true);
      setError(null);

      let lat, lon;
      try {
        const position = await getDefaultPosition();
        lat = position.lat;
        lon = position.lon;
      } catch (geoError) {
        setError('Impossible d\'obtenir votre position.');
        setLoadingPharmacies(false);
        return;
      }

      if (lat && lon) {
        setUserCoords({ lat, lon });
        const cacheKey = `${lat},${lon}`;

        // Check local cache first
        if (pharmaciesCache.current[cacheKey]) {
          setPharmaciesList(pharmaciesCache.current[cacheKey]);
          setLoadingPharmacies(false);
          setPharmaciesFetched(true);
          return;
        }

        // Check global cache
        const globalCache = getPharmaciesCache();
        if (globalCache) {
          pharmaciesCache.current[cacheKey] = globalCache;
          setPharmaciesList(globalCache);
          setLoadingPharmacies(false);
          setPharmaciesFetched(true);
          return;
        }

        // Fetch from API
        try {
          const response = await fetchWithTimeout(`${config.backendUrl}/get_pharmacies?lat=${lat}&lon=${lon}`, undefined, 10000);
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          if (data.pharmacies && data.pharmacies.length > 0) {
            setPharmaciesList(data.pharmacies);
            pharmaciesCache.current[cacheKey] = data.pharmacies;
            setPharmaciesCache(data.pharmacies);
            setPharmaciesFetched(true);
          } else {
            setError('Aucune pharmacie trouvée dans votre région.');
          }
        } catch (err) {
          setError(err.message === 'Timeout'
            ? 'Le serveur ne répond pas. Veuillez réessayer plus tard.'
            : `Erreur: ${err.message}`);
        }
      }
      setLoadingPharmacies(false);
    };

    if (!pharmaciesFetched) {
      fetchPharmacies();
    }
  }, [pharmaciesFetched]);

  // Inactivity modal
  useEffect(() => {
    if (!showInactivityModal) return;
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  // Keyboard navigation for pharmacies list
  useEffect(() => {
    if (transportModalOpen) return;

    const handleKeyDown = (event) => {
      if (["ArrowDown", "ArrowUp", "Tab"].includes(event.key)) {
        event.stopPropagation();
        event.preventDefault();

        const totalItems = pharmaciesList.length;
        if (totalItems === 0) return;

        if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
          setSelectedPharmacyIndex((prev) => (prev + 1) % totalItems);
        } else if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
          setSelectedPharmacyIndex((prev) => (prev - 1 + totalItems) % totalItems);
        }
      } else if (event.key === "Enter" && selectedPharmacyIndex >= 0 && selectedPharmacyIndex < pharmaciesList.length) {
        handlePharmacySelect(pharmaciesList[selectedPharmacyIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [transportModalOpen, pharmaciesList.length, selectedPharmacyIndex]);

  // Scroll to selected pharmacy
  useEffect(() => {
    if (cardRefs.current[selectedPharmacyIndex]) {
      cardRefs.current[selectedPharmacyIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedPharmacyIndex]);

  // Keyboard navigation for transport modal
  useEffect(() => {
    if (!transportModalOpen) return;

    let justOpened = true;
    const timeout = setTimeout(() => {
      justOpened = false;
    }, 100);

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
          }
        } else if (event.key === "Escape") {
          setTransportModalOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleTransportKeyDown);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleTransportKeyDown);
    };
  }, [transportModalOpen, focusedTransportIndex, transportModes.length, transportElements]);

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setFocusedTransportIndex(0);
    setTimeout(() => {
      setTransportModalOpen(true);
    }, 50);
  };

  const handleTransportSelect = (mode) => {
    if (mode === 'close') {
      setTransportModalOpen(false);
      return;
    }
    setTransportModalOpen(false);
    navigate(`/directions-map?lat=${selectedPharmacy.latitude}&lon=${selectedPharmacy.longitude}&name=${encodeURIComponent(selectedPharmacy.name)}&transport=${mode}`);
  };

  const calculateDistance = (userCoords, pharmacy) => {
    if (!userCoords.lat || !userCoords.lon) return null;

    const R = 6371;
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

  if (error) {
    return <ErrorPage message={error} />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background_color">
      {/* Header */}
      <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <Link
            to="/insufficient-stock"
            state={{ drug }}
            ref={goBackButtonRef}
            className="flex items-center text-black hover:text-gray-600 transition-colors"
          >
            <config.icons.arrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-semibold text-black">Pharmacies proches</h1>
        </div>
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
      </div>

      {/* Medication Info Card */}
      <div className="px-8 py-4">
        <div className="bg-white rounded-xl p-6 flex justify-between items-center max-w-4xl">
          <span className="text-xl font-semibold text-black">{drug.label}</span>
          <span className="text-xl font-semibold text-black">
            {drug.price ? `${drug.price.toFixed(2)} € / unité` : ''}
          </span>
        </div>
      </div>

      {/* Disponible maintenant label */}
      <div className="px-8 py-4">
        <h2 className="text-2xl font-semibold text-black">Disponible maintenant</h2>
      </div>

      {/* Pharmacies List */}
      <div className="px-8 flex-1 pb-8">
        {loadingPharmacies ? (
          <div className="flex flex-col items-center justify-center w-full h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 w-full">
            {pharmaciesList.map((ph, i) => {
              const dist = calculateDistance(userCoords, ph);
              const walkingTime = dist ? Math.round(dist * 12) : null;
              return (
                <div
                  key={i}
                  ref={el => {
                    cardRefs.current[i] = el;
                    if (i === 0 && selectedPharmacyIndex === 0 && el) {
                      setTimeout(() => el.focus(), 0);
                    }
                  }}
                  className={`bg-white rounded-xl p-6 flex justify-between items-center transition-all duration-300
                    ${selectedPharmacyIndex === i ? 'ring-2 ring-pink-300 scale-[1.02]' : ''}`}
                  tabIndex={selectedPharmacyIndex === i ? 0 : -1}
                >
                  {/* Left side - Pharmacy info */}
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold text-black">{ph.name}</span>
                    {ph.address && (
                      <span className="text-base text-gray-500 mt-1">{ph.address}</span>
                    )}
                  </div>

                  {/* Right side - Distance and button */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      {dist !== null && (
                        <>
                          <div className="text-lg font-semibold text-black">{dist.toFixed(1)}km</div>
                          {walkingTime && (
                            <div className="text-sm text-gray-500">~{walkingTime} min</div>
                          )}
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handlePharmacySelect(ph)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePharmacySelect(ph);
                        }
                      }}
                      className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold
                        hover:scale-105 transition-transform duration-300"
                    >
                      CHOISIR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transport Modal */}
      {transportModalOpen && selectedPharmacy && (
        <ModalStandard onClose={() => setTransportModalOpen(false)}>
          <div className="flex flex-col items-center">
            <button
              ref={transportCloseButtonRef}
              className={`absolute top-4 right-4 ${config.padding.button} ${config.buttonColors.red} ${config.borderRadius.md}
                ${config.fontSizes.sm} ${config.shadows.md} ${config.buttonColors.redHover} ${config.transitions.default}
                ${config.focusStates.ring} ${focusedTransportIndex === transportModes.length ? 'ring-4 ring-pink-300 scale-110' : ''}`}
              tabIndex={focusedTransportIndex === transportModes.length ? 0 : -1}
              onClick={() => handleTransportSelect('close')}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTransportSelect('close');
                }
              }}
            >
              <config.icons.times className="mr-2" />
              Fermer
            </button>

            <div className={`${config.fontSizes.md} font-bold mb-4`}>
              Choisissez le mode de transport
            </div>
            <div className="flex flex-row gap-6">
              {transportModes.map((t, idx) => (
                <button
                  key={t.mode}
                  className={`flex flex-col items-center ${config.padding.button} ${config.borderRadius.md}
                    ${config.fontSizes.sm} font-semibold border-2 ${config.transitions.default}
                    ${config.focusStates.outline} ${focusedTransportIndex === idx ?
                    'border-pink-500 ring-4 ring-pink-300 scale-110 bg-white' : 'border-gray-300 bg-gray-100'}`}
                  tabIndex={focusedTransportIndex === idx ? 0 : -1}
                  onClick={() => handleTransportSelect(t.mode)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleTransportSelect(t.mode);
                    }
                  }}
                >
                  <span className={`${config.fontSizes.xl} mb-2`}>
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </ModalStandard>
      )}

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
              className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`}
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

export default NearbyPharmacies;
