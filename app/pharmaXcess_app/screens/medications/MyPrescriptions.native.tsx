import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator   } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraView } from 'expo-camera';
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Prescription = {
    name: string;
    date: string;
    doctor: string;
    medications: string;
};

// The MyPrescriptions component allows users to view, add, and manage their prescriptions, including taking photos of new prescriptions using the camera.
type MyPrescriptionsProps = {
  navigation: StackNavigationProp<any>;
};

export default function MyPrescriptions({ navigation }: MyPrescriptionsProps): React.JSX.Element {
  const { colors } = useTheme();
    const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      name: 'Ordonnance 1',
      date: '01/01/2021',
      doctor: 'Dr. Dupont',
      medications: 'Paracétamol, Ibuprofène',
    },
    {
      name: 'Ordonnance 2',
      date: '01/01/2020',
      doctor: 'Dr. Martin',
      medications: 'Amoxicilline, Azithromycine',
    },
  ]);

  // State to manage camera permissions, visibility, and photo capture
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  // Reference to the camera view for taking pictures
  const cameraRef = useRef<CameraView | null>(null);

  // Request camera permissions when the component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Function to take a picture using the camera
  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
      setCameraVisible(false);
    } else {
      Alert.alert('Erreur', 'La caméra n\'est pas disponible.');
    }
  };

  // Function to validate the photo and add a new prescription
  const handleValidatePhoto = (): void => {
    const newPrescription: Prescription = {
      name: `Ordonnance ${prescriptions.length + 1}`,
      date: new Date().toLocaleDateString(),
      doctor: `Dr. ${['Dupont', 'Martin'][Math.floor(Math.random() * 2)]}`,
      medications: ['Paracétamol', 'Ibuprofène'][Math.floor(Math.random() * 2)],
    };
    setPrescriptions([...prescriptions, newPrescription]);
    setPhoto(null);
  };

  const handleCancelPhoto = (): void => {
    setPhoto(null);
  };

  if (hasPermission === null) {
    return <Text>Demande de permission de la caméra...</Text>
  }

  if (hasPermission === false) {
    return <Text>Accès à la caméra refusé</Text>
  }

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        // Display the camera view when the user wants to take a photo
        <CameraView style={styles.camera} ref={cameraRef}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
              <Text style={styles.buttonText}>Prendre une photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </CameraView>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.prescriptionList}>
            {prescriptions.map((prescription, index) => (
              <View key={index} style={styles.prescriptionCard}>
                <Text style={styles.prescriptionTitle}>{prescription.name}</Text>
                <Text style={styles.prescriptionText}>Date: {prescription.date}</Text>
                <Text style={styles.prescriptionText}>Médecin: {prescription.doctor}</Text>
                <Text style={styles.prescriptionText}>Médicaments: {prescription.medications}</Text>
              </View>
            ))}
            {photo && (
              // Display the photo preview when a photo is taken
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.image} />
                <Text>Voulez-vous valider cette photo ou recommencer ?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={handleValidatePhoto}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                      <Text style={styles.buttonText}>Valider</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleCancelPhoto}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                      <Text style={styles.buttonText}>Recommencer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Retour</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>

  );
}