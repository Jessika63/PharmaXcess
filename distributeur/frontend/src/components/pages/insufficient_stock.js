import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'
import { FaRedo, FaTimesCircle, FaClock, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import ModalStandard from '../modal_standard';

function InsufficientStock() {

  const navigate = useNavigate()
  const location = useLocation()

  const retryButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [pharmaciesModalOpen, setPharmaciesModalOpen] = useState(false);
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [userCoords, setUserCoords] = useState({ lat: null, lon: null });
  const [selectedPharmacyIndex, setSelectedPharmacyIndex] = useState(0);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  
  const modalContentRef = useRef(null);
  const cardRefs = useRef([]);

  // Add a ref to prevent double fetch in StrictMode
  const fetchedOnce = useRef(false);

  // Add a ref to the close button
  const closeButtonRef = useRef(null);

  // Add a cache for pharmacies
  const pharmaciesCache = useRef({});

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      setFocusedIndex((prevIndex) => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowLeft") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    }
  };

  useEffect(() => {
    if (focusedIndex === 0 && retryButtonRef.current) {
      retryButtonRef.current.focus();
    } else if (focusedIndex === 1 && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
        const response = await fetch(`http://localhost:5000/get_pharmacies?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        if (data.pharmacies && data.pharmacies.length > 0) {
          setPharmaciesList(data.pharmacies);
          pharmaciesCache.current[cacheKey] = data.pharmacies;
        }
      } catch (err) {
        console.log('Error loading pharmacies');
      }
    }
    setLoadingPharmacies(false);
  };

  return (
      <div className="bg-background_color w-full h-screen flex flex-col justify-center items-center">

          {/* Go Back Button */}
          <div className="w-4/5 flex items-center mt-8 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none flex items-center"
            >
              <FaRedo className="mr-3" /> Retour
            </button>
          </div>

          {/* Header */}
          <div className="w-4/5 h-32 flex justify-center items-center mb-8 mt-8">
              {/* Logo */}
              <div className="flex justify-center items-center w-full">
                  <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-96 h-24" />
              </div>
          </div>

          {/* Information Message Container */}
          <div className="w-3/4 bg-background_color p-6 rounded-xl text-center mb-8">
              <p className="text-3xl text-gray-800">
                  Le stock est insuffisant pour ce médicament.<br />
                  Que souhaitez-vous faire ?
              </p>
          </div>

          {/* Container for centering both buttons */}
          <div className="flex flex-col items-center space-y-12 w-full">
      
              {/* Button 'Précommander ou récupérer plus tard' */}
              <div tabIndex={0}
                  ref={retryButtonRef}
                  onClick={() => navigate('/' + (location.state?.from || '/#'))}
                  onKeyDown={(event) => {
                      if (event.key === "Enter") {
                          navigate('/' + (location.state?.from || '/#'));
                      }
                  }}
                  className={`w-2/5 h-36 flex items-center justify-center rounded-2xl shadow-lg 
                      bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-3xl cursor-pointer
                      transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
                      hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500
                      ${focusedIndex === 0 ? 'scale-105' : ''}`}
              >
                  <FaClock className="mr-4" />
                  Précommander ou récupérer plus tard
              </div>

              {/* Button 'Aller dans une autre pharmacie' */}
              <div tabIndex={0}
                  ref={cancelButtonRef}
                  onClick={openPharmaciesModal}
                  onKeyDown={(event) => {
                      if (event.key === "Enter") {
                          openPharmaciesModal();
                      }
                  }}
                  className={`w-2/5 h-36 flex items-center justify-center rounded-2xl shadow-lg 
                      bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-3xl
                      transition-transform duration-500 hover:from-[#d45b93] focus:outline-none
                      hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500
                      ${focusedIndex === 1 ? 'scale-105' : ''}`}
              >
                  <FaMapMarkerAlt className="mr-4" />
                  Aller dans une autre pharmacie
              </div>

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
      </div>
  );

}

export default InsufficientStock; 