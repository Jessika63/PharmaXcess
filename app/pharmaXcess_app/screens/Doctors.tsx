import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
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
  const doctors: Doctor[] = [
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
        {
            name: 'Dr. Pierre Martin',
            specialty: 'Généraliste',
            phoneNumber: '01 23 45 67 91',
            email: 'martin.general@hotmail.com',
            address: '3 boulevard de la santé, 75000 Paris',
            hospital: 'Hôpital Bichat',
        },
        {
            name: 'Dr. Sophie Durand',
            specialty: 'Dermatologue',
            phoneNumber: '01 23 45 67 92',
            email: 'durand.dermato@hotmail.com',
            address: '4 rue de la peau, 75000 Paris',
            hospital: 'Hôpital Saint-Louis',
        },
        {
            name: 'Dr. Jacques Chirac',
            specialty: 'Chirurgien',
            phoneNumber: '01 23 45 67 93',
            email: 'chirac.chirur@hotmail.com',
            address: '5 avenue de la chirurgie, 75000 Paris',
            hospital: 'Hôpital Georges Pompidou',
        },
        {
            name: 'Dr. Claire Fontaine',
            specialty: 'Pédiatre',
            phoneNumber: '01 23 45 67 94',
            email: 'fontaine.pedia@hotmail.com',
            address: '6 rue des enfants, 75000 Paris',
            hospital: 'Hôpital Necker-Enfants Malades',
        },
        {
            name: 'Dr. Louis Pasteur',
            specialty: 'Immunologiste',
            phoneNumber: '01 23 45 67 95',
            email: 'pasteur.immuno@hotmail.com',
            address: '7 boulevard de l’immunité, 75000 Paris',
            hospital: 'Hôpital Henri Mondor',
        },
        {
            name: 'Dr. Émile Zola',
            specialty: 'Psychiatre',
            phoneNumber: '01 23 45 67 96',
            email: 'zola.psy@hotmail.com',
            address: '8 avenue de la psychologie, 75000 Paris',
            hospital: 'Hôpital Sainte-Anne',
        },
        {
            name: 'Dr. Victor Hugo',
            specialty: 'Neurologue',
            phoneNumber: '01 23 45 67 97',
            email: 'hugo.neuro@hotmail.com',
            address: '9 rue des nerfs, 75000 Paris',
            hospital: 'Hôpital de la Salpêtrière',
        },
  ];

  const handleAddPress = (): void => {
    Alert.alert('Ajouter un médecin', 'Cette fonctionnalité n\'est pas encore implémentée.');
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
        <TouchableOpacity style={styles.button} onPress={handleAddPress}>
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
});