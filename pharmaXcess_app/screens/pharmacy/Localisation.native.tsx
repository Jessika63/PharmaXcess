
import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Dimensions, Animated, Vibration, Modal } from 'react-native';
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
  
  // Ref to control the map
  const mapRef = useRef<MapView>(null); 

  // Transport mode state 
  const transportOptions: TransportOption[] = [
    { mode: 'driving', icon: '🚗', label: 'Voiture', color: '#F57196' },
    { mode: 'cycling', icon: '🚴', label: 'Vélo', color: '#F57196' },
    { mode: 'walking', icon: '🚶', label: 'À pied', color: '#F57196' },
  ];

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

  // Function to handle the scanned QR code
  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // Le QR code devrait contenir un JSON avec les informations de la pharmacie et de l'itinéraire
      // Format attendu:
      // {
      //   "type": "pharmacy_route",
      //   "pharmacy": {
      //     "id": 123,
      //     "name": "Pharmacie des Lilas",
      //     "latitude": 48.8566,
      //     "longitude": 2.3522,
      //     "distance": 1.2
      //   },
      //   "route": {
      //     "transportMode": "walking",
      //     "coordinates": [
      //       {"latitude": 48.8566, "longitude": 2.3522},
      //       {"latitude": 48.8567, "longitude": 2.3523}
      //     ]
      //   }
      // }
      
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'pharmacy_route' && qrData.pharmacy && qrData.route) {
        // Close the scanner
        closeQRScanner();
        
        // Create a distributor object from the QR data
        const distributorFromQR: Distributor = {
          id: qrData.pharmacy.id || Date.now(),
          name: qrData.pharmacy.name,
          latitude: qrData.pharmacy.latitude,
          longitude: qrData.pharmacy.longitude,
          distance: qrData.pharmacy.distance
        };

        // Select the distributor from the QR code
        setSelectedDistributor(distributorFromQR);

        // Set the route if provided
        if (qrData.route.coordinates) {
          setRouteCoordinates(qrData.route.coordinates);
        }

        // Set the transport mode if specified
        if (qrData.route.transportMode) {
          setSelectedTransportMode(qrData.route.transportMode);
        }

        // Center the map on the pharmacy
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: distributorFromQR.latitude,
            longitude: distributorFromQR.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }

        // Open the panel to display the details
        setIsPanelOpen(true);

        Alert.alert(
          'QR Code scanné!', 
          `Itinéraire vers ${distributorFromQR.name} chargé avec succès`,
          [{ text: 'OK' }]
        );

      } else {
        Alert.alert('QR Code invalide', 'Ce QR code ne contient pas d\'informations d\'itinéraire valides');
      }
    } catch (error) {
      console.error('Erreur parsing QR code:', error);
      Alert.alert('Erreur', 'Impossible de lire les données du QR code');
    }
    
    // Reactivate scanning after a short delay to prevent multiple scans
    setTimeout(() => setScanned(false), 2000);
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
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', "Accordez la permission d'accéder à votre position.");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        const response = await fetch(
          `${BACKEND_URL}/get_pharmacies?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}`
        );
        const data = await response.json();
        if (response.ok && data.pharmacies) {
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
          Alert.alert('Erreur', data.error || 'Impossible de récupérer les pharmacies');
        }
      } catch (error) {
        console.error('Erreur localisation ou fetch pharmacies :', error);
        Alert.alert('Erreur', 'Impossible de récupérer la localisation ou les pharmacies.');
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
      
      // Close the panel smoothly to better see the route
      if (isPanelOpen) {
        setIsPanelOpen(false);
        Animated.spring(translateY, {
          toValue: panelHeight - peekHeight,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
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
          <View style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              PROCHE
            </Text>
          </View>
        )}
        {item.distance && item.distance > 5 && (
          <View style={{
            backgroundColor: '#F44336',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
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
            pinColor="#F57196"
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
        <View style={{
          position: 'absolute',
          top: 60,
          left: 16,
          right: 16,
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>
              {transportOptions.find(opt => opt.mode === selectedTransportMode)?.icon}
            </Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.profileText }}>
                {remainingDistance} • {estimatedTime}
              </Text>
              <Text style={{ fontSize: 14, color: colors.infoTextSecondary }}>
                vers {selectedDistributor?.name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={stopNavigation}
              style={{
                backgroundColor: '#FF5252',
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>STOP</Text>
            </TouchableOpacity>
          </View>
          
          {nextInstruction && (
            <View style={{
              backgroundColor: colors.primary + '20',
              borderRadius: 8,
              padding: 12,
              marginTop: 8,
            }}>
              <Text style={{ fontSize: 16, color: colors.text, fontWeight: '500' }}>
                🔄 {nextInstruction.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Button to recenter the map */}
      {location && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: isNavigating ? 140 : (isPanelOpen ? 400 : 200),
            right: 16,
            backgroundColor: colors.background,
            borderRadius: 25,
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
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
          <Text style={{ fontSize: 20 }}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Button to open QR scanner - positioned above the location button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: isNavigating ? 200 : (isPanelOpen ? 460 : 260),
          right: 16,
          backgroundColor: colors.background,
          borderRadius: 25,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={openQRScanner}
      >
        <Text style={{ fontSize: 15 }}>📷</Text>
      </TouchableOpacity>

      {/* Sliding panel at the bottom */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: panelHeight,
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
          transform: [{ translateY }],
        }}
      >
        {/* Swipe handle with visual indicator */}
        <TouchableOpacity 
          onPress={togglePanel} 
          style={{
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 50,
          }}
        >
          <View style={{
            width: 40,
            height: 4,
            backgroundColor: isPanelOpen ? colors.primary : colors.inputBorder,
            borderRadius: 2,
          }} />
          <Text style={{ 
            fontSize: 12, 
            color: colors.infoTextSecondary,
            marginTop: 4, 
          }}>
            {isPanelOpen ? '▼ Réduire' : '▲ Voir plus'}
          </Text>
        </TouchableOpacity>

        {/* Panel header */}
        <View style={{
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.profileText,
            textAlign: 'center',
          }}>
            📍 {distributors.length} pharmacies trouvées
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.infoTextSecondary,
            textAlign: 'center',
            marginTop: 4,
          }}>
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

                
                {/* Transportation mode selector */}
                <Text style={[styles.text, { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10 }]}>
                  🚶 Mode de transport :
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginBottom: 15,
                }}>
                  {transportOptions.map((option) => (
                    <TouchableOpacity
                      key={option.mode}
                      style={{
                        flex: 1,
                        minWidth: '48%',
                        backgroundColor: selectedTransportMode === option.mode ? option.color : colors.inputBorder + '40',
                        borderRadius: 8,
                        padding: 12,
                        margin: 2,
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: selectedTransportMode === option.mode ? option.color : 'transparent',
                      }}
                      onPress={() => setSelectedTransportMode(option.mode)}
                    >
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>{option.icon}</Text>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: selectedTransportMode === option.mode ? 'bold' : 'normal',
                        color: selectedTransportMode === option.mode ? 'white' : colors.profileText,
                      }}>
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
                    style={[styles.goButton, { marginTop: 8, backgroundColor: '#4CAF50' }]} 
                    onPress={startNavigation}
                  >
                    <View style={[styles.gradientButton, { backgroundColor: '#4CAF50' }]}>
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
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {/* Scanner header  */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 20,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Scanner QR Code
              </Text>
              <TouchableOpacity onPress={closeQRScanner}>
                <Text style={{ color: 'white', fontSize: 16 }}>✕ Fermer</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>
              Scannez un QR code de pharmacie pour charger l'itinéraire
            </Text>
          </View>

          {/* Camera scanner */}
          {hasCameraPermission && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
            >
              {/* Scanner view */}
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 250,
                  height: 250,
                  borderWidth: 2,
                  borderColor: 'white',
                  borderRadius: 20,
                  backgroundColor: 'transparent',
                }}>
                  <View style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderLeftWidth: 4,
                    borderTopWidth: 4,
                    borderColor: '#4CAF50',
                    borderTopLeftRadius: 20,
                  }} />
                  <View style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderRightWidth: 4,
                    borderTopWidth: 4,
                    borderColor: '#4CAF50',
                    borderTopRightRadius: 20,
                  }} />
                  <View style={{
                    position: 'absolute',
                    bottom: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderLeftWidth: 4,
                    borderBottomWidth: 4,
                    borderColor: '#4CAF50',
                    borderBottomLeftRadius: 20,
                  }} />
                  <View style={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderRightWidth: 4,
                    borderBottomWidth: 4,
                    borderColor: '#4CAF50',
                    borderBottomRightRadius: 20,
                  }} />
                </View>
              </View>

              {/* Scanner view */}
              <View style={{
                position: 'absolute',
                bottom: 60,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 10,
                padding: 15,
              }}>
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                  {scanned ? '✅ QR Code détecté!' : 'Pointez votre caméra vers le QR code'}
                </Text>
              </View>
            </CameraView>
          )}

          {/* Message if there is not permission for the camera */}
          {hasCameraPermission === false && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
                Permission caméra requise
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#4CAF50',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
                onPress={requestCameraPermission}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>Autoriser la caméra</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeQRScanner}>
                <Text style={{ color: 'white', fontSize: 16 }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
