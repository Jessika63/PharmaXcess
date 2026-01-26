import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
// file system used in AddOrdonnance
import ordonnancesApi from '../../utils/api/ordonnances';

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

  // No inline camera in this screen; AddOrdonnance handles camera capture

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

  // camera permissions managed in AddOrdonnance

  // Fetch ordonnances from backend when profile changes (server profiles)
  const fetchOrdonnances = async () => {
    if (!currentProfile?.id) return;
    const numericCandidate = Number(currentProfile.id);
    const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
    if (!isServerProfile) return;
    try {
      const res = await ordonnancesApi.getOrdonnances(currentProfile.id);
      if (res.ok && Array.isArray(res.data)) {
        const mapped = res.data.map((o: any) => ({
          name: o.description || `Ordonnance ${o.id}`,
          date: o.date_prescription || o.date_ajout,
          doctor: o.medecin_nom,
          medications: Array.isArray(o.medicaments) ? o.medicaments.join(', ') : (typeof o.medicaments === 'string' ? o.medicaments : JSON.stringify(o.medicaments)),
          id: o.id,
          temp_image_id: o.temp_image_id || null,
        }));
        setPrescriptions(mapped as any);
      }
    } catch (err) {
      console.warn('Failed to fetch ordonnances', err);
    }
  };

  useEffect(() => {
    fetchOrdonnances();
  }, [currentProfile?.id]);

  // camera handled in AddOrdonnance screen

  // no early return for camera permission here

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
    const numericCandidate = Number(currentProfile?.id);
    const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile?.id);

    if (isServerProfile && currentProfile?.id) {
      // If we have an id attached to the prescription, call backend
      const p: any = prescriptions[index];
      if (p?.id) {
        try {
          const res = await ordonnancesApi.deleteOrdonnance(currentProfile.id, p.id);
          if (res.ok) {
            const updated = prescriptions.filter((_, i) => i !== index);
            setPrescriptions(updated as any);
          } else {
            Alert.alert('Erreur', res.error || 'Suppression impossible');
          }
        } catch (err: any) {
          console.error('Delete ordonnance error', err);
          Alert.alert('Erreur', 'Suppression impossible');
        }
      }
    } else {
      if (isMainProfile) {
        const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
        setPrescriptions(updatedPrescriptions);
      } else {
        const prescriptionToRemove = profilePrescriptionsData[index];
        await handleRemovePrescriptionFromProfile(prescriptionToRemove);
      }
    }
  };

  // Fetch ordonnances from backend when profile changes (server profiles)
  
  // Also refresh when screen gains focus (e.g., after returning from detail/add screens)
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        if (!currentProfile?.id) return;
        const numericCandidate = Number(currentProfile.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
        if (!isServerProfile) return;
        try {
          const res = await ordonnancesApi.getOrdonnances(currentProfile.id);
          if (res.ok && Array.isArray(res.data)) {
            const mapped = res.data.map((o: any) => ({
              name: o.description || `Ordonnance ${o.id}`,
              date: o.date_prescription || o.date_ajout,
              doctor: o.medecin_nom,
              medications: Array.isArray(o.medicaments) ? o.medicaments.join(', ') : (typeof o.medicaments === 'string' ? o.medicaments : JSON.stringify(o.medicaments)),
              id: o.id,
              temp_image_id: o.temp_image_id || null,
            }));
            setPrescriptions(mapped as any);
          }
        } catch (err) {
          console.warn('Failed to fetch ordonnances on focus', err);
        }
      })();
    }, [currentProfile?.id])
  );

  const currentPrescriptions = getCurrentPrescriptions();

  return (
    <View style={styles.container}>
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
            <TouchableOpacity
              key={prescription.id ?? index}
              style={[styles.prescriptionCard, { padding: 12 }]}
              onPress={() => navigation.navigate('OrdonnanceDetail', { ordonnance: prescription, userId: currentProfile?.id })}
            >
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
            </TouchableOpacity>
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
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddOrdonnance', { userId: currentProfile?.id })}>
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

      {/* Ordonnance details now open in a dedicated screen */}
    </View>
  );
}