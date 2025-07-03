import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal,  TouchableOpacity, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

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
  const [newDoctor, setNewDoctor] = useState<Doctor>({
    name: '',
    specialty: '',
    phoneNumber: '',
    email: '',
    address: '',
    hospital: '',
  });

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

  const handleEditPress = (doctorName: string): void => {
    Alert.alert('Modifier le médecin', `Cette fonctionnalité n'est pas encore implémentée pour le médecin "${doctorName}".`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {doctors.map((doctor, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity onPress={() => handleEditPress(doctor.name)} style={styles.editButton}>
              <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
            </TouchableOpacity>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{doctor.name}</Text>
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
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Ajouter un médecin</Text>
          <TextInput
            placeholder="Nom"
            value={newDoctor.name}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Spécialité"
            value={newDoctor.specialty}
            onChangeText={(text) => setNewDoctor({ ...newDoctor, specialty: text })}
            style={styles.input}
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
          
          {/* Modal action buttons container - Confirm and Cancel side by side */}
          <View style={styles.modalButtonContainer}>
            {/* Confirm button - saves the doctor data */}
            <TouchableOpacity onPress={handleAddPress} style={styles.modalButton}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Confirmer</Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* Cancel button - closes modal and resets all doctor form fields */}
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                // Reset all doctor form fields to initial empty state
                setNewDoctor({
                  name: '',
                  specialty: '',
                  phoneNumber: '',
                  email: '',
                  address: '',
                  hospital: '',
                });
              }}
            >
              {/* Standardized gray gradient for cancel buttons across the app */}
              <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                <Text style={styles.buttonText}>Annuler</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
