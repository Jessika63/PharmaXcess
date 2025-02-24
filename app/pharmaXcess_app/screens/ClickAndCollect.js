import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClickAndCollect() {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [isImageValidated, setIsImageValidated] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isValidateByPharmacist, setIsValidatedByPharmacist] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhoto(photo);
            setCameraVisible(false);
        }
    };

    const resetProcess = () => {
        setPhoto(null);
        setIsImageValidated(false);
        setIsWaiting(false);
        setIsValidatedByPharmacist(null);
    };

    const handleImageValidation = () => {
        setIsImageValidated(true);
        setIsWaiting(true);

        setTimeout(() => {
            const isValid = Math.random() > 0.5;
            setIsValidatedByPharmacist(isValid);
            setIsWaiting(false);
        }, 3000);
    };

    if (hasPermission === null) {
        return <Text>Demande de permission de la caméra...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Accès à la caméra refusé</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Click & Collect</Text>
            {cameraVisible ? (
                <Camera style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <LinearGradient colors={['#F57196', '#FFC0CB']} style={styles.gradientButton}>
                            <Text style={styles.buttonText}>Prendre la photo</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Camera>
            ) : isWaiting ? (
                <View style={styles.centeredContent}>
                    <Text>Votre ordonnance est en cours de validation...</Text>
                    <ActivityIndicator size="large" color="#F57196" />
                </View>
            ) : isValidateByPharmacist !== null ? (
                <View style={styles.centeredContent}>
                    {isValidatedByPharmacist ? (
                        <>
                            <Text>Votre ordonnance a été validée !</Text>
                            <QRCode value="https://pharmaxcess.fr" size={150} color="#F57196" />
                        </>
                    ) : (
                        <>
                            <Text>Erreur : le format de l'ordonnance n'est pas valide.</Text>
                            <TouchableOpacity style={styles.button} onPress={resetProcess}>
                                <LinearGradient colors={['#F57196', '#FFC0CB']} style={styles.gradientButton}>
                                    <Text style={styles.buttonText}>Recommencer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ) : (
                <View style={styles.centeredContent}>
                    {!photo ? (
                        <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
                            <LinearGradient colors={['#F57196', '#FFC0CB']} style={styles.gradientButton}>
                                <Text style={styles.buttonText}>Prendre une photo de votre ordonnance</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <Image source={{ uri: photo.uri }} style={styles.image} />
                            <Text>Voulez-vous valider cette photo ou recommencer ?</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.button} onPress={resetProcess}>
                                    <LinearGradient colors={['#CCCCCC', '#EEEEEE']} style={styles.gradientButton}>
                                        <Text style={styles.buttonText}>Recommencer</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={handleImageValidation}>
                                    <LinearGradient colors={['#F57196', '#FFC0CB']} style={styles.gradientButton}>
                                        <Text style={styles.buttonText}>Valider</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFF'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F57196',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    centeredContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: '80%',
        borderRadius: 25,
        marginVertical: 10,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 25,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
});
