
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
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
  const [showMap, setShowMap] = useState(false);

  // Récupérer l'ENV côté frontend
  const env = process.env.EXPO_PUBLIC_ENV || 'development';

  // Choix dynamique de l'URL backend
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
        Alert.alert('Erreur itinéraire', data.error || 'Impossible de récupérer l’itinéraire');
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
      setShowMap(true);
    } catch (err) {
      console.error('Erreur fetch direction:', err);
      Alert.alert('Erreur', "Impossible de récupérer l'itinéraire");
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
        {item.distance && item.distance > 10 && (
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

  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{ flex: 1 }}>
      {!showMap && (
        <>
          {distributors.length > 0 && (
            <View style={{
              backgroundColor: colors.primary + '20',
              padding: 12,
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{
                color: colors.primary,
                fontWeight: 'bold',
                fontSize: 14
              }}>
                📍 {distributors.length} pharmacies trouvées • Triées par distance
              </Text>
            </View>
          )}
          <FlatList
            data={distributors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDistributor}
            contentContainerStyle={{ padding: 16 }}
            ListFooterComponent={
              selectedDistributor && (
                <View style={styles.selectedDistributor}>
                  <Text style={styles.text}>Destination : {selectedDistributor.name}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Départ"
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
                      } else {
                        Alert.alert('Erreur', 'Coordonnées invalides');
                      }
                    }}
                  />
                  <TouchableOpacity style={styles.goButton} onPress={handleGoToDistributor}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradientButton}>
                      <Text style={styles.text}>Aller à la pharmacie</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        </>
      )}

      {showMap && selectedDistributor && location && (
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              title="Vous"
            />
            <Marker
              coordinate={{ latitude: selectedDistributor.latitude, longitude: selectedDistributor.longitude }}
              title={selectedDistributor.name}
            />
            {routeCoordinates.length > 0 && (
              <Polyline coordinates={routeCoordinates} strokeColor={colors.secondary} strokeWidth={4} />
            )}
          </MapView>
          {/* Return button to restart the process  */}
          <TouchableOpacity
            style={[styles.goButton, { position: 'absolute', bottom: 20, alignSelf: 'center' }]}
            onPress={() => {
              setShowMap(false);
              setRouteCoordinates([]);
              setSelectedDistributor(null);
            }}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradientButton}>
              <Text style={styles.text}>↩ Retour</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
