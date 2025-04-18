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

export default function Localisation(): JSX.Element {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
    const [startLocation, setStartLocation] = useState<Location.LocationObject | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Accordez la permission d\'accéder à votre position.');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            const mockDistributors: Distributor[] = [
                { id: 1, name: 'Pharmacie A', latitude: currentLocation.coords.latitude + 0.01, longitude: currentLocation.coords.longitude + 0.01, distance: 1 },
                { id: 2, name: 'Pharmacie B', latitude: currentLocation.coords.latitude - 0.01, longitude: currentLocation.coords.longitude - 0.01, distance: 2 },
                { id: 3, name: 'Pharmacie C', latitude: currentLocation.coords.latitude + 0.02, longitude: currentLocation.coords.longitude - 0.02, distance: 3 },
            ];

            setDistributors(mockDistributors.sort((a, b) => a.distance - b.distance));
        })();
    }, []);

    const handleGoToDistributor = async () => {
        if (!startLocation || !selectedDistributor) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        setRouteCoordinates([
            { latitude: location!.coords.latitude, longitude: location!.coords.longitude },
            { latitude: selectedDistributor.latitude, longitude: selectedDistributor.longitude }
        ]);
    };

    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Chargement de la localisation...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }}
                    title="Votre position"
                />

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

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#F57196"
                        strokeWidth={4}
                    />
                )}
            </MapView>

            <View style={styles.menu}>
                <FlatList
                    data={distributors}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.distributorText}
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
                            onChangeText={(text) => setStartLocation({ 
                                coords: {
                                    latitude: parseFloat(text.split(',')[0]), 
                                    longitude: parseFloat(text.split(',')[1]),
                                    altitude: null,
                                    accuracy: null,
                                    altitudeAccuracy: null,
                                    heading: null,
                                    speed: null
                                },
                                timestamp: Date.now()
                            })}
                        />
                        <TouchableOpacity style={styles.goButton} onPress={handleGoToDistributor}>
                            <LinearGradient colors={['#F57196', '#FFC0CB']} style={styles.gradientButton}>
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
        backgroundColor: '#FF6347',
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
