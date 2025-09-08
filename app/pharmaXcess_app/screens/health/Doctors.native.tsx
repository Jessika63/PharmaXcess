import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal,  TouchableOpacity, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
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
  const { currentProfile } = useProfile();
  const { doctors: profileDoctors, addDoctor, removeDoctor } = useProfileData();
  const styles = createStyles(colors, fontScale);

  const [doctors, setDoctors] = useState<Doctor[]>([
        {
            name: 'Dr. Jean Dupont',
            specialty: 'Cardiologue',
            phoneNumber: '01 23 45 67 89',
            email: 'dupont.cardio@hotmail.com',
            address: '1 rue de la santé, 75000 Paris',
            hospital: 'Hôpital Cochin',
        },
        {
            name: 'Dr. Marie Curie',
            specialty: 'Oncologue',
            phoneNumber: '01 23 45 67 90',
            email: 'curie.onco@hotmail.com',
            address: '2 avenue de la médecine, 75000 Paris',
            hospital: 'Hôpital Pitié-Salpêtrière',
        },

  ]);

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
    const doctorData = {
      name: newDoctor.name.trim(),
      specialty: newDoctor.specialty || specialties[0],
      hospital: newDoctor.hospital || '',
      phoneNumber: newDoctor.phoneNumber || '',
      email: newDoctor.email || '',
      address: newDoctor.address || ''
    };

    const success = await addDoctor(JSON.stringify(doctorData));
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

  const handleAddPress = (): void => {
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.phoneNumber || !newDoctor.email || !newDoctor.address || !newDoctor.hospital) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setDoctors([...doctors, newDoctor]);
    setNewDoctor({
      name: '',
      specialty: '',
      phoneNumber: '',
      email: '',
      address: '',
      hospital: '',
    });
    setIsModalVisible(false);
  };

  const handleEditPress = (index: number): void => {
    const doctor = doctors[index];
    setEditedDoctor({ ...doctor });
    setEditingIndex(index);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (): void => {
    if (!editedDoctor.name || !editedDoctor.specialty || !editedDoctor.phoneNumber || !editedDoctor.email || !editedDoctor.address || !editedDoctor.hospital) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (editingIndex !== null) {
      const updatedDoctors = [...doctors];
      updatedDoctors[editingIndex] = editedDoctor;
      setDoctors(updatedDoctors);
    }

    setEditModalVisible(false);
    setEditingIndex(null);
    Alert.alert('Succès', 'Les informations du médecin ont été mises à jour.');
  };

  const handleDeleteDoctor = (index: number): void => {
    const doctor = doctors[index];
    Alert.alert(
      'Supprimer le médecin',
      `Êtes-vous sûr de vouloir supprimer "${doctor.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            const updatedDoctors = doctors.filter((_, i) => i !== index);
            setDoctors(updatedDoctors);
          }
        }
      ]
    );
  };

  const handleRemoveDoctor = async (doctor: string): Promise<void> => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${doctor}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await removeDoctor(doctor);
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
          // For the main profile: predefined complex cards
          <>
            {doctors.map((doctor, index) => (
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
            ))}
          </>
        ) : (
          // For other profiles: full doctor display
          <>
            {profileDoctors && profileDoctors.length > 0 ? (
              <>
                {profileDoctors.map((doctorString, index) => {
                  // Parse doctor data (could be JSON string or simple name)
                  let doctor: Doctor;
                  try {
                    doctor = JSON.parse(doctorString);
                  } catch {
                    // Fallback for simple string names
                    doctor = {
                      name: doctorString,
                      specialty: '',
                      hospital: '',
                      phoneNumber: '',
                      email: '',
                      address: ''
                    };
                  }
                  
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
            onChangeText={(text) => {
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
          
          <CustomPicker
            label="Spécialité"
            selectedValue={newDoctor.specialty}
            onValueChange={(value) => setNewDoctor({ ...newDoctor, specialty: String(value) })}
            options={specialties.map(specialty => ({ 
              label: specialty, 
              value: specialty 
            }))}
            placeholder="Sélectionner une spécialité"
          />
          
          <TextInput
            placeholder="Téléphone"
            value={newDoctor.phoneNumber}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, phoneNumber: text })}
            style={styles.input}
            keyboardType='phone-pad'
          />
          
          <TextInput
            placeholder="Email"
            value={newDoctor.email}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, email: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Adresse"
            value={newDoctor.address}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, address: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Hôpital"
            value={newDoctor.hospital}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, hospital: text })}
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
              <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
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
            onChangeText={(text) => setEditedDoctor({ ...editedDoctor, name: text })}
            style={styles.input}
          />
          
          <CustomPicker
            label="Spécialité"
            selectedValue={editedDoctor.specialty}
            onValueChange={(value) => setEditedDoctor({ ...editedDoctor, specialty: String(value) })}
            options={specialties.map(specialty => ({ 
              label: specialty, 
              value: specialty 
            }))}
            placeholder="Sélectionner une spécialité"
          />
          
          <TextInput
            placeholder="Téléphone"
            value={editedDoctor.phoneNumber}
            onChangeText={(text) => setEditedDoctor({ ...editedDoctor, phoneNumber: text })}
            style={styles.input}
            keyboardType='phone-pad'
          />
          
          <TextInput
            placeholder="Email"
            value={editedDoctor.email}
            onChangeText={(text) => setEditedDoctor({ ...editedDoctor, email: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Adresse"
            value={editedDoctor.address}
            onChangeText={(text) => setEditedDoctor({ ...editedDoctor, address: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Hôpital"
            value={editedDoctor.hospital}
            onChangeText={(text) => setEditedDoctor({ ...editedDoctor, hospital: text })}
            style={styles.input}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.button}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Sauvegarder</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.button}>
              <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                <Text style={styles.buttonText}>Annuler</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
