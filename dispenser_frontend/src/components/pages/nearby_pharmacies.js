import React, { useRef, useEffect, useState } from 'react';
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
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const cardRefs = useRef([]);
  const goBackButtonRef = useRef(null);
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
  }, [pharmaciesList.length, selectedPharmacyIndex]); 


  // Scroll to selected pharmacy
  useEffect(() => {
    if (cardRefs.current[selectedPharmacyIndex]) {
      cardRefs.current[selectedPharmacyIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedPharmacyIndex]);

  const handlePharmacySelect = (pharmacy) => {
    const dist = calculateDistance(userCoords, pharmacy); 
    navigate('/transport-mode', { 
      state: {
        pharmacy,
        drug, 
        distance: dist, 
        userCoords
      }
    });

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
