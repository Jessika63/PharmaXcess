import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator   } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraView } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';

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
  const { currentProfile } = useProfile();
  const styles = createStyles(colors, fontScale);

  // Start empty; prescriptions should come from backend/profile
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // State to manage camera permissions, visibility, and photo capture
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  // Reference to the camera view for taking pictures
  const cameraRef = useRef<CameraView | null>(null);

  // For profile-based prescription management (simulated) 
  const [profilePrescriptionsData, setProfilePrescriptionsData] = useState<string[]>([]); 

  // Simple prescription management by profile (simulated functions) 
  const handleAddPrescriptionToProfile = async (prescriptionData: string): Promise<boolean> => { 
    // Simulate adding prescription to profile 
    if (!profilePrescriptionsData.includes(prescriptionData)) { 
      setProfilePrescriptionsData([...profilePrescriptionsData, prescriptionData]); 
      return true; 
    }
    return false; 
  }; 

  const handleRemovePrescriptionFromProfile = async (prescription: string): Promise<boolean> => { 
    // Simulate removing prescription from profile 
    setProfilePrescriptionsData(profilePrescriptionsData.filter(p => p !== prescription)); 
    return true; 
  };

  const getRelationshipText = (relationship?: string) => {
    switch (relationship) {
      case 'self': return 'Mon profil';
      case 'child': return 'Profil enfant';
      case 'parent': return 'Profil parent';
      case 'spouse': return 'Profil conjoint(e)';
      case 'other': return 'Autre profil';
      default: return 'Mon profil';
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Mes ordonnances',
    });
  }, [navigation]);

  // Determine if it's the main profile
  const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

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
  const handleValidatePhoto = async (): Promise<void> => {
    if (isMainProfile) {
      // For main profile: add to local state
      const newPrescription: Prescription = {
        name: `Ordonnance ${prescriptions.length + 1}`,
        date: new Date().toLocaleDateString(),
        doctor: `Dr. ${['Dupont', 'Martin'][Math.floor(Math.random() * 2)]}`,
        medications: ['Paracétamol', 'Ibuprofène'][Math.floor(Math.random() * 2)],
      };
      setPrescriptions([...prescriptions, newPrescription]);
    } else {
      // For other profiles: add to profile data
      const prescriptionData = {
        name: `Ordonnance ${profilePrescriptionsData.length + 1}`,
        date: new Date().toLocaleDateString(),
        doctor: `Dr. ${['Dupont', 'Martin'][Math.floor(Math.random() * 2)]}`,
        medications: ['Paracétamol', 'Ibuprofène'][Math.floor(Math.random() * 2)],
      };
      
      const success = await handleAddPrescriptionToProfile(JSON.stringify(prescriptionData));
      if (success) {
        Alert.alert('Succès', 'Ordonnance ajoutée avec succès.');
      } else {
        Alert.alert('Erreur', 'Cette ordonnance est déjà enregistrée ou une erreur est survenue.');
      }
    }
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

  // Get the prescriptions to display based on profile
  const getCurrentPrescriptions = () => {
    if (isMainProfile) {
      return prescriptions;
    } else {
      // Parse profile-specific prescriptions from JSON strings
      return profilePrescriptionsData.map(prescriptionStr => {
        try {
          return JSON.parse(prescriptionStr);
        } catch {
          return null;
        }
      }).filter(Boolean);
    }
  };

  const handleRemovePrescription = async (index: number) => {
    if (isMainProfile) {
      // For main profile: remove from local state
      const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
      setPrescriptions(updatedPrescriptions);
    } else {
      // For other profiles: remove from profile data
      const prescriptionToRemove = profilePrescriptionsData[index];
      await handleRemovePrescriptionFromProfile(prescriptionToRemove);
    }
  };

  const currentPrescriptions = getCurrentPrescriptions();

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
            {/* Header for current profile */}
            {currentProfile && (
              <View style={[styles.prescriptionCard, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={[styles.prescriptionTitle, { color: colors.primary, fontWeight: 'bold' }]}>
                      {getRelationshipText(currentProfile.relationship)}
                    </Text>
                    <Text style={[styles.prescriptionText, { color: colors.primary, opacity: 0.8 }]}>
                      {currentProfile.name}
                    </Text>
                  </View>
                  <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                </View>
              </View>
            )}

            {/* Display prescriptions based on profile */}
            {currentPrescriptions.length > 0 ? (
              currentPrescriptions.map((prescription, index) => (
                <View key={index} style={styles.prescriptionCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.prescriptionTitle}>{prescription.name}</Text>
                      <Text style={styles.prescriptionText}>Date: {prescription.date}</Text>
                      <Text style={styles.prescriptionText}>Médecin: {prescription.doctor}</Text>
                      <Text style={styles.prescriptionText}>Médicaments: {prescription.medications}</Text>
                    </View>
                    {!isMainProfile && (
                      <TouchableOpacity onPress={() => handleRemovePrescription(index)} style={{ padding: 8 }}>
                        <Ionicons name="trash-outline" size={24} color="#FF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.prescriptionCard}>
                <Text style={[styles.prescriptionText, { textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }]}>
                  {isMainProfile 
                    ? "Aucune ordonnance trouvée" 
                    : "Aucune ordonnance ajoutée pour ce profil"}
                </Text>
              </View>
            )}
            
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