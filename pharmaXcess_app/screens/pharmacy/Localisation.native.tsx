
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { FlatList } from 'react-native-gesture-handler';
import createStyles from '../../styles/Localisation.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Distributor = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

export default function Localisation(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
    const [startLocation, setStartLocation] = useState<Location.LocationObject | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [loading, setLoading] = useState(false);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL; // Ton backend depuis .env

    // Récupérer la position de l'utilisateur
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Accordez la permission d\'accéder à votre position.');
                    return;
                }

                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
                setStartLocation(currentLocation);

                // Appel du backend pour récupérer les pharmacies
                fetchPharmacies(currentLocation.coords.latitude, currentLocation.coords.longitude);
            } catch (error) {
                console.error('Erreur localisation:', error);
                Alert.alert('Erreur', 'Impossible de récupérer votre localisation.');
            }
        })();
    }, []);

    // Fonction pour récupérer les pharmacies depuis le backend
    const fetchPharmacies = async (lat: number, lon: number) => {
        if (!BACKEND_URL) return;

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/get_pharmacies?lat=${lat}&lon=${lon}`);
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const data = await res.json();
            if (data.pharmacies) {
                setDistributors(data.pharmacies);
            } else {
                Alert.alert('Aucune pharmacie trouvée');
            }
        } catch (err) {
            console.error('Erreur fetch pharmacies:', err);
            Alert.alert('Erreur', 'Impossible de récupérer les pharmacies.');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer l'itinéraire depuis le backend
    const handleGoToDistributor = async () => {
        if (!startLocation || !selectedDistributor || !BACKEND_URL) {
            Alert.alert('Erreur', 'Veuillez sélectionner une pharmacie et vérifier votre position.');
            return;
        }

        try {
            const origin = `${startLocation.coords.latitude},${startLocation.coords.longitude}`;
            const destination = `${selectedDistributor.latitude},${selectedDistributor.longitude}`;
            const res = await fetch(`${BACKEND_URL}/get_direction?origin=${origin}&destination=${destination}`);
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const data = await res.json();

            // Extraire les coordonnées de la route (ORS renvoie GeoJSON)
            const coords: { latitude: number; longitude: number }[] = data?.features?.[0]?.geometry?.coordinates?.map(
                ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })
            ) || [];

            setRouteCoordinates(coords);
        } catch (err) {
            console.error('Erreur fetch direction:', err);
            Alert.alert('Erreur', 'Impossible de récupérer l\'itinéraire.');
        }
    };

    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Chargement de la localisation...</Text>
                <ActivityIndicator size="large" color={colors.primary} />
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

                {distributors
                    .filter(d => d.latitude != null && d.longitude != null)
                    .map((distributor, index) => (
                        <Marker
                            key={distributor.id ?? index}
                            coordinate={{ latitude: distributor.latitude, longitude: distributor.longitude }}
                            title={distributor.name}
                            onPress={() => setSelectedDistributor(distributor)}
                        />
                    ))}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor={colors.secondary}
                        strokeWidth={4}
                    />
                )}
            </MapView>

            <View style={styles.menu}>
                {loading ? <ActivityIndicator size="small" color={colors.primary} /> : (
                    <FlatList
                        data={distributors}
                        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.distributorItem,
                                    selectedDistributor?.id === item.id && { backgroundColor: colors.accent }
                                ]}
                                onPress={() => setSelectedDistributor(item)}
                            >
                                <Text style={[
                                    styles.distributorText,
                                    selectedDistributor?.id === item.id && { color: colors.background }
                                ]}>{item.name}</Text>
                                <Text style={[
                                    styles.distanceText,
                                    selectedDistributor?.id === item.id && { color: colors.background }
                                ]}>{item.distance ?? '-' } km</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {selectedDistributor && (
                    <View style={styles.selectedDistributor}>
                        <Text style={styles.text}>Destination : {selectedDistributor.name}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Départ"
                            value={startLocation ? `${startLocation.coords.latitude}, ${startLocation.coords.longitude}` : ''}
                            onChangeText={(text) => {
                                const [latitude, longitude] = text.split(',').map(coord => parseFloat(coord.trim()));
                                if (!isNaN(latitude) && !isNaN(longitude)) {
                                    setStartLocation({
                                        coords: { latitude, longitude, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
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
                )}
            </View>
        </View>
    );
}
