import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { CameraView, CameraCapturedPicture, Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClickAndCollect(): JSX.Element {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isImageValidated, setIsImageValidated] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isValidatedByPharmacist, setIsValidatedByPharmacist] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async (): Promise<void> => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhoto(photo);
        } else {
          Alert.alert('Erreur', 'Impossible de capturer la photo.');
        }
        setCameraVisible(false);
      } else {
        Alert.alert('Erreur', 'La caméra n\'est pas prête.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo.');
    }
  };

  const resetProcess = (): void => {
    setPhoto(null);
    setIsImageValidated(false);
    setIsWaiting(false);
    setIsValidatedByPharmacist(null);
  };

  const handleImageValidation = (): void => {
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
    return <Text>Accès à la caméra refusé. Veuillez activer les permissions dans les paramètres.</Text>;
  }

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <CameraView style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
              <Text style={styles.buttonText}>Prendre la photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </CameraView>
      ) : isWaiting ? (
        <View style={styles.centeredContent}>
          <Text>Votre ordonnance est en cours de validation...</Text>
          <ActivityIndicator size="large" color="#F57196" />
        </View>
      ) : isValidatedByPharmacist !== null ? (
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
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
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
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Prendre une photo de votre ordonnance</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : (
                <>
                    <Image source={{ uri: photo.uri }} style={styles.image} />
                    <Text>Voulez-vous valider cette photo ou recommencer ?</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={resetProcess}>
                            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                                <Text style={styles.buttonText}>Recommencer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleImageValidation}>
                            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
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
    backgroundColor: '#FFF',
  } as ViewStyle,
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
  } as ImageStyle,
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  gradient: {
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
  },
  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});