import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal,  TouchableOpacity, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import profileApi from '../../utils/api/profile';
import { useProfileData } from '../../hooks/useProfileData';
import { CustomPicker } from '../../components';

type Doctor = {
  name: string;
  specialty: string;
  hospital: string;
  phoneNumber: string;
  email: string;
  address: string; 
};

type DoctorsProps = {
  navigation: StackNavigationProp<any, any>;
};

// The Doctors component allows users to view, add, and edit doctors in a list, with a modal for adding new doctors.
export default function Doctors({ navigation }: DoctorsProps): React.JSX.Element {
  const { colors } = useTheme();
    const { fontScale } = useFontScale();
  const { currentProfile, updateProfile } = useProfile();
  const { doctors: profileDoctors, addDoctor, removeDoctor } = useProfileData();
  const styles = createStyles(colors, fontScale);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newDoctor, setNewDoctor] = useState<Doctor>({
    name: '',
    specialty: '',
    phoneNumber: '',
    email: '',
    address: '',
    hospital: '',
  });
  const [editedDoctor, setEditedDoctor] = useState<Doctor>({
    name: '',
    specialty: '',
    phoneNumber: '',
    email: '',
    address: '',
    hospital: '',
  });

  // Normalize doctor entry which can be: a JSON string, a plain string (name),
  // or an object coming from different backends with French keys.
  const normalizeDoctor = (entry: any): Doctor => {
    const defaults = { name: '', specialty: '', hospital: '', phoneNumber: '', email: '', address: '' };
    if (!entry && entry !== 0) return defaults;

    // If it's a string, try to parse JSON, otherwise treat as a plain name
    if (typeof entry === 'string') {
      try {
        const parsed = JSON.parse(entry);
        entry = parsed;
      } catch {
        return { ...defaults, name: entry };
      }
    }

    // If it's already an object, map possible keys (French/English) to our shape
    if (typeof entry === 'object' && entry !== null) {
      return {
        name: entry.name || entry.nom || entry.fullname || String(entry) || '',
        specialty: entry.specialty || entry.specialite || '',
        hospital: entry.hospital || entry.hopital || '',
        phoneNumber: entry.phoneNumber || entry.telephone || entry.telefono || entry.teklephone || '',
        email: entry.email || entry.mail || '',
        address: entry.address || entry.adresse || '',
      };
    }

    // Fallback: convert to string
    return { ...defaults, name: String(entry) };
  };

  // For simple doctor addition by profile 
  const [newDoctorSimple, setNewDoctorSimple] = useState<string>('');

  const specialties = ['Médecin généraliste', 'Cardiologue', 'Dermatologue', 'Endocrinologue', 'Gastro-entérologue', 'Gynécologue', 'Neurologue', 'Oncologue', 'Ophtalumologue', 'ORL', 'Orthopédiste', 'Pédiatre', 'Psychiatre', 'Radiologue', 'Rhumatologue', 'Urologue', 'Autre']; 
  const handleAddSimpleDoctor = async (): Promise<void> => {
    // For other profiles, we only require the name field but save all available data
    if (!newDoctor.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du médecin.');
      return;
    }

    // Create complete doctor data even for other profiles
    const doctorPayload: any = {
      // include both English and French keys to be robust
      name: newDoctor.name.trim(),
      nom: newDoctor.name.trim(),
      speciality: newDoctor.specialty || specialties[0],
      specialite: newDoctor.specialty || specialties[0],
      hospital: newDoctor.hospital || '',
      hopital: newDoctor.hospital || '',
      phoneNumber: newDoctor.phoneNumber || '',
      phone: newDoctor.phoneNumber || '',
      telephone: newDoctor.phoneNumber || '',
      email: newDoctor.email || '',
      address: newDoctor.address || '',
      adresse: newDoctor.address || '',
    };

    const success = await addDoctor(doctorPayload);
    if (success) {
      // Reset all fields
      setNewDoctorSimple('');
      setNewDoctor({
        name: '',
        specialty: '',
        phoneNumber: '',
        email: '',
        address: '',
        hospital: '',
      });
      setIsModalVisible(false);
      Alert.alert('Succès', 'Médecin ajouté avec succès.');
    } else {
      Alert.alert('Erreur', 'Ce médecin est déjà enregistré ou une erreur est survenue.');
    }
  };

  const handleAddPress = async (): Promise<void> => {
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.phoneNumber || !newDoctor.email || !newDoctor.address || !newDoctor.hospital) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const doctorPayload: any = {
      name: newDoctor.name.trim(),
      nom: newDoctor.name.trim(),
      speciality: newDoctor.specialty,
      specialite: newDoctor.specialty,
      hospital: newDoctor.hospital,
      hopital: newDoctor.hospital,
      phoneNumber: newDoctor.phoneNumber,
      phone: newDoctor.phoneNumber,
      telephone: newDoctor.phoneNumber,
      email: newDoctor.email,
      address: newDoctor.address,
      adresse: newDoctor.address,
    };

    const success = await addDoctor(doctorPayload);
    if (success) {
      setNewDoctor({ name: '', specialty: '', phoneNumber: '', email: '', address: '', hospital: '' });
      setIsModalVisible(false);
      Alert.alert('Succès', 'Médecin ajouté avec succès.');
    } else {
      Alert.alert('Erreur', 'Impossible d\'ajouter le médecin.');
    }
  };

  const handleEditPress = (index: number): void => {
    // Try to obtain doctor data from profileDoctors (server-backed) or fallback to empty
    const doctorEntry = profileDoctors && profileDoctors[index];
    const doctorObj: any = normalizeDoctor(doctorEntry);
    setEditedDoctor({ ...doctorObj });
    setEditingIndex(index);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editedDoctor.name || !editedDoctor.specialty || !editedDoctor.phoneNumber || !editedDoctor.email || !editedDoctor.address || !editedDoctor.hospital) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (editingIndex !== null && profileDoctors && profileDoctors[editingIndex]) {
      // Try to update backend if possible
      try {
        const entry = profileDoctors[editingIndex];
        let parsed: any = null;
        if (typeof entry === 'string') {
          try { parsed = JSON.parse(entry); } catch { parsed = null; }
        } else if (typeof entry === 'object' && entry !== null) {
          parsed = entry;
        }
        const doctorId = parsed && (parsed.id || parsed.medecin_id || parsed.doctor_id || parsed.doctorId);
        if (doctorId && currentProfile) {
          const payload: any = {
            nom: editedDoctor.name,
            specialite: editedDoctor.specialty,
            hopital: editedDoctor.hospital,
            telephone: editedDoctor.phoneNumber,
            email: editedDoctor.email,
            adresse: editedDoctor.address,
          };
          const res = await profileApi.updateDoctor(doctorId, payload);
          if (res.ok) {
            const list = await profileApi.getDoctors();
            if (list.ok && Array.isArray(list.data)) {
              // update local profile cache
              await updateProfile(currentProfile.id, { doctors: list.data });
            }
            Alert.alert('Succès', 'Les informations du médecin ont été mises à jour.');
          } else {
            Alert.alert('Erreur', res.error || 'Mise à jour impossible');
          }
        } else {
          console.warn('Could not find doctor id for entry:', profileDoctors[editingIndex]);
          Alert.alert('Erreur', 'Impossible de mettre à jour : identifiant introuvable.');
        }
      } catch (e) {
        console.warn('updateDoctor error', e);
        Alert.alert('Erreur', 'Mise à jour impossible (erreur interne)');
      }
    }

    setEditModalVisible(false);
    setEditingIndex(null);
  };

  const handleDeleteDoctor = (index: number): void => {
    const doctorEntry = profileDoctors && profileDoctors[index];
    const parsed = normalizeDoctor(doctorEntry);
    const doctorName = parsed && parsed.name ? parsed.name : 'ce médecin';
    Alert.alert(
      'Supprimer le médecin',
      `Êtes-vous sûr de vouloir supprimer "${doctorName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            if (doctorEntry) {
              const success = await removeDoctor(doctorEntry);
              if (success) {
                Alert.alert('Succès', 'Médecin supprimé avec succès.');
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer le médecin.');
              }
            }
          }
        }
      ]
    );
  };

  const handleRemoveDoctor = async (doctorEntry: any): Promise<void> => {
    const parsed = normalizeDoctor(doctorEntry);
    const doctorName = parsed && parsed.name ? parsed.name : String(doctorEntry);
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${doctorName}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await removeDoctor(doctorEntry);
            if (success) {
              Alert.alert('Succès', 'Médecin supprimé avec succès.');
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer le médecin.');
            }
          },
        },
      ]
    );
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
      title: 'Médecins',
    });
  }, [navigation]);

  // When the screen is focused, fetch latest doctors from backend
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const list = await profileApi.getDoctors();
          if (!isActive) return;
          if (list.ok && Array.isArray(list.data) && currentProfile) {
            // update profile doctors cache so UI shows fresh data
            await updateProfile(currentProfile.id, { doctors: list.data });
          }
        } catch (e) {
          console.warn('Error fetching doctors on focus', e);
        }
      })();
      return () => { isActive = false; };
    }, [currentProfile?.id])
  );

  // Determine if it's the main profile 
  const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header for current profile */}
        {currentProfile && (
          <View style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[styles.title, { color: colors.primary, fontWeight: 'bold' }]}>
                  {getRelationshipText(currentProfile.relationship)}
                </Text>
                <Text style={[styles.content, { color: colors.primary, opacity: 0.8 }]}>
                  {currentProfile.name}
                </Text>
              </View>
              <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
            </View>
          </View>
        )}

        {/* Conditional display based on profile */}
        {isMainProfile ? (
          // For the main profile: use profile-backed doctors when available
          <>
            {(profileDoctors && profileDoctors.length > 0) ? (
              profileDoctors.map((doctorString, index) => {
                const doctor: Doctor = normalizeDoctor(doctorString);

                return (
                  <View key={index} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{doctor.name}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => handleEditPress(index)} style={styles.editButton}>
                          <Ionicons name="create-outline" size={25} color={colors.iconPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteDoctor(index)} style={styles.deleteButton}>
                          <Ionicons name="trash-outline" size={25} color="#FF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Spécialité: </Text>
                      {doctor.specialty}
                    </Text>
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Hôpital: </Text>
                      {doctor.hospital}
                    </Text>
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Téléphone: </Text>
                      {doctor.phoneNumber}
                    </Text>
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Email: </Text>
                      {doctor.email}
                    </Text>
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Adresse: </Text>
                      {doctor.address}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}> 
                <Ionicons name="medical-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                <Text style={[styles.cardText, { textAlign: 'center', marginTop: 20 }]}>Aucun médecin enregistré pour ce profil.</Text>
                <Text style={[styles.cardText, { textAlign: 'center', opacity: 0.7 }]}>Ajoutez vos médecins pour un meilleur suivi médical</Text>
              </View>
            )}
          </>
        ) : (
          // For other profiles: full doctor display
          <>
            {profileDoctors && profileDoctors.length > 0 ? (
              <>
                {profileDoctors.map((doctorString, index) => {
                  // Normalize doctor data (string, JSON-string or object)
                  const doctor: Doctor = normalizeDoctor(doctorString);
                  
                  return (
                    <View key={index} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{doctor.name}</Text>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity onPress={() => handleRemoveDoctor(doctorString)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={25} color="#FF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {doctor.specialty && (
                        <Text style={styles.cardText}>
                          <Text style={styles.bold}>Spécialité: </Text>
                          {doctor.specialty}
                        </Text>
                      )}
                      {doctor.hospital && (
                        <Text style={styles.cardText}>
                          <Text style={styles.bold}>Hôpital: </Text>
                          {doctor.hospital}
                        </Text>
                      )}
                      {doctor.phoneNumber && (
                        <Text style={styles.cardText}>
                          <Text style={styles.bold}>Téléphone: </Text>
                          {doctor.phoneNumber}
                        </Text>
                      )}
                      {doctor.email && (
                        <Text style={styles.cardText}>
                          <Text style={styles.bold}>Email: </Text>
                          {doctor.email}
                        </Text>
                      )}
                      {doctor.address && (
                        <Text style={styles.cardText}>
                          <Text style={styles.bold}>Adresse: </Text>
                          {doctor.address}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </>
            ) : (
              <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}> 
                <Ionicons name="medical-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                <Text style={[styles.cardText, { textAlign: 'center', marginTop: 20 }]}>
                  Aucun médecin enregistré pour ce profil.
                </Text>
                <Text style={[styles.cardText, { textAlign: 'center', opacity: 0.7 }]}> 
                  Ajoutez vos médecins pour un meilleur suivi médical
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
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

      <Modal animationType="slide" visible={isModalVisible}>
        <ScrollView
          contentContainerStyle={styles.modalContainer}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text style={styles.modalTitle}>Ajouter un médecin</Text>
          
          <TextInput
            placeholder="Nom"
            value={isMainProfile ? newDoctor.name : newDoctorSimple}
            onChangeText={(text: string) => {
              if (isMainProfile) {
                setNewDoctor({ ...newDoctor, name: text })
              } else {
                setNewDoctorSimple(text);
                // For other profiles, also update newDoctor.name for consistency
                setNewDoctor({ ...newDoctor, name: text });
              }
            }}
            style={styles.input}
          />
          
          <View style={{ width: '100%' }}>
            <CustomPicker
              label="Spécialité"
              selectedValue={newDoctor.specialty}
              onValueChange={(value: string | number) => setNewDoctor({ ...newDoctor, specialty: String(value) })}
              options={specialties.map(specialty => ({ 
                label: specialty, 
                value: specialty 
              }))}
              placeholder="Sélectionner une spécialité"
            />
          </View>
          
          <TextInput
            placeholder="Téléphone"
            value={newDoctor.phoneNumber}
            onChangeText={(text: string) => setNewDoctor({ ...newDoctor, phoneNumber: text })}
            style={styles.input}
            keyboardType='phone-pad'
          />
          
          <TextInput
            placeholder="Email"
            value={newDoctor.email}
            onChangeText={(text: string) => setNewDoctor({ ...newDoctor, email: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Adresse"
            value={newDoctor.address}
            onChangeText={(text: string) => setNewDoctor({ ...newDoctor, address: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Hôpital"
            value={newDoctor.hospital}
            onChangeText={(text: string) => setNewDoctor({ ...newDoctor, hospital: text })}
            style={styles.input}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={isMainProfile ? handleAddPress : handleAddSimpleDoctor} style={styles.button}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setIsModalVisible(false);
              // Reset all fields for both main and other profiles
              setNewDoctorSimple('');
              setNewDoctor({
                name: '',
                specialty: '',
                phoneNumber: '',
                email: '',
                address: '',
                hospital: '',
              });
            }} style={styles.button}>
              <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Annuler</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="slide">
        <ScrollView
          contentContainerStyle={styles.modalContainer}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text style={styles.modalTitle}>Modifier le médecin</Text>
          
          <TextInput
            placeholder="Nom"
            value={editedDoctor.name}
            onChangeText={(text: string) => setEditedDoctor({ ...editedDoctor, name: text })}
            style={styles.input}
          />
          
          <View style={{ width: '100%' }}>
            <CustomPicker
              label="Spécialité"
              selectedValue={editedDoctor.specialty}
            onValueChange={(value: string | number) => setEditedDoctor({ ...editedDoctor, specialty: String(value) })}
              options={specialties.map(specialty => ({ 
                label: specialty, 
                value: specialty 
              }))}
              placeholder="Sélectionner une spécialité"
            />
          </View>
          
          <TextInput
            placeholder="Téléphone"
            value={editedDoctor.phoneNumber}
            onChangeText={(text: string) => setEditedDoctor({ ...editedDoctor, phoneNumber: text })}
            style={styles.input}
            keyboardType='phone-pad'
          />
          
          <TextInput
            placeholder="Email"
            value={editedDoctor.email}
            onChangeText={(text: string) => setEditedDoctor({ ...editedDoctor, email: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Adresse"
            value={editedDoctor.address}
            onChangeText={(text: string) => setEditedDoctor({ ...editedDoctor, address: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Hôpital"
            value={editedDoctor.hospital}
            onChangeText={(text: string) => setEditedDoctor({ ...editedDoctor, hospital: text })}
            style={styles.input}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.button}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Sauvegarder</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.button}>
              <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Annuler</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
