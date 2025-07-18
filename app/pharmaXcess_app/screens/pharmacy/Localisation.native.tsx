import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, StyleProp, ViewStyle, TextStyle, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import createStyles from '../../styles/Localisation.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Distributor = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
};

// The Localisation component allows users to view their current location on a map, find nearby pharmacies, and navigate to a selected pharmacy.
export default function Localisation(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    // State to manage the user's current location, list of distributors, selected distributor, start location, and route coordinates
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
    const [startLocation, setStartLocation] = useState<Location.LocationObject | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

    // Request location permissions and fetch the user's current location when the component mounts
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Accordez la permission d\'accéder à votre position.');
                    return;
                }
    
                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
    
                // Mock data for nearby distributors (pharmacies)
                const mockDistributors: Distributor[] = [
                    { id: 1, name: 'Pharmacie A', latitude: currentLocation.coords.latitude + 0.01, longitude: currentLocation.coords.longitude + 0.01, distance: 1 },
                    { id: 2, name: 'Pharmacie B', latitude: currentLocation.coords.latitude - 0.01, longitude: currentLocation.coords.longitude - 0.01, distance: 2 },
                    { id: 3, name: 'Pharmacie C', latitude: currentLocation.coords.latitude + 0.02, longitude: currentLocation.coords.longitude - 0.02, distance: 3 },
                ];
    
                // Sort distributors by distance
                setDistributors(mockDistributors.sort((a, b) => a.distance - b.distance));
            } catch (error) {
                console.error('Erreur lors de la récupération de la localisation :', error);
            }
        })();
    }, []);

    // To calculate the route to the selected distributor
    const handleGoToDistributor = async () => {
        if (!location || !selectedDistributor) {
            Alert.alert('Erreur', 'Veuillez sélectionner une pharmacie et vérifier votre position.');
            return;
        }
        const url = `https://www.google.com/maps?q=${selectedDistributor.latitude},${selectedDistributor.longitude}`;
        Linking.openURL(url);
        // Set route coordinates for navigation. 
        setRouteCoordinates([
            // Starting point is the user's current location
            { latitude: location.coords.latitude, longitude: location.coords.longitude },
            { latitude: selectedDistributor.latitude, longitude: selectedDistributor.longitude },
        ]);
    };

    // Render a loading state if the location is not yet available
    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Chargement de la localisation...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Render the map view with the user's current location and nearby pharmacies */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude || 0,
                    longitude: location?.coords.longitude || 0,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {/* the user's current location */} 
                <Marker
                // Display the user's current location on the map
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }}
                    title="Votre position"
                />

                {/* Render markers for each distributor (pharmacy) */}
                {distributors.map((distributor) => (
                    <Marker
                        key={distributor.id}
                        coordinate={{
                            latitude: distributor.latitude,
                            longitude: distributor.longitude,
                        }}
                        title={distributor.name}
                        onPress={() => setSelectedDistributor(distributor)}
                    />
                ))}

                {/* the route to the selected distributor */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor={colors.secondary}
                        strokeWidth={4}
                    />
                )}
            </MapView>

            {/* displaying distributors and allowing the user to select one */}
            <View style={styles.menu}>
                <FlatList
                    data={distributors}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                    <TouchableOpacity
                    style={[styles.distributorItem, selectedDistributor?.id === item.id && { backgroundColor: colors.accent }]}
                    onPress={() => setSelectedDistributor(item)}
                    >
                        <Text style={[
                            styles.distributorText, 
                            selectedDistributor?.id === item.id && { color: colors.background }
                        ]}>
                            {item.name}
                        </Text>
                        <Text style={[
                            styles.distanceText, 
                            selectedDistributor?.id === item.id && { color: colors.background }
                        ]}>
                            {item.distance} km
                        </Text>
                    </TouchableOpacity>
                    )}
                />
                {selectedDistributor && (
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
                                    Alert.alert('Erreur', 'Veuillez entrer des coordonnées valides au format "latitude, longitude".');
                                }
                            }}
                        />
                        <TouchableOpacity style={styles.goButton} onPress={handleGoToDistributor}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradientButton}>
                                <Text style={styles.text}>Aller à la pharmacie</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}
