import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal,  TouchableOpacity, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
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

  const specialties = ['Médecin généraliste', 'Cardiologue', 'Dermatologue', 'Endocrinologue', 'Gastro-entérologue', 'Gynécologue', 'Neurologue', 'Oncologue', 'Ophtalumologue', 'ORL', 'Orthopédiste', 'Pédiatre', 'Psychiatre', 'Radiologue', 'Rhumatologue', 'Urologue', 'Autre'];

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
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
            value={newDoctor.name}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, name: text })}
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
            <TouchableOpacity onPress={handleAddPress} style={styles.button}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.button}>
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
