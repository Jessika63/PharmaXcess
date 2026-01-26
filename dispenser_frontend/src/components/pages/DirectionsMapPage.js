
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import config from '../../config';
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { getDefaultPosition } from '../../utils/positionUtils';

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

  const pharmacy = useMemo(() => ({
    latitude: parseFloat(searchParams.get('lat')),
    longitude: parseFloat(searchParams.get('lon')),
    name: searchParams.get('name')
  }), [searchParams]);

  const transport = searchParams.get('transport');
  const [routeCoords, setRouteCoords] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [durationSec, setDurationSec] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const apiCalledRef = useRef(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null); 
  const [uniqueCode, setUniqueCode] = useState(null); 
  const [qrError, setQrError] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const qrIds = useRef([]); 
  const hasGenerated = useRef(false); 
  // Map focus state
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapFocused, setIsMapFocused] = useState(false); 
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  useInactivityRedirect(() => setShowInactivityModal(true));

  // Dismiss inactivity modal on user activity
  useEffect(() => {
    if (!showInactivityModal) {
      return;
    }
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  useEffect(() => {
    if (apiCalledRef.current) {
      return;
    }
    if (!pharmacy.latitude || !pharmacy.longitude || !pharmacy.name || !transport) {
      setError('Informations de pharmacie ou mode de transport manquantes.');
      setLoading(false);
      return;
    }
    apiCalledRef.current = true;

    const fetchDirections = async () => {
      try {
        // Use default position from backend (configured by --location flag)
        const position = await getDefaultPosition();
        console.log('Using configured default position for directions:', position);
        const originLat = position.lat;
        const originLon = position.lon;
        
        setUserCoords([originLat, originLon]);
        
        const url =
          `${config.backendUrl}/get_direction?origin=${originLat},${originLon}` +
          `&destination=${pharmacy.latitude},${pharmacy.longitude}` +
          `&mode=${transport}`;
          
        const res = await fetchWithTimeout(url, undefined, 5000);
        const data = await res.json();
        
        if (data.error) {
          setError('Erreur serveur: ' + data.error + (data.error_message ? ' - ' + data.error_message : ''));
        } else if (data.routes && data.routes.length > 0) {
          const {geometry} = data.routes[0];
          // capture duration if provided (in seconds)
          if (data.routes[0].duration) { 
            setDurationSec(data.routes[0].duration); 
          } else if (data.routes[0].legs && data.routes[0].legs[0] && data.routes[0].legs[0].duration) { 
            setDurationSec(data.routes[0].legs[0].duration); 
          }
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
      } catch (err) {
        if (err.message === 'Timeout') {
          setError('Le serveur ne répond pas (délai dépassé). Veuillez réessayer plus tard.');
        } else {
          setError('Erreur réseau ou serveur. Détail: ' + err.message);
        }
        setLoading(false);
      }
    };

    fetchDirections();
  }, [pharmacy, transport]);

  // Focus management
  // Keyboard zoom handling (map only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (mapInstanceRef.current) {
          e.preventDefault();
          if (e.key === 'ArrowUp') mapInstanceRef.current.zoomIn();
          else mapInstanceRef.current.zoomOut();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate QR code inline and cleanup generated codes on exit
  const deleteGeneratedQRs = async () => {
    if (qrIds.current.length === 0) return;
    try {
      await fetch(`${config.backendUrl}/delete_map_qr_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: qrIds.current }),
      });
      qrIds.current = [];
    } catch (err) {
      console.error('Error deleting QR codes:', err);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => deleteGeneratedQRs();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const generateQRCode = async () => {
      if (hasGenerated.current) return;
      if (!userCoords || !pharmacy || !transport) return;
      hasGenerated.current = true;
      setQrLoading(true);
      try {
        const response = await fetch(`${config.backendUrl}/generate_direction_qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { pharmacy: { name: pharmacy.name, latitude: pharmacy.latitude, longitude: pharmacy.longitude }, transport, userCoords } }),
        });
        if (response.ok) {
          const data = await response.json();
          qrIds.current.push(data.id);
          setQrCodeUrl(`data:image/png;base64,${data.image}`);
          setUniqueCode(data.code_unique);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setQrError(errorData.error || 'Erreur lors de la génération du QR code');
        }
      } catch (err) {
        setQrError('Erreur réseau: ' + err.message);
      } finally {
        setQrLoading(false);
      }
    };

    generateQRCode();

    return () => {
      // cleanup QR codes when leaving component
      deleteGeneratedQRs();
    };
  }, [userCoords, pharmacy, transport]);

  if (error) {
    return <ErrorPage message={error} />;
  }
  if (loading) {
    return (
      <div className={`w-full h-screen flex flex-col items-center justify-center bg-background_color`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid mb-4"></div>
        <div className={`${config.fontSizes.md} ${config.textColors.secondary}`}>
          Chargement de l'itinéraire...
        </div>
      </div>
    );
  }

  // Center map on pharmacy or user
  const center = pharmacy ? [pharmacy.latitude, pharmacy.longitude] : (userCoords || [0, 0]);

  const formatDuration = (seconds) => { 
    if (!seconds && seconds !== 0) return ''; 
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem === 0 ? `${hrs} h` : `${hrs} h ${rem} min`;
  };

  const formatMinutes = (mins) => { 
    if (mins === null || mins === undefined) return ''; 
    const m = Number(mins); 
    if (isNaN(m)) return ''; 
    if (m < 60) return `${m} min`; 
    const hrs = Math.floor(m / 60); 
    const rem = m % 60; 
    return rem === 0 ? `${hrs} h` : `${hrs} h ${rem} min`;
  };

  // Prefer route duration from API (in seconds), fallback to `estimate` query param (minutes)
  const estimateParam = searchParams.et('estimate'); 
  const displayDuration = durationSec ? formatDuration(durationSec) : (estimateParam ? formatMinutes(estimateParam) : null);
  return (
    <>
      {showInactivityModal && (
        <div className="fixed inset-0 z-50">
          <ModalStandard onClose={() => setShowInactivityModal(false)}>
            <div className={`${config.fontSizes.lg} font-bold mb-4`}>
              Inactivité détectée
            </div>
            <div className={`${config.fontSizes.sm} mb-4`}>
              Vous allez être redirigé vers l'accueil dans 1 minute...
            </div>
            <button className={
              `${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md}
              ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`
            } onClick={() => setShowInactivityModal(false)}>
              Rester sur la page
            </button>
          </ModalStandard>
        </div>
      )}
      <div className={`w-full h-screen flex flex-col items-center bg-background_color ${config.padding.container}`}>
              <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="flex items-center text-black hover:text-gray-600 transition-colors">
                    <config.icons.arrowLeft className="text-xl" />
                  </button>
                  <h1 className="text-3xl font-semibold text-black">Itinéraire</h1>
                </div>
                <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
              </div>
        <div className="w-full h-full flex flex-col items-center">
          <h2 className={`${config.fontSizes.lg} font-bold mb-4`}>
            Itinéraire vers {pharmacy.name}
          </h2>
          <div className={`mb-4 ${config.fontSizes.sm} ${config.textColors.secondary} text-center h-6`}>
            {isMapFocused && (
              <span>
                Utilisez les flèches <strong>↑</strong> et <strong>↓</strong> pour zoomer
              </span>
            )}
          </div>

          <div className="w-full flex flex-row gap-6">
            <div
              ref={mapRef}
              tabIndex={0}
              onFocus={() => setIsMapFocused(true)}
              onBlur={() => setIsMapFocused(false)}
              style={{
                outline: isMapFocused ? '2px solid #ec4899' : 'none',
                borderRadius: 12,
                width: '66%',
                height: '60vh',
                position: 'relative',
                zIndex: 1
              }}
            >
              <MapContainer
                center={center}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                keyboard={false}
                ref={mapInstanceRef}
              >
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

            <div className="w-1/3 bg-white text-black p-6 rounded-xl shadow-md flex flex-col items-center">
              <div className="mb-4 text-center">
                    <div className={`${config.fontSizes.md} font-bold`}>{pharmacy.name}</div>
                    <div className={`${config.fontSizes.sm} ${config.textColors.secondary} mt-2`}>
                      Mode: <span className="font-bold">{(
                        {
                          foot: 'À pied',
                          walking: 'À pied',
                          bicycle: 'À vélo',
                          bike: 'À vélo',
                          bus: 'Bus',
                          car: 'Voiture',
                          driving: 'Voiture'
                        }[transport] || transport
                      )}</span>
                    </div>
                    {displayDuration && (
                      <div className={`${config.fontSizes.sm} ${config.textColors.secondary} mt-2`}>
                        Durée estimée : <span className="font-bold">{displayDuration}</span>
                      </div>
                    )}
              </div>

              <div className="w-full flex flex-col items-center">
                {qrLoading && (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
                    <div className={`${config.fontSizes.sm}`}>Génération du QR code...</div>
                  </div>
                )}

                {qrError && <div className="text-red-500">{qrError}</div>}

                {qrCodeUrl && (
                  <>
                    <div className="text-center mb-2">Scannez ce QR via l'application mobile</div>
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mb-2" />
                    {uniqueCode && (
                      <div className="mt-2 font-mono text-lg">Code unique : <span className="font-bold">{uniqueCode}</span></div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto mb-8">
          <img
            src={config.icons.logo}
            alt="Logo PharmaXcess"
            className="w-40 h-auto opacity-60"
          />
        </div>
      </div>
    </>
  );
}

export default DirectionsMapPage;
