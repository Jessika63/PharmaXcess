import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal,  TouchableOpacity, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';

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

export default function Doctors({ navigation }: DoctorsProps): JSX.Element {
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
      <ScrollView contentContainerStyle={styles.doctorList}>
        {doctors.map((doctor, index) => (
          <View key={index} style={styles.doctorCard}>
            <TouchableOpacity onPress={() => handleEditPress(doctor.name)} style={styles.editButton}>
              <Ionicons name="pencil" size={25} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.cardHeader}>
              <Text style={styles.doctorTitle}>{doctor.name}</Text>
            </View>
            <Text style={styles.doctorText}>
              <Text style={styles.bold}>Spécialité: </Text>
              {doctor.specialty}
            </Text>
            <Text style={styles.doctorText}>
              <Text style={styles.bold}>Hôpital: </Text>
              {doctor.hospital}
            </Text>
            <Text style={styles.doctorText}>
              <Text style={styles.bold}>Téléphone: </Text>
              {doctor.phoneNumber}
            </Text>
            <Text style={styles.doctorText}>
              <Text style={styles.bold}>Email: </Text>
              {doctor.email}
            </Text>
            <Text style={styles.doctorText}>
              <Text style={styles.bold}>Adresse: </Text>
              {doctor.address}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
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

      <Modal animationType="slide" visible={isModalVisible}>
        <View style={styles.container}>
          <Text style={styles.doctorTitle}>Ajouter un médecin</Text>
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
          <TouchableOpacity onPress={handleAddPress} style={styles.button}>
            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
              <Text style={styles.buttonText}>Ajouter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  } as ViewStyle,
  doctorList: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
    width: '100%',
  } as ViewStyle,
  doctorCard: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    marginVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  } as ViewStyle,
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F57196',
    padding: 8,
    borderRadius: 50,
  } as ViewStyle,
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  } as  ViewStyle ,
  doctorTitle: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  } as  TextStyle,
  doctorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  } as TextStyle,
  bold: {
    fontWeight: 'bold',
  } as TextStyle,
  buttonContainer: {
    width: '100%',
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  } as ViewStyle,
  button: {
    flex: 1,
    marginHorizontal: 10,
    width: '40%',
    borderRadius: 10,
  } as ViewStyle,
  gradient: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  } as ViewStyle,
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  } as TextStyle,
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#F2F2F2',
    color: '#333',
    fontSize: 16,
  }
});