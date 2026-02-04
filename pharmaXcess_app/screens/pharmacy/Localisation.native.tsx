
import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Dimensions, Animated, Vibration, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { CameraView, Camera } from 'expo-camera';
import polyline from '@mapbox/polyline';
import createStyles from '../../styles/Localisation.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Distributor = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

type TransportMode = 'driving' | 'walking' |  'cycling'; 

type TransportOption = { 
  mode: TransportMode; 
  icon: string; 
  label: string;
  color: string;
}; 


export default function Localisation(): React.ReactElement {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [selectedTransportMode, setSelectedTransportMode] = useState<TransportMode>('walking');
  
  // State for the navigation in real-time
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [nextInstruction, setNextInstruction] = useState<string>('');
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  
  // State for the QR code scanner
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  // Unique code (entered by user or provided by QR)
  const [uniqueCode, setUniqueCode] = useState<string>('');
  
  // Ref to control the map
  const mapRef = useRef<MapView>(null); 

  // Transport mode state 
  const transportOptions: TransportOption[] = [
    { mode: 'driving', icon: '🚗', label: 'Voiture', color: colors.secondary },
    { mode: 'cycling', icon: '🚴', label: 'Vélo', color: colors.secondary },
    { mode: 'walking', icon: '🚶', label: 'À pied', color: colors.secondary },
  ];

  // Helper to map backend transport strings to our TransportMode
  const mapTransportMode = (transport?: string): TransportMode => {
    if (!transport) return 'walking';
    const t = transport.toLowerCase();
    if (t === 'bicycle' || t === 'bike' || t === 'bicycling') return 'cycling';
    if (t === 'car' || t === 'driving' || t === 'vehicle') return 'driving';
    if (t === 'walk' || t === 'walking' || t === 'pedestrian') return 'walking';
    // default
    return 'walking';
  };

  // States for the sliding panel 
  const screenHeight = Dimensions.get('window').height;
  const panelHeight = screenHeight * 0.6; // 60% of the screen height
  const peekHeight = 120; // Height of the closed panel

  const translateY = useRef(new Animated.Value(panelHeight - peekHeight)).current;
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Get the frontend ENV 
  const env = process.env.EXPO_PUBLIC_ENV || 'development';

  // Dynamic choice of the backend URL
  const BACKEND_URL =
    env === 'production'
      ? process.env.EXPO_PUBLIC_BACKEND_URL
      : process.env.EXPO_PUBLIC_NGROK_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  // Function to calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Return the distance rounded to 1 decimal place 
    return Math.round(distance * 10) / 10; 
  };


  // Function to toggle the panel open/close
  const togglePanel = () => {
    const toValue = isPanelOpen ? panelHeight - peekHeight : 0;
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    setIsPanelOpen(!isPanelOpen);
  };

  // Function to request camera permission
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const openQRScanner = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setIsQRScannerOpen(true);
      setScanned(false);
    } else {
      Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire pour scanner les QR codes');
    }
  };

  const closeQRScanner = () => {
    setIsQRScannerOpen(false);
    setScanned(false);
  };

  // Allow user to manually use the unique code as alternative to scanning
  const handleManualCodeUse = async () => {
    if (!uniqueCode || uniqueCode.trim() === '') {
      Alert.alert('Code manquant', 'Entrez le code unique.');
      return;
    }

    // Call backend to resolve the direction QR by code and process the returned data
    try {
      const data = await callReadDirectionByCode(uniqueCode);
      if (data && data.success && data.qrcode) {
        await processQRCodePayload(data.qrcode);
        // Close modal after processing
        closeQRScanner();
        return;
      }

      // If backend response indicates error, show it
      Alert.alert('Erreur', data?.error || 'Impossible de récupérer les données du code');
    } catch (err) {
      console.error('Erreur lors de l\'appel read_direction_qr_by_code:', err);
      Alert.alert('Erreur', 'Impossible d\'appeler le serveur');
    }
  };

  // Helper to call backend endpoint read_direction_qr_by_code and log response
  const callReadDirectionByCode = async (code: string) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/read_direction_qr_by_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_unique: code }),
      });
      const data = await resp.json();
      return data;
    } catch (err) {
      console.error('Erreur read_direction_qr_by_code:', err);
      return null;
    }
  };

  // Process the payload returned by the backend (either object or JSON string)
  const processQRCodePayload = async (qrcodePayload: any) => {
    try {
      const payload = typeof qrcodePayload === 'string' ? JSON.parse(qrcodePayload) : qrcodePayload;

      if (!payload || !payload.pharmacy) {
        console.warn('Payload QR invalid or missing pharmacy:', payload);
        return;
      }

      const distributorFromQR: Distributor = {
        id: payload.pharmacy.id || Date.now(),
        name: payload.pharmacy.name,
        latitude: payload.pharmacy.latitude,
        longitude: payload.pharmacy.longitude,
        distance: payload.pharmacy.distance,
      };

      setSelectedDistributor(distributorFromQR);

      // Map transport
      if (payload.transport) {
        setSelectedTransportMode(mapTransportMode(payload.transport));
      }

      // If route coordinates are present in payload, use them
      if (payload.route && payload.route.coordinates) {
        setRouteCoordinates(payload.route.coordinates);

        if (payload.route.legs && payload.route.legs[0] && payload.route.legs[0].steps) {
          setRouteSteps(payload.route.legs[0].steps);
          if (payload.route.legs[0].steps.length > 0) {
            setNextInstruction(payload.route.legs[0].steps[0].html_instructions || payload.route.legs[0].steps[0].maneuver?.instruction || 'Suivez la route');
          }
        }
      } else {
        // Otherwise, request directions from backend using provided userCoords or current location
        try {
          // Always prefer the device's real location as origin; fallback to payload.userCoords only if location is not available
          const origin = location
            ? `${location.coords.latitude},${location.coords.longitude}`
            : (payload.userCoords && Array.isArray(payload.userCoords) && payload.userCoords.length >= 2
              ? `${payload.userCoords[0]},${payload.userCoords[1]}`
              : null);

          const destination = `${distributorFromQR.latitude},${distributorFromQR.longitude}`;

          if (origin) {
            const resp = await fetch(
              `${BACKEND_URL}/get_direction?origin=${origin}&destination=${destination}&mode=${mapTransportMode(payload.transport)}`
            );
            const directionData = await resp.json();

            if (resp.ok && directionData.routes && directionData.routes.length > 0) {
              const route = directionData.routes[0];
              const geom = route.geometry;

              let coords: { latitude: number; longitude: number }[] = [];
              if (typeof geom === 'string') {
                coords = polyline.decode(geom).map(([lat, lon]: [number, number]) => ({ latitude: lat, longitude: lon }));
              } else if (geom && geom.coordinates) {
                coords = geom.coordinates.map(([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon }));
              }

              setRouteCoordinates(coords);

              // Extract steps/instructions if present
              if (route.legs && route.legs[0] && route.legs[0].steps) {
                const steps = route.legs[0].steps;
                setRouteSteps(steps);
                if (steps.length > 0) {
                  setNextInstruction(steps[0].html_instructions || steps[0].maneuver?.instruction || 'Suivez la route');
                }
              }
            }
          }
        } catch (err) {
          console.error('Erreur fetch direction (processQRCodePayload):', err);
        }
      }

      // Center map and open panel
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: distributorFromQR.latitude,
          longitude: distributorFromQR.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      setIsPanelOpen(true);
    } catch (err) {
      console.error('Erreur processQRCodePayload:', err);
    }
  };

  // Simplified and robust handler for scanned QR code
  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {

      // Call backend to decode/decrypt the content
      try {
        const resp = await fetch(`${BACKEND_URL}/read_direction_qr_content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data }),
        });

        const result = await resp.json();

        if (resp.ok && result && result.success && result.qrcode) {
          // If backend returned decoded qrcode content, process it to draw itinerary
          try {
            await processQRCodePayload(result.qrcode);
          } catch (e) {
            console.error('Erreur processing decoded qrcode payload:', e);
          }
        } else {
          // log server error details; show a minimal alert so user knows
          console.warn('read_direction_qr_content did not return success:', result);
          if (result && result.error) {
            Alert.alert('Erreur serveur', result.error);
          }
        }
      } catch (err) {
        console.error('Erreur appel read_direction_qr_content:', err);
        Alert.alert('Erreur', 'Impossible de contacter le serveur pour décoder le QR');
      }

      // Close the scanner and reset scanned flag after a short delay
      closeQRScanner();
      setTimeout(() => setScanned(false), 500);
    } catch (err) {
      console.error('Error handling scanned QR code:', err);
      Alert.alert('Erreur', 'Impossible de lire les données du QR code');
      closeQRScanner();
      setTimeout(() => setScanned(false), 500);
    }
  };

  // Recalculate the itinerary if we change the transport mode
  useEffect(() => { 
    if (routeCoordinates.length > 0) {
      if (isNavigating && selectedDistributor && location) {
        
        recalculateRoute(location);
      } else {
        // Delete the itinerary
        setRouteCoordinates([]);
      }
    }
  }, [selectedTransportMode]);

  // Function to start the navigation in real-time
  const startNavigation = async () => {
    if (!selectedDistributor || !location) {
      Alert.alert('Erreur', 'Sélectionnez une pharmacie et vérifiez votre position');
      return;
    }

    setIsNavigating(true);
    
    // Ask the permission for the localisation
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'La localisation en arrière-plan est nécessaire pour la navigation');
      return;
    }

    // Start the navigation
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, //  Update every second
        distanceInterval: 5, // Update every 5 meters
      },
      (newLocation) => {
        updateNavigationProgress(newLocation);
      }
    );

    setLocationSubscription(subscription);
  };

  // Function to stop the navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStep(0);
    setRouteSteps([]);
    setRemainingDistance('');
    setEstimatedTime('');
    setNextInstruction('');
    
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  // Function to update the informations of the navigation
  const updateNavigationInfo = (currentLocation: Location.LocationObject) => {
    if (!selectedDistributor) return;

    // Calculate the distance
    const distanceToDestination = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      selectedDistributor.latitude,
      selectedDistributor.longitude
    );

    // Format the distance
    if (distanceToDestination < 1) {
      setRemainingDistance(`${Math.round(distanceToDestination * 1000)} m`);
    } else {
      setRemainingDistance(`${distanceToDestination.toFixed(1)} km`);
    }

    // Calculate the estimate time
    let speedKmh = 5; //  Default speed
    switch (selectedTransportMode) {
      case 'driving': speedKmh = 30; break;
      case 'cycling': speedKmh = 15; break;
      case 'walking': speedKmh = 5; break;
    }
    
    const timeHours = distanceToDestination / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    setEstimatedTime(`${timeMinutes} min`);
  };

  // Function to update the navigation progress
  const updateNavigationProgress = (newLocation: Location.LocationObject) => {
    setLocation(newLocation);
    
    // Update the map on the new position within the navigation
    if (isNavigating && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
        latitudeDelta: 0.01, // With the navigation, zoom more
        longitudeDelta: 0.01,
      }, 1000);
    }
    
    if (routeCoordinates.length === 0) return;

    // Update the time and the distance
    updateNavigationInfo(newLocation);

    // Verify if arrived to the destination
    const distanceToDestination = calculateDistance(
      newLocation.coords.latitude,
      newLocation.coords.longitude,
      selectedDistributor!.latitude,
      selectedDistributor!.longitude
    );

    if (distanceToDestination < 0.05) { // Less than 50 meters
      // Arrived to the destination
      Alert.alert('Arrivé!', 'Vous êtes arrivé à la pharmacie');
      stopNavigation();
      return;
    }

    // Verify if the user follow or not the itinerary
    if (routeCoordinates.length > 0) {
      const nearestPoint = findNearestPointOnRoute(newLocation.coords, routeCoordinates);
      const distanceFromRoute = calculateDistance(
        newLocation.coords.latitude,
        newLocation.coords.longitude,
        nearestPoint.latitude,
        nearestPoint.longitude
      );

      // If the user is to far (more than 1 km) from the itinerary, calculate th new itinerary
      if (distanceFromRoute > 0.1) {
        console.log('Utilisateur écarté de la route, recalcul...');
        recalculateRoute(newLocation);
      }
    }
  };

  // Function to find the nearest point
  const findNearestPointOnRoute = (currentPos: any, route: any[]) => {
    let nearestPoint = route[0];
    let minDistance = calculateDistance(
      currentPos.latitude,
      currentPos.longitude,
      route[0].latitude,
      route[0].longitude
    );

    route.forEach(point => {
      const distance = calculateDistance(
        currentPos.latitude,
        currentPos.longitude,
        point.latitude,
        point.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint;
  };

  // Function to recalculate the itinerary 
  const recalculateRoute = async (currentLocation: Location.LocationObject) => {
    if (!selectedDistributor) return;

    try {
      const origin = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
      const destination = `${selectedDistributor.latitude},${selectedDistributor.longitude}`;
      const response = await fetch(
        `${BACKEND_URL}/get_direction?origin=${origin}&destination=${destination}&mode=${selectedTransportMode}`
      );
      const data = await response.json();

      if (response.ok && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const geom = route.geometry;
        
        let coords: { latitude: number; longitude: number }[] = [];
        if (typeof geom === 'string') {
          coords = polyline.decode(geom).map(([lat, lon]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          }));
        } else if (geom.coordinates) {
          coords = geom.coordinates.map(([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          }));
        }

        setRouteCoordinates(coords);
        
        // Update the distance/time
        if (isNavigating) {
          updateNavigationInfo(currentLocation);
        }
        
        // Update the instructions
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          const steps = route.legs[0].steps;
          setRouteSteps(steps);
          if (steps.length > 0) {
            const newInstruction = steps[0].html_instructions || steps[0].maneuver?.instruction || 'Suivez la route';
            
            // Vibration if there is a new instruction
            if (newInstruction !== nextInstruction && (
              newInstruction.toLowerCase().includes('tournez') ||
              newInstruction.toLowerCase().includes('virage') ||
              newInstruction.toLowerCase().includes('sortez')
            )) {
              Vibration.vibrate([0, 100, 100, 100]); 
            }
            
            setNextInstruction(newInstruction);
          }
        }
      }
    } catch (error) {
      console.error('Erreur recalcul itinéraire:', error);
    }
  };

  // Clean when we close the app
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  useEffect(() => {
    (async () => {
      try {
        console.log('📍 Demande permission localisation...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('📍 Status permission:', status);
        
        if (status !== 'granted') {
          console.log('❌ Permission refusée');
          Alert.alert('Permission refusée', "Accordez la permission d'accéder à votre position.");
          return;
        }

        console.log('📍 Récupération position actuelle...');
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log('✅ Position obtenue:', currentLocation.coords);
        setLocation(currentLocation);

        console.log('🏥 Récupération pharmacies...');
        const response = await fetch(
          `${BACKEND_URL}/get_pharmacies?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Pharmacies reçues:', data.pharmacies?.length || 0);
        
        if (data.pharmacies) {
          const pharmaciesWithDistance = data.pharmacies.map((ph: any, index: number) => {
            const distance = calculateDistance(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude,
              ph.latitude,
              ph.longitude
            );
            
            return {
              id: index,
              name: ph.name,
              latitude: ph.latitude,
              longitude: ph.longitude,
              distance: distance,
            };
          });

          // List the pharmacies by distance
          pharmaciesWithDistance.sort((a: Distributor, b: Distributor) => (a.distance || 0) - (b.distance || 0));
          
          setDistributors(pharmaciesWithDistance);
        } else {
          console.log('⚠️ Aucune pharmacie dans la réponse');
          Alert.alert('Erreur', data.error || 'Impossible de récupérer les pharmacies');
        }
      } catch (error: any) {
        console.error('❌ Erreur dans useEffect localisation:', error);
        console.error('Stack:', error?.stack);
        Alert.alert('Erreur', error?.message || 'Impossible de récupérer la localisation ou les pharmacies.');
      }
    })();
  }, []);

    const handleGoToDistributor = async () => {
    if (!selectedDistributor) return;

    if (!location) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      return;
    }

    try {
      const origin = `${location.coords.latitude},${location.coords.longitude}`;
      const destination = `${selectedDistributor.latitude},${selectedDistributor.longitude}`;
      const response = await fetch(
        `${BACKEND_URL}/get_direction?origin=${origin}&destination=${destination}&mode=${selectedTransportMode}`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        Alert.alert('Erreur itineraire', data.error || 'Impossible de recuperer l\'itineraire');
        return;
      }

      let coords: { latitude: number; longitude: number }[] = [];
      let steps: any[] = [];
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const geom = route.geometry;
        
        // Extract the coords
        if (typeof geom === 'string') {
          coords = polyline.decode(geom).map(([lat, lon]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          }));
        } else if (geom.coordinates) {
          coords = geom.coordinates.map(([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          }));
        }

        // Extract the instructions for the navigation
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          steps = route.legs[0].steps;
          setRouteSteps(steps);
          
          // Create the first instruction
          if (steps.length > 0) {
            setNextInstruction(steps[0].html_instructions || steps[0].maneuver?.instruction || 'Suivez la route');
          }
        }
      }

      setRouteCoordinates(coords);
      
      // Close the panel smoothly to better see the route and navigation button
      setIsPanelOpen(false);
      Animated.spring(translateY, {
        toValue: panelHeight - peekHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } catch (err) {
      console.error('Erreur fetch direction:', err);
      Alert.alert('Erreur', "Impossible de recuperer l'itineraire");
    }
  };

  const renderDistributor = ({ item }: { item: Distributor }) => {
    // Format the distance for display 
    const formatDistance = (distance: number | undefined): string => {
      if (!distance) return 'Distance inconnue';
      
      if (distance < 1) {
        // If less than 1km, display in meters 
        return `${Math.round(distance * 1000)} m`;
      } else {
        // If more than 1km, display in kilometers with 1 decimal place 
        return `${distance.toFixed(1)} km`;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.distributorItem, selectedDistributor?.id === item.id && { backgroundColor: colors.accent }]}
        onPress={() => setSelectedDistributor(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.distributorText, selectedDistributor?.id === item.id && { color: colors.background }]}>
            {item.name}
          </Text>
          <Text style={[styles.distanceText, selectedDistributor?.id === item.id && { color: colors.background }]}>
            📍 {formatDistance(item.distance)}
          </Text>
        </View>
        {item.distance && item.distance <= 2 && (
          <View style={styles.statusBadgeClose}>
            <Text style={styles.statusBadgeText}>
              PROCHE
            </Text>
          </View>
        )}
        {item.distance && item.distance > 5 && (
          <View style={styles.statusBadgeFar}>
            <Text style={styles.statusBadgeText}>
              LOIN
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Map in background  */} 
      {location && (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: isNavigating ? 0.01 : 0.0922,
            longitudeDelta: isNavigating ? 0.01 : 0.0421,
          }}
          showsUserLocation={isNavigating}
          followsUserLocation={isNavigating}
          showsMyLocationButton={false}
        >
          {/* Pin your location  */}
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            title="Votre position"
            pinColor={colors.secondary}
          />
          
          {/* Pin the pharmacies locations */}
          {distributors.map((distributor) => {
            const isSelected = selectedDistributor?.id === distributor.id;
            const pinColor = isSelected ? "blue" : "green";
            
            return (
              <Marker
                key={`${distributor.id}-${isSelected ? 'selected' : 'unselected'}`}
                coordinate={{ latitude: distributor.latitude, longitude: distributor.longitude }}
                title={distributor.name}
                pinColor={pinColor}
                onPress={() => setSelectedDistributor(distributor)}
              />
            );
          })}

          {/* Display the itinerary if available */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              coordinates={routeCoordinates} 
              strokeColor={transportOptions.find(opt => opt.mode === selectedTransportMode)?.color || colors.secondary} 
              strokeWidth={4} 
            />
          )}
        </MapView>
      )}

      {/* Navigation in real-time */}
      {isNavigating && (
        <View style={styles.navigationContainer}>
          <View style={styles.navigationHeader}>
            <Text style={styles.navigationIcon}>
              {transportOptions.find(opt => opt.mode === selectedTransportMode)?.icon}
            </Text>
            <View style={styles.navigationInfo}>
              <Text style={styles.navigationDistance}>
                {remainingDistance} • {estimatedTime}
              </Text>
              <Text style={styles.navigationDestination}>
                vers {selectedDistributor?.name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={stopNavigation}
              style={styles.stopButton}
            >
              <Text style={styles.stopButtonText}>STOP</Text>
            </TouchableOpacity>
          </View>
          
          {nextInstruction && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                🔄 {nextInstruction.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Button to recenter the map */}
      {location && (
        <TouchableOpacity
          style={[styles.recenterButton, {
            bottom: isNavigating ? 140 : (isPanelOpen ? 400 : 200),
            right: 16,
          }]}
          onPress={() => {
            if (mapRef.current && location) {
              mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: isNavigating ? 0.01 : 0.0922,
                longitudeDelta: isNavigating ? 0.01 : 0.0421,
              }, 1000);
            }
          }}
        >
          <Text style={styles.recenterIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Button to open QR scanner - positioned above the location button */}
      <TouchableOpacity
        style={[styles.qrButton, {
          bottom: isNavigating ? 200 : (isPanelOpen ? 460 : 260),
          right: 16,
        }]}
        onPress={openQRScanner}
      >
        <Text style={styles.qrIcon}>📷</Text>
      </TouchableOpacity>

      {/* Sliding panel at the bottom */}
      <Animated.View
        style={[styles.slidingPanel, {
          height: panelHeight,
          transform: [{ translateY }],
        }]}
      >
        {/* Swipe handle with visual indicator */}
        <TouchableOpacity 
          onPress={togglePanel} 
          style={styles.swipeHandle}
        >
          <View style={[styles.swipeIndicator, {
            backgroundColor: isPanelOpen ? colors.primary : colors.inputBorder,
          }]} />
          <Text style={styles.swipeText}>
            {isPanelOpen ? '▼ Réduire' : '▲ Voir plus'}
          </Text>
        </TouchableOpacity>

        {/* Panel header */}
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>
            📍 {distributors.length} pharmacies trouvées
          </Text>
          <Text style={styles.panelSubtitle}>
            Triées par distance
          </Text>
        </View>

        {/* Pharmacies list  */}
        <FlatList
          data={distributors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDistributor}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            selectedDistributor && (
              <View style={[styles.selectedDistributor, { marginTop: 20 }]}>
                <Text style={styles.text}>🎯 Destination : {selectedDistributor.name}</Text>
                <Text style={[styles.text, { fontSize: 14, color: colors.infoTextSecondary, marginTop: 5 }]}>
                  📍 Départ depuis votre position actuelle
                </Text>

                {/* Previously the unique code input was here; moved to the scanner modal per UX request. */}

                
                {/* Transportation mode selector */}
                <Text style={styles.transportModeLabel}>
                  🚶 Mode de transport :
                </Text>
                <View style={styles.transportModeContainer}>
                  {transportOptions.map((option) => (
                    <TouchableOpacity
                      key={option.mode}
                      style={[styles.transportModeButton, {
                        backgroundColor: selectedTransportMode === option.mode ? option.color : colors.inputBorder + '40',
                        borderColor: selectedTransportMode === option.mode ? option.color : 'transparent',
                      }]}
                      onPress={() => setSelectedTransportMode(option.mode)}
                    >
                      <Text style={styles.transportModeIcon}>{option.icon}</Text>
                      <Text style={[styles.transportModeText, {
                        fontWeight: selectedTransportMode === option.mode ? 'bold' : 'normal',
                        color: selectedTransportMode === option.mode ? 'white' : colors.profileText,
                      }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.goButton} onPress={handleGoToDistributor}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradientButton}>
                    <Text style={styles.text}>
                      {transportOptions.find(opt => opt.mode === selectedTransportMode)?.icon} Afficher l'itinéraire
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Navigation button in real-time  */}
                {routeCoordinates.length > 0 && !isNavigating && (
                  <TouchableOpacity 
                    style={[styles.goButton, styles.startNavigationButton]} 
                    onPress={startNavigation}
                  >
                    <View style={[styles.gradientButton, styles.startNavigationButton]}>
                      <Text style={styles.text}>
                        🧭 Démarrer la navigation
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )
          }
        />
      </Animated.View>

      {/* Modal for the qr scanner */}
      <Modal
        visible={isQRScannerOpen}
        animationType="slide"
        onRequestClose={closeQRScanner}
      >
        <View style={styles.modalContainer}>
          {/* Scanner header  */}
          <View style={styles.scannerHeader}>
            <View style={styles.scannerHeaderRow}>
              <Text style={styles.scannerTitle}>
                Scanner QR Code
              </Text>
              <TouchableOpacity onPress={closeQRScanner}>
                <Text style={styles.scannerClose}>✕ Fermer</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.scannerInstructions}>
              Scannez un QR code de pharmacie pour charger l'itinéraire
            </Text>
            {/* Manual code entry as alternative to scanning */}
            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={uniqueCode}
                onChangeText={setUniqueCode}
                placeholder="Entrez le code unique"
                placeholderTextColor="#ddd"
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: '#000',
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              />
              <TouchableOpacity
                onPress={handleManualCodeUse}
                style={{ marginLeft: 8, backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Utiliser</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Camera scanner */}
          {hasCameraPermission && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
            >
              {/* Scanner view */}
              <View style={styles.scannerView}>
                <View style={styles.scannerBox}>
                  <View style={[styles.scannerCorner, styles.scannerCornerTopLeft]} />
                  <View style={[styles.scannerCorner, styles.scannerCornerTopRight]} />
                  <View style={[styles.scannerCorner, styles.scannerCornerBottomLeft]} />
                  <View style={[styles.scannerCorner, styles.scannerCornerBottomRight]} />
                </View>
              </View>

              {/* Scanner view */}
              <View style={styles.scannerStatus}>
                <Text style={styles.scannerStatusText}>
                  {scanned ? '✅ QR Code détecté!' : 'Pointez votre caméra vers le QR code'}
                </Text>
              </View>
            </CameraView>
          )}

          {/* Message if there is not permission for the camera */}
          {hasCameraPermission === false && (
            <View style={styles.noPermissionContainer}>
              <Text style={styles.noPermissionText}>
                Permission caméra requise
              </Text>
              <TouchableOpacity
                style={styles.allowCameraButton}
                onPress={requestCameraPermission}
              >
                <Text style={styles.allowCameraText}>Autoriser la caméra</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeQRScanner}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
