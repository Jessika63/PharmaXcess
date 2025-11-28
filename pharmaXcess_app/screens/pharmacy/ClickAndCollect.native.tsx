import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { CameraView, CameraCapturedPicture, Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import createStyles from '../../styles/ClickAndCollect.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext'; 

// Interface for storing QR data by profile 
interface ProfileQRData { 
  [profileId: string]: { 
    qrCode: string; 
    isValidated: boolean; 
    photo: CameraCapturedPicture | null; 
  }; 
}

// The ClickAndCollect component allows users to take a photo of their prescription, validate it, and receive confirmation from a pharmacist.
export default function ClickAndCollect(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const { currentProfile } = useProfile();
  const styles = createStyles(colors, fontScale);

  // Global state to store QR data for all profiles
  const [profileQRData, setProfileQRData] = useState<ProfileQRData>({});
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
  // Retrieve current profile data 
  const currentProfileData = currentProfile ? profileQRData[currentProfile.id] : null;
  // Request camera permissions when the component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  // Effect to reset state when switching profiles 
  useEffect(() => { 
    if (currentProfile?.id) { 
      const profileData = profileQRData[currentProfile.id];
      if (profileData) {
        setPhoto(profileData.photo);
        setIsImageValidated(profileData.isValidated);
        setIsValidatedByPharmacist(profileData.isValidated);
      } else {
        // Reset for a new profile
        setPhoto(null);
        setIsImageValidated(false);
        setIsValidatedByPharmacist(null);
        setIsWaiting(false);
    }
  }
}, [currentProfile?.id]);
  const takePicture = async (): Promise<void> => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhoto(photo);
          // Save the photo in the local state 
          if (currentProfile?.id) { 
            setProfileQRData(prev => ({
              ...prev,
              [currentProfile.id]: {
                photo: photo,
                qrCode: prev[currentProfile.id]?.qrCode || '',
                isValidated: false
              }
            }));
          }
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
    // Delete the saved photo for the current profile
    if (currentProfile?.id) { 
      setProfileQRData(prev => ({
        ...prev,
        [currentProfile.id]: {
          photo: null,
          qrCode: prev[currentProfile.id]?.qrCode || '',
          isValidated: false
        }
      }));
    }
  };

  const handleImageValidation = (): void => {
    setIsImageValidated(true);
    setIsWaiting(true);

    setTimeout(() => {
      // Commenté temporairement pour générer le QR code dans tous les cas
      // const isValid = Math.random() > 0.5;
      const isValid = true; // Force la validation à true pour toujours générer le QR code
      setIsValidatedByPharmacist(isValid);
      setIsWaiting(false);
      // Save the RQ code pour le profil actuel 
      if (currentProfile?.id && isValid) {
        const qrCodeValue = 'https://pharmaxcess.fr/prescription/${currentProfile.id}/${Date.now()}';
        setProfileQRData(prev => ({
          ...prev,
          [currentProfile.id]: {
            photo: prev[currentProfile.id]?.photo || null,
            qrCode: qrCodeValue,
            isValidated: true
          }
        }));
      }
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
          {/* Display a button at the bottom to take a picture */}
          <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </CameraView>
      ) : isWaiting ? (
        // Display a loading indicator while the prescription is being validated
        <View style={styles.centeredContent}>
          <Text style={styles.loadingText}>Votre ordonnance est en cours de validation...</Text>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : isValidatedByPharmacist !== null ? (
        // Display the result of the validation process - QR code affiché selon le profil
        <View style={styles.centeredContent}>
          {currentProfileData?.qrCode ? (
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Votre ordonnance a été validée !</Text>
              <View style={styles.qrCodeWrapper}>
                <QRCode value={currentProfileData.qrCode} size={200} color={colors.secondary} />
              </View>
              <Text style={styles.qrText}>Présentez ce QR code en pharmacie</Text>
            </View>
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
                <TouchableOpacity style={styles.card} onPress={() => setCameraVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}>
                        <Text style={styles.cardText}>Prendre une photo de votre ordonnance</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : (
                <View style={styles.qrContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.image} />
                    <Text style={styles.loadingText}>Voulez-vous valider cette photo ou recommencer ?</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.rejectButton} onPress={resetProcess}>
                            <Text style={styles.buttonText}>Recommencer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.approveButton} onPress={handleImageValidation}>
                            <Text style={styles.buttonText}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
      )}
    </View>
  );
}
