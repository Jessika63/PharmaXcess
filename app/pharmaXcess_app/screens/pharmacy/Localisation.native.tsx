import React, { useState, useEffect,useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { FlatList, TextInput } from 'react-native-gesture-handler';

import createStyles from '../../styles/Localisation.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

import { getMachines } from '../../services/machines/machinesService';
import { Machine } from '../../services/machines/types';

import MapView, { Marker, UrlTile } from 'react-native-maps';
import type { Region } from 'react-native-maps';


export default function Localisation(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const mapRef = useRef<MapView>(null);

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

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
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission refusée',
                        'Accordez la permission d\'accéder à votre position.'
                    );
                    return;
                }
    
                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
    
                const machinesData = await getMachines();
                setMachines(machinesData);
            } catch (error) {
                console.error('Erreur lors de la récupération de la localisation :', error);
            }
        })();
    }, []); 

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
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5
                }}
                onRegionChangeComplete={handleRegionChangeComplete}
            >
                <UrlTile
                    urlTemplate="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key="
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
                        key={machine.id.toString()}
                        coordinate={{
                            latitude: machine.latitude,
                            longitude: machine.longitude
                        }}
                        title={machine.name}
                    />
                ))}
            </MapView>
            {/* <View style={styles.menu}>
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
            </View> */}
        </View>
    );
}