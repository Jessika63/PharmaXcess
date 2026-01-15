import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config';
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { getPharmaciesCache, setPharmaciesCache } from '../../utils/pharmaciesCache';
import { getDefaultPosition } from '../../utils/positionUtils';

function DrugStoresAvailable() {
  const location = useLocation();
  const navigate = useNavigate();

  const [drugShops, setDrugShops] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [enterPressed, setEnterPressed] = useState(false);
  const buttonsRef = useRef([]);

  const [showInactivityModal, setShowInactivityModal] = useState(false);
  useInactivityRedirect(() => setShowInactivityModal(true));

  const handleKeyDown = (event) => {
    event.stopPropagation();

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab"].includes(event.key)) {
      event.preventDefault();
    }

    const maxIndex = buttonsRef.current.length - 1;

    if (event.key === "ArrowRight" || event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
      setFocusedIndex((prevIndex) => (prevIndex + 1) % (maxIndex + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
      setFocusedIndex((prevIndex) => (prevIndex - 1 + (maxIndex + 1)) % (maxIndex + 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      setEnterPressed(true);
    }
  };

  useEffect(() => {
    if (enterPressed) {
      if (focusedIndex === 0) {
        navigate('/' + (location.state?.from || ''));
      } else {
        alert(`Vous avez sélectionné : ${drugShops[focusedIndex - 1].label}`);
      }
      setEnterPressed(false);
    }
  }, [enterPressed, focusedIndex, location.state, navigate, drugShops]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (buttonsRef.current[focusedIndex]) {
      buttonsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    const fetchPharmacies = async (lat, lon) => {
      const MIN_LOADING_TIME = 5000; // 5 seconds minimum
      const start = Date.now();

      try {
        const radius = 10000;

        // Use cached data if available
        const cachedData = getPharmaciesCache();
        if (cachedData) {
          const formatted = cachedData.map((pharmacy, idx) => ({
            id: idx + 1,
            label: pharmacy.name || `Pharmacy ${idx + 1}`
          }));
          setDrugShops(formatted);

          // Ensure minimum loading time
          const elapsed = Date.now() - start;
          const remaining = MIN_LOADING_TIME - elapsed;
          if (remaining > 0) {
            setTimeout(() => setLoading(false), remaining);
          } else {
            setLoading(false);
          }
          return;
        }

        // Fetch from backend with 10-second timeout
        const response = await fetchWithTimeout(`${config.backendUrl}/get_pharmacies?lat=${lat}&lon=${lon}&radius=${radius}`, undefined, 10000);
        const data = await response.json();

        if (response.ok) {
          const formatted = data.pharmacies.map((pharmacy, idx) => ({
            id: idx + 1,
            label: pharmacy.name || `Pharmacy ${idx + 1}`
          }));
          setDrugShops(formatted);

          // Cache the data for future use
          setPharmaciesCache(data.pharmacies);
        } else {
          setError(data.error || 'Server Error');
        }
      } catch (err) {
        if (err.message === 'Timeout') {
          // Navigate to error page with "erreur réseau" message
          navigate('/error', {
            state: {
              message: 'Erreur réseau',
              from: location.pathname
            }
          });
          return;
        } else {
          setError('Network Error');
        }
      }

      // Ensure minimum loading time
      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;
      if (remaining > 0) {
        setTimeout(() => setLoading(false), remaining);
      } else {
        setLoading(false);
      }
    };

    // Use default position from backend (configured by --location flag)
    const initializePharmacies = async () => {
      try {
        const position = await getDefaultPosition();
        console.log('Using configured default position:', position);
        fetchPharmacies(position.lat, position.lon);
      } catch (error) {
        console.error("Failed to get position:", error);
        setError("Unable to determine position");
        setLoading(false);
      }
    };

    initializePharmacies();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const btn = buttonsRef.current[focusedIndex];
    if (btn) {
      btn.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (!showInactivityModal) {
      return;
    }
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (loading) {
    return (
      <div className={`w-full h-screen flex flex-col items-center justify-center bg-background_color`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid mb-4"></div>
        <div className={`${config.fontSizes.md} ${config.textColors.secondary}`}>
          Chargement des pharmacies...
        </div>
      </div>
    );
  }

  return (
    <>
      {showInactivityModal && (
        <ModalStandard onClose={() => setShowInactivityModal(false)}>
          <div className={`${config.fontSizes.lg} font-bold mb-4`}>
            Inactivité détectée
          </div>
          <div className={`${config.fontSizes.sm} mb-4`}>
            Vous allez être redirigé vers l'accueil dans 1 minute...
          </div>
          <button className={`
            ${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
            ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}
          `} onClick={() => setShowInactivityModal(false)}>
            Rester sur la page
          </button>
        </ModalStandard>
      )}
      <div
        className={`w-full h-screen flex flex-col items-center bg-background_color ${config.padding.container}`}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="w-4/5 flex justify-between items-center mb-12 mt-8">
          <div className="w-full flex justify-start mb-4">
            <button
              ref={(el) => (buttonsRef.current[0] = el)}
              tabIndex={0}
              className={`
                flex items-center ${config.padding.button} ${config.fontSizes.md} ${config.textColors.primary}
                ${config.buttonColors.mainGradient} ${config.borderRadius.lg} ${config.shadows.md} ${config.scaleEffects.hover}
                ${config.transitions.default} cursor-pointer ${focusedIndex === 0 ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}`
              }
              onClick={() => navigate('/' + (location.state?.from || ''))}
            >
              <config.icons.arrowLeft className="mr-3" />
              Retour
            </button>
          </div>

          <div className="flex-grow flex justify-center pr-16">
              <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-124 h-32" />
          </div>
        </div>

        {/* Main message */}
        <div
          className={`w-2/3 h-32 flex items-center justify-center text-center ${config.textColors.primary} ${config.fontSizes.lg}
          ${config.buttonColors.mainGradient} ${config.borderRadius.lg} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} mb-12`}
        >
          Voici la liste des pharmacies disposant du médicament souhaité :
        </div>

        {/* List of pharmacies */}
        <div
          className="w-4/5 h-[50vh] overflow-y-auto overflow-y-hidden p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200"
          tabIndex={0}
        >
          <div className={config.layout.buttonGrid}>
            {drugShops.map((item, index) => (
              <button
                key={item.id}
                ref={(el) => (buttonsRef.current[index + 1] = el)}
                tabIndex={0}
                type="button"
                className={`w-2/5 h-20 flex items-center justify-center ${config.fontSizes.md} ${config.textColors.primary}
                ${config.buttonColors.mainGradient} ${config.borderRadius.lg} ${config.shadows.md}
                ${config.scaleEffects.hover} ${config.transitions.default} cursor-pointer
                ${focusedIndex === index + 1 ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}`}
                onClick={(event) => {
                  event.preventDefault();
                  alert(`Vous avez sélectionné : ${item.label}`);
                }}
              >
                <config.icons.mapMarker className="mr-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default DrugStoresAvailable;
