import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'
import { FaRedo, FaTimesCircle, FaClock, FaMapMarkerAlt, FaTimes, FaWalking, FaBicycle, FaBus, FaCar } from 'react-icons/fa';
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
    { mode: 'foot', label: 'À pied', icon: <FaWalking /> },
    { mode: 'bicycle', label: 'Vélo', icon: <FaBicycle /> },
    { mode: 'transit', label: 'Transports', icon: <FaBus /> },
    { mode: 'car', label: 'Voiture', icon: <FaCar /> },
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
              console.log('Geolocation denied');
              resolve();
            }
          );
        });
      }
    } catch (geoError) {
      console.log('Geolocation error');
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
        const response = await fetchWithTimeout(`http://localhost:5000/get_pharmacies?lat=${lat}&lon=${lon}`);
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
    console.log('handleTransportSelect called with:', mode);
    console.log('Navigating to /directions-map with:', selectedPharmacy, mode);
    navigate(`/directions-map?lat=${selectedPharmacy.latitude}&lon=${selectedPharmacy.longitude}&name=${encodeURIComponent(selectedPharmacy.name)}&transport=${mode}`);
  };

  return (
      <div className="bg-background_color min-h-screen w-full flex flex-col items-center justify-center">

          {/* Go Back Button */}
          <div className="w-4/5 flex items-center mt-6 mb-2">
            <button
              ref={goBackButtonRef}
              tabIndex={0}
              className={`text-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none flex items-center ${focusedIndex === 0 ? 'ring-4 ring-pink-300 scale-105' : ''}`}
              onClick={() => navigate('/non-prescription-drugs')}
            >
              <FaRedo className="mr-3" /> Retour
            </button>
          </div>

          {/* Header */}
          <div className="w-4/5 h-28 flex justify-center items-center mb-4 mt-2">
              {/* Logo */}
              <div className="flex justify-center items-center w-full">
                  <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-80 h-20" />
              </div>
          </div>

          {/* Information Message Container */}
          <div className="w-3/4 bg-background_color p-4 rounded-xl text-center mb-4">
              <p className="text-2xl text-gray-800">
                  Le stock est insuffisant pour ce médicament.<br />
                  Que souhaitez-vous faire ?
              </p>
          </div>

          {/* Container for centering both buttons */}
          <div className="flex flex-col items-center space-y-6 w-full max-w-xl">
      
              {/* Button 'Précommander ou récupérer plus tard' */}
              <button
                  ref={retryButtonRef}
                  tabIndex={0}
                  onClick={() => navigate('/preorder')}
                  className={`w-full h-24 flex items-center justify-center rounded-2xl shadow-lg 
                      bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-2xl cursor-pointer
                      transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
                      hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500
                      ${focusedIndex === 1 ? 'scale-105' : ''}`}
              >
                  <FaClock className="mr-4" />
                  Précommander ou récupérer plus tard
              </button>

              {/* Button 'Aller dans une autre pharmacie' */}
              <button
                  ref={cancelButtonRef}
                  tabIndex={0}
                  onClick={openPharmaciesModal}
                  className={`w-full h-24 flex items-center justify-center rounded-2xl shadow-lg 
                      bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-2xl
                      transition-transform duration-500 hover:from-[#d45b93] focus:outline-none
                      hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500
                      ${focusedIndex === 2 ? 'scale-105' : ''}`}
              >
                  <FaMapMarkerAlt className="mr-4" />
                  Aller dans une autre pharmacie
              </button>

          </div>

          {/* Pharmacies Modal */}
          {pharmaciesModalOpen && (
              <ModalStandard onClose={() => setPharmaciesModalOpen(false)}>
                  <div
                      ref={modalContentRef}
                      tabIndex={0}
                      autoFocus
                      className="w-full max-w-6xl flex flex-col items-center justify-center p-8"
                      onKeyDown={(e) => {
                          if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
                              e.stopPropagation();
                              e.preventDefault();
                              if (e.key === "ArrowRight") {
                                  setSelectedPharmacyIndex((prev) => Math.min(prev + 1, pharmaciesList.length - 1));
                              } else if (e.key === "ArrowLeft") {
                                  setSelectedPharmacyIndex((prev) => Math.max(prev - 1, -1));
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
                          className={`absolute top-6 right-8 flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-xl shadow hover:bg-red-600 transition focus:ring-4 focus:ring-red-300 ${selectedPharmacyIndex === -1 ? 'ring-4 ring-red-400 scale-105 z-10' : ''}`}
                          tabIndex={-1}
                          style={{ zIndex: 10 }}
                          onClick={() => {
                            setPharmaciesModalOpen(false);
                            setTimeout(() => {
                              if (cancelButtonRef.current) cancelButtonRef.current.focus();
                            }, 100);
                          }}
                      >
                          <FaTimes className="mr-2" /> Fermer
                      </button>
                      <div className="text-2xl text-gray-800 font-bold mb-6">Pharmacies à proximité</div>
                      {loadingPharmacies ? (
                          <div className="flex flex-col items-center justify-center w-full h-64">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
                              <div className="text-lg text-gray-600">Chargement...</div>
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
                                          className={`bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl shadow-lg p-3 w-64 flex flex-col items-start border-2 transition-transform duration-300 cursor-pointer 
                                          ${selectedPharmacyIndex === i ? 'border-pink-500 scale-105 ring-4 ring-pink-300 z-10' : 'border-pink-200'} 
                                          hover:scale-105 hover:ring-4 hover:ring-pink-300 hover:shadow-2xl focus:outline-none`}
                                          tabIndex={selectedPharmacyIndex === i ? 0 : -1}
                                          style={{ minHeight: '140px', flex: '0 0 auto' }}
                                          onClick={e => {
                                              e.stopPropagation();
                                              setSelectedPharmacy(ph);
                                              setTransportModalOpen(true);
                                              setFocusedTransportIndex(0);
                                          }}
                                          onKeyDown={e => {
                                              if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  setSelectedPharmacy(ph);
                                                  setTransportModalOpen(true);
                                                  setFocusedTransportIndex(0);
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
                  <div
                      className="flex flex-col items-center"
                      tabIndex={0}
                      onKeyDown={e => {
                          // Trap arrow keys and tab inside modal
                          if (["ArrowRight", "ArrowLeft", "Tab"].includes(e.key)) {
                              e.stopPropagation();
                              if (e.key === "ArrowRight") {
                                  setFocusedTransportIndex((prev) => (prev + 1) % transportModes.length);
                                  e.preventDefault();
                              } else if (e.key === "ArrowLeft") {
                                  setFocusedTransportIndex((prev) => (prev - 1 + transportModes.length) % transportModes.length);
                                  e.preventDefault();
                              } else if (e.key === "Tab") {
                                  // Trap tab within modal
                                  e.preventDefault();
                                  setFocusedTransportIndex((prev) => {
                                      if (!e.shiftKey) {
                                          return (prev + 1) % transportModes.length;
                                      } else {
                                          return (prev - 1 + transportModes.length) % transportModes.length;
                                      }
                                  });
                              }
                          } else if (e.key === "Enter") {
                              e.preventDefault();
                              handleTransportSelect(transportModes[focusedTransportIndex].mode);
                          }
                      }}
                  >
                      <div className="text-2xl font-bold mb-4">Choisissez le mode de transport</div>
                      <div className="flex flex-row gap-6">
                          {transportModes.map((t, idx) => (
                              <button
                                  key={t.mode}
                                  className={`flex flex-col items-center px-6 py-4 rounded-xl text-xl font-semibold border-2 transition-all duration-200 focus:outline-none 
                                    ${focusedTransportIndex === idx ? 'border-pink-500 ring-4 ring-pink-300 scale-110 bg-white' : 'border-gray-300 bg-gray-100'}
                                  `}
                                  tabIndex={focusedTransportIndex === idx ? 0 : -1}
                                  onClick={() => handleTransportSelect(t.mode)}
                                  autoFocus={focusedTransportIndex === idx}
                              >
                                  <span className="text-4xl mb-2">{t.icon}</span>
                                  {t.label}
                              </button>
                          ))}
                      </div>
                  </div>
              </ModalStandard>
          )}

          {showInactivityModal && (
            <ModalStandard onClose={() => setShowInactivityModal(false)}>
              <div className="text-3xl font-bold mb-4">Inactivité détectée</div>
              <div className="text-xl mb-4">Vous allez être redirigé vers l'accueil dans 1 minute...</div>
              <button className="px-8 py-4 bg-white text-pink-500 text-2xl rounded-xl shadow hover:scale-105 transition-transform duration-300" onClick={() => setShowInactivityModal(false)}>Rester sur la page</button>
            </ModalStandard>
          )}
      </div>
  );

}

export default InsufficientStock; 