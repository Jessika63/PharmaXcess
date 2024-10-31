import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';

export default function ClickAndCollect() {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [isImageValidated, setIsImageValidated] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isValidatedByPharmacist, setIsValidatedByPharmacist] = useState(null);
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
    
    if (cameraVisible && hasPermission) {
        return (
            <Camera style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
                <View style={styles.cameraButtonContainer}>
                    <Button title="Prendre la photo" onPress={takePicture} />
                </View>
            </Camera>
        );
    }
    

    if (isWaiting) {
        return (
            <View style={styles.container}>
                <Text>Votre ordonnance est en cours de validation...</Text>
                <ActivityIndicator size="large" color="#F57196" />
            </View>
        );
    }

    if (isValidatedByPharmacist !== null) {
        return (
            <View style={styles.container}>
                {isValidatedByPharmacist ? (
                    <>
                        <Text>Votre ordonnance a été validée !</Text>
                        <Text>Voici votre QR code :</Text>
                        <QRCode value="https://pharmaxcess.fr" size={150} color="#F57196" />
                    </>
                ) : (
                    <>
                        <Text>Erreur : le format de l'ordonnance n'est pas valide.</Text>
                        <Button title="Recommencer" onPress={resetProcess} color="#F57196" />
                    </>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!photo ? (
                <Button title="Prendre une photo de votre ordonnance" onPress={() => setCameraVisible(true)} color="#F57196" />
            ) : (
                <>
                    <Image source={{ uri: photo.uri }} style={styles.image} />
                    <Text>Voulez-vous Valider cette photo ou recommencer ?</Text>
                    <View style={styles.buttonsContainer}>
                        <Button title="Recommencer" onPress={resetProcess} color="gray" />
                        <Button title="Valider" onPress={handleImageValidation} color="#F57196" />
                    </View>
                </>
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
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    cameraButtonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 20,
        alignSelf: 'center',
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
        margin: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginTop: 16,
        margin: 20,
    },
});
