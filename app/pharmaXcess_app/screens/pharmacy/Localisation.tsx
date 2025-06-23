import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { FlatList, TextInput } from 'react-native-gesture-handler';

type Distributor = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
};

// The Localisation component allows users to view their current location on a map, find nearby pharmacies, and navigate to a selected pharmacy.
export default function Localisation(): JSX.Element {
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
                        strokeColor="#F57196"
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
                    style={[styles.distributorItem, selectedDistributor?.id === item.id && { backgroundColor: '#F7C5E0' }]}
                    onPress={() => setSelectedDistributor(item)}
                    >
                        <Text style={styles.distributorText}>{item.name}</Text>
                        <Text style={styles.distanceText}>{item.distance} km</Text>
                    </TouchableOpacity>
                    )}
                />
                {selectedDistributor && (
                    <View style={styles.selectedDistributor}>
                        <Text style={styles.routeText}>Destination : {selectedDistributor.name}</Text>
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
                            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradientButton}>
                                <Text style={styles.goButtonText}>Aller à la pharmacie</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    } as ViewStyle,
    map: {
        flex: 1,
    } as ViewStyle,
    menu: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    } as ViewStyle,
    distributorItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    } as ViewStyle,
    distributorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57196',
    } as TextStyle,
    routeContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F7C5E0',
        borderRadius: 10,
        alignItems: 'center',
    } as ViewStyle,
    routeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    } as TextStyle,
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        width: '100%',
        backgroundColor: '#FFF',
    } as TextStyle,
    goButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    } as ViewStyle,
    goButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    } as TextStyle,
    distanceText: {
        fontSize: 14,
        color: '#555',
    } as TextStyle,
    selectedDistributor: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    } as ViewStyle,
    gradientButton: {
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    } as ViewStyle,
});
