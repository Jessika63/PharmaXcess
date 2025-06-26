import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { CameraView, CameraCapturedPicture, Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import createStyles from '../../styles/ClickAndCollect.style';
import { useTheme } from '../../context/ThemeContext';

// The ClickAndCollect component allows users to take a photo of their prescription, validate it, and receive confirmation from a pharmacist.
export default function ClickAndCollect(): React.JSX.Element {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  // State to manage camera permissions, visibility, photo capture, and validation status
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isImageValidated, setIsImageValidated] = useState<boolean>(false);
  // State to manage whether the prescription is being validated by a pharmacist and the validation result
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isValidatedByPharmacist, setIsValidatedByPharmacist] = useState<boolean | null>(null);
  // Reference to the camera view for taking pictures
  const cameraRef = useRef<CameraView | null>(null);

  // Request camera permissions when the component mounts
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
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Demande de permission de la caméra...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Accès à la caméra refusé. Veuillez activer les permissions dans les paramètres.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        // The camera view is the camera is visible. 
        <CameraView style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
          {/* Display a title and a button to take a picture */}
          <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
              <Text style={styles.buttonText}>Prendre la photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </CameraView>
      ) : isWaiting ? (
        // Display a loading indicator while the prescription is being validated
        <View style={styles.centeredContent}>
          <Text style={styles.loadingText}>Votre ordonnance est en cours de validation...</Text>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : isValidatedByPharmacist !== null ? (
        // Display the result of the validation process
        <View style={styles.centeredContent}>
          {isValidatedByPharmacist ? (
            <>
              <Text style={styles.loadingText}>Votre ordonnance a été validée !</Text>
              <QRCode value="https://pharmaxcess.fr" size={150} color={colors.secondary} />
            </>
          ) : (
            <>
              <Text style={styles.loadingText}>Erreur : le format de l'ordonnance n'est pas valide.</Text>
              <TouchableOpacity style={styles.button} onPress={resetProcess}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Recommencer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        // The initial state or when no photo has been taken yet
        <View style={styles.centeredContent}>
            {!photo ? (
                <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Prendre une photo de votre ordonnance</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : (
                <>
                    <Image source={{ uri: photo.uri }} style={styles.image} />
                    <Text style={styles.loadingText}>Voulez-vous valider cette photo ou recommencer ?</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={resetProcess}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Recommencer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleImageValidation}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
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
