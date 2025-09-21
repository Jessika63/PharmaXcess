import React, { useState, useEffect,useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
// import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { FlatList, TextInput } from 'react-native-gesture-handler';

import createStyles from '../../styles/Localisation.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

import { getMachines } from '../../services/machines/machinesService';
import { Machine } from '../../services/machines/types';

import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import type { Region } from 'react-native-maps';

import { MAP_TILE_URL } from '@env';

export default function Localisation(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const mapRef = useRef<MapView>(null);

    // const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [location, setLocation] = useState<{ coords: { latitude: number; longitude: number } } | null>(null);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [path, setPath] = useState<{ id: string; coords: { latitude: number; longitude: number }[] } | null>(null);

    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [selectedDistributor, setSelectedDistributor] = useState<any | null>(null);
    const [startLocation, setStartLocation] = useState<any | null>(null);

    const FRANCE_BOUNDS = {
        minLat: 41.27688,
        maxLat: 51.32937,
        minLng: -6.3,
        maxLng: 9.8,
    };


    const handleRegionChangeComplete = (region: Region) => {
        let latitudeDelta = region.latitudeDelta;
        let longitudeDelta = region.longitudeDelta;

        const MIN_DELTA = 0.001;
        const MAX_DELTA = 10;

        if (latitudeDelta < MIN_DELTA) latitudeDelta = MIN_DELTA;
        if (latitudeDelta > MAX_DELTA) latitudeDelta = MAX_DELTA;
        if (longitudeDelta < MIN_DELTA) longitudeDelta = MIN_DELTA;
        if (longitudeDelta > MAX_DELTA) longitudeDelta = MAX_DELTA;

        let latitude = region.latitude;
        let longitude = region.longitude;
        if (latitude < FRANCE_BOUNDS.minLat) latitude = FRANCE_BOUNDS.minLat;
        if (latitude > FRANCE_BOUNDS.maxLat) latitude = FRANCE_BOUNDS.maxLat;
        if (longitude < FRANCE_BOUNDS.minLng) longitude = FRANCE_BOUNDS.minLng;
        if (longitude > FRANCE_BOUNDS.maxLng) longitude = FRANCE_BOUNDS.maxLng;

        mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta,
        }, 100);
    };


    useEffect(() => {
        // (async () => {
        //     try {
        //         let { status } = await Location.requestForegroundPermissionsAsync();
        //         if (status !== 'granted') {
        //             Alert.alert(
        //                 'Permission refusée',
        //                 'Accordez la permission d\'accéder à votre position.'
        //             );
        //             return;
        //         }
    
        //         const currentLocation = await Location.getCurrentPositionAsync({});
        //         setLocation(currentLocation);
    
        //         const machinesData = await getMachines();
        //         setMachines(machinesData);
        //     } catch (error) {
        //         console.error('Erreur lors de la récupération de la localisation :', error);
        //     }
        // })();
        setLocation({ coords: { latitude: 48.8566, longitude: 2.3522 } });
        getMachines().then(setMachines).catch(console.error);

        setPharmacies([
            { id: 'ph1', name: 'Pharmacie République', latitude: 48.8670, longitude: 2.3610 },
            { id: 'ph2', name: 'Pharmacie du Parc', latitude: 48.8571, longitude: 2.3530 },
        ]);
    }, []);
    const generateRoute = (
        userCoords: { latitude: number; longitude: number },
        destCoords: { latitude: number; longitude: number }
    ): { latitude: number; longitude: number }[] => {
        return [
            { latitude: userCoords.latitude, longitude: userCoords.longitude },
            { latitude: destCoords.latitude, longitude: destCoords.longitude },
        ];
    };

    const simulatePath = (id: string, destLat: number, destLon: number) => {
        if (!location) return;
        const userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
        const destCoords = { latitude: destLat, longitude: destLon };
        const pathCoords = generateRoute(userCoords, destCoords);
        setPath({ id, coords: pathCoords });
    };

    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Chargement de la localisation...</Text>
            </View>
        );
    }

    const focusOnMachine = (machine: Machine) => {
        setSelectedMachine(machine);
        setSelectedDistributor(machine);
        mapRef.current?.animateToRegion(
            {
                latitude: machine.latitude,
                longitude: machine.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            },
            500
        );
    };

    const handleGoToDistributor = () => {
        if (!selectedDistributor || !location) {
            Alert.alert('Erreur', 'Veuillez sélectionner une destination et définir un point de départ.');
            return;
        }
        simulatePath(selectedDistributor.id, selectedDistributor.latitude, selectedDistributor.longitude);
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                }}
                onRegionChangeComplete={handleRegionChangeComplete}
            >
                <UrlTile
                    urlTemplate={MAP_TILE_URL}
                    maximumZ={20}
                    tileSize={256}
                    flipY={false}
                    zIndex={0}
                />
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    }}
                    title="Vous êtes ici"
                />
                {machines.map((machine) => (
                    <Marker
                        key={`m-${machine.id}`}
                        coordinate={{
                            latitude: machine.latitude,
                            longitude: machine.longitude
                        }}
                        title={machine.name}
                        pinColor="blue"
                        onPress={() => simulatePath(`m-${machine.id}`, machine.latitude, machine.longitude)}
                    />
                ))}
                {pharmacies.map((pharmacy) => (
                    <Marker
                        key={`ph-${pharmacy.id}`}
                        coordinate={{
                            latitude: pharmacy.latitude,
                            longitude: pharmacy.longitude
                        }}
                        title={pharmacy.name}
                        pinColor="green"
                        onPress={() => simulatePath(`ph-${pharmacy.id}`, pharmacy.latitude, pharmacy.longitude)}
                    />
                ))}
                {path && (
                    <Polyline
                        key={path.id}
                        coordinates={path.coords}
                        strokeColor="red"
                        strokeWidth={4}
                        zIndex={1}
                        lineCap="round"
                        lineJoin="round"
                    />
                )}
            </MapView>
            <View style={styles.menu}>
                <FlatList
                    data={machines}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.distributorItem,
                                selectedMachine?.id === item.id && {
                                    backgroundColor: colors.accent,
                                }
                            ]}
                            onPress={() => focusOnMachine(item)}
                        >
                            <Text style={[
                                styles.distributorText, 
                                selectedMachine?.id === item.id && {
                                    color: colors.background
                                }
                            ]}>
                                {item.name}
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