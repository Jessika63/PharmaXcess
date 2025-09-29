
import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
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

export default function Localisation(): React.ReactElement {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [startLocation, setStartLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

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

    const originCoords = startLocation ?? location;
    if (!originCoords) {
      Alert.alert('Erreur', 'Impossible de récupérer le départ.');
      return;
    }

    try {
      const origin = `${originCoords.coords.latitude},${originCoords.coords.longitude}`;
      const destination = `${selectedDistributor.latitude},${selectedDistributor.longitude}`;
      const response = await fetch(
        `${BACKEND_URL}/get_direction?origin=${origin}&destination=${destination}&mode=driving`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        Alert.alert('Erreur itineraire', data.error || 'Impossible de recuperer l\'itineraire');
        return;
      }

      let coords: { latitude: number; longitude: number }[] = [];
      if (data.routes && data.routes.length > 0) {
        const geom = data.routes[0].geometry;
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
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Pin your location  */}
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            title="Votre position"
            pinColor="#F57196"
          />
          
          {/* Pin the pharmacies locations */}
          {distributors.map((distributor) => (
            <Marker
              key={distributor.id}
              coordinate={{ latitude: distributor.latitude, longitude: distributor.longitude }}
              title={distributor.name}
              pinColor={selectedDistributor?.id === distributor.id ? "blue" : "green"}
              onPress={() => setSelectedDistributor(distributor)}
            />
          ))}

          {/* Display the itinerary if available */}
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeColor={colors.secondary} strokeWidth={4} />
          )}
        </MapView>
      )}

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
            color: colors.text,
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
                <Text style={styles.text}>Destination : {selectedDistributor.name}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Départ (optionnel)"
                  value={startLocation ? `${startLocation.coords.latitude}, ${startLocation.coords.longitude}` : ''}
                  onChangeText={(text) => {
                    const [latitude, longitude] = text.split(',').map((coord) => parseFloat(coord.trim()));
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                      setStartLocation({
                        coords: {
                          latitude,
                          longitude,
                          altitude: null,
                          accuracy: null,
                          altitudeAccuracy: null,
                          heading: null,
                          speed: null,
                        },
                        timestamp: Date.now(),
                      });
                    } else if (text === '') {
                      setStartLocation(null);
                    }
                  }}
                />
                <TouchableOpacity style={styles.goButton} onPress={handleGoToDistributor}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradientButton}>
                    <Text style={styles.text}>🗺️ Afficher l'itinéraire</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          }
        />
      </Animated.View>
    </View>
  );
}
