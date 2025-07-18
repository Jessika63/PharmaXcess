import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';
import config from '../../config';
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

// Fix default icon issue with Leaflet in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function DirectionsMapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pharmacy = {
    latitude: parseFloat(searchParams.get('lat')),
    longitude: parseFloat(searchParams.get('lon')),
    name: searchParams.get('name')
  };
  const transport = searchParams.get('transport');
  const [routeCoords, setRouteCoords] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiCalledRef = useRef(false);

  // Keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(0); // 0: Go Back, 1: Medicine List, 2: Home, 3: Map
  const goBackRef = useRef(null);
  const medListRef = useRef(null);
  const homeRef = useRef(null);
  const mapRef = useRef(null);

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

  useEffect(() => {
    if (apiCalledRef.current) return;
    if (!pharmacy.latitude || !pharmacy.longitude || !pharmacy.name || !transport) {
      setError('Informations de pharmacie ou mode de transport manquantes.');
      setLoading(false);
      return;
    }
    apiCalledRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);
        const url =
          `${config.backendUrl}/get_direction?origin=${latitude},${longitude}` +
          `&destination=${pharmacy.latitude},${pharmacy.longitude}` +
          `&mode=${transport}`;
        fetchWithTimeout(url, undefined, 5000)
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            if (data.error) {
              setError('Erreur serveur: ' + data.error + (data.error_message ? ' - ' + data.error_message : ''));
            } else if (data.routes && data.routes.length > 0) {
              // ORS geometry is encoded polyline5 by default
              const geometry = data.routes[0].geometry;
              let coords = [];
              if (typeof geometry === 'string') {
                coords = polyline.decode(geometry);
              } else if (geometry && geometry.coordinates) {
                coords = geometry.coordinates.map(([lon, lat]) => [lat, lon]);
              }
              setRouteCoords(coords);
            } else {
              setError('Aucun itinéraire trouvé.' + (data.error_message ? ' - ' + data.error_message : ''));
            }
            setLoading(false);
          })
          .catch((err) => {
            if (err.message === 'Timeout') {
              setError('Le serveur ne répond pas (délai dépassé). Veuillez réessayer plus tard.');
            } else {
              setError('Erreur réseau ou serveur. Détail: ' + err.message);
            }
            setLoading(false);
          });
      },
      () => {
        setError('Impossible d\'obtenir votre position.');
        setLoading(false);
      }
    );
  }, [pharmacy, transport]);

  // Focus management
  useEffect(() => {
    const refs = [goBackRef, medListRef, homeRef, mapRef];
    if (refs[focusedIndex] && refs[focusedIndex].current) {
      refs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle left/right arrows and Enter
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (focusedIndex < 3) e.preventDefault();
        if (e.key === 'ArrowRight') {
          setFocusedIndex((prev) => (prev + 1) % 4);
        } else if (e.key === 'ArrowLeft') {
          setFocusedIndex((prev) => (prev - 1 + 4) % 4);
        }
      }
      // Prevent map panning with arrows when map is focused
      if (focusedIndex === 3 && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, navigate]);

  if (error) return <ErrorPage message={error} />;
  if (loading) {
    return (
      <div className={`w-full h-screen flex flex-col items-center justify-center bg-background_color`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid mb-4"></div>
        <div className={`${config.fontSizes.md} ${config.textColors.secondary}`}>Chargement de l'itinéraire...</div>
      </div>
    );
  }

  // Center map on pharmacy or user
  const center = pharmacy ? [pharmacy.latitude, pharmacy.longitude] : (userCoords || [0, 0]);

  return (
    <>
      {showInactivityModal && (
        <ModalStandard onClose={() => setShowInactivityModal(false)}>
          <div className={`${config.fontSizes.lg} font-bold mb-4`}>Inactivité détectée</div>
          <div className={`${config.fontSizes.sm} mb-4`}>Vous allez être redirigé vers l'accueil dans 1 minute...</div>
          <button className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`} onClick={() => setShowInactivityModal(false)}>Rester sur la page</button>
        </ModalStandard>
      )}
      <div className={`w-full h-screen flex flex-col items-center bg-background_color ${config.padding.container}`}>
        <div className="flex flex-row gap-6 mb-4">
          <button
            ref={goBackRef}
            tabIndex={focusedIndex === 0 ? 0 : -1}
            className={`${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${focusedIndex === 0 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`}
            onClick={() => { navigate('/insufficient-stock'); }}
          >
            <config.icons.arrowLeft className="mr-2" /> Retour
          </button>
          <button
            ref={medListRef}
            tabIndex={focusedIndex === 1 ? 0 : -1}
            className={`${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${focusedIndex === 1 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`}
            onClick={() => { navigate('/non-prescription-drugs'); }}
          >
            <config.icons.pills className="mr-2" /> Liste des médicaments
          </button>
          <button
            ref={homeRef}
            tabIndex={focusedIndex === 2 ? 0 : -1}
            className={`${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${focusedIndex === 2 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`}
            onClick={e => { e.preventDefault(); navigate('/'); }}
          >
            <config.icons.home className="mr-2" /> Accueil
          </button>
        </div>
        <div className="w-full h-full flex flex-col items-center">
          <h2 className={`${config.fontSizes.lg} font-bold mb-4`}>Itinéraire vers {pharmacy.name}</h2>
          <div
            ref={mapRef}
            tabIndex={focusedIndex === 3 ? 0 : -1}
            style={{ outline: focusedIndex === 3 ? '2px solid #ec4899' : 'none', borderRadius: 12, width: '100%' }}
          >
            <MapContainer center={center} zoom={13} style={{ width: '100%', height: '70vh' }} keyboard={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userCoords && (
                <Marker position={userCoords}>
                  <Popup>Votre position</Popup>
                </Marker>
              )}
              <Marker position={[pharmacy.latitude, pharmacy.longitude]}>
                <Popup>{pharmacy.name}</Popup>
              </Marker>
              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="blue" />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
}

export default DirectionsMapPage; 