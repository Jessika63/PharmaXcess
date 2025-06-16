import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator   } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraView } from 'expo-camera';

type Prescription = {
    name: string;
    date: string;
    doctor: string;
    medications: string;
};

export default function MyPrescriptions({ navigation }): JSX.Element {
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

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
      setCameraVisible(false);
    } else {
      Alert.alert('Erreur', 'La caméra n\'est pas disponible.');
    }
  };

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
        <CameraView style={styles.camera} ref={cameraRef}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
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
                <Text style={styles.prescriptionMedications}>Médicaments: {prescription.medications}</Text>
              </View>
            ))}
            {photo && (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.image} />
                <Text>Voulez-vous valider cette photo ou recommencer ?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={handleValidatePhoto}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                      <Text style={styles.buttonText}>Valider</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleCancelPhoto}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                      <Text style={styles.buttonText}>Recommencer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
              <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                <Text style={styles.buttonText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                <Text style={styles.buttonText}>Retour</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  prescriptionList: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
    width: '110%',
  },
  prescriptionCard: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    marginVertical: 8,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  prescriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  prescriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  prescriptionMedications: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  photoPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
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
  },
});