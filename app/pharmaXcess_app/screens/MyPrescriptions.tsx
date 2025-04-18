import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type Prescription = {
    name: string;
    date: string;
    doctor: string;
    medications: string;
};

type MyPrescriptionsProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function MyPrescriptions({ navigation }: MyPrescriptionsProps): JSX.Element {
  const prescriptions: Prescription[] = [
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
  ];

  const handleAddPress = (): void => {
    Alert.alert('Ajouter une ordonnance', 'Cette fonctionnalité n\'est pas encore implémentée.');
  }


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.prescriptionList}>
        {prescriptions.map((prescription, index) => (
          <View key={index} style={styles.prescriptionCard}>
            <Text style={styles.prescriptionCard}>{prescription.name}</Text>
            <Text style={styles.prescriptionText}>Date: {prescription.date}</Text>
            <Text style={styles.prescriptionText}>Médecin: {prescription.doctor}</Text>
            <Text style={styles.prescriptionMedications}>Médicaments: {prescription.medications}</Text>
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
  prescriptionList: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
    width: '110%',
  } as ViewStyle,
  prescriptionCard: {
    fontSize: 20,
    fontWeight: 'bold',
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
  prescriptionTitle: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
  } as  TextStyle,
  prescriptionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  } as TextStyle,
  bold: {
    fontWeight: 'bold',
  } as TextStyle,
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
    prescriptionMedications: {
      fontSize: 16,
      color: '#666',
      marginBottom: 10,
    } as TextStyle,
});