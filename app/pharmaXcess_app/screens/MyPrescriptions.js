import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MyPrescriptions({ navigation }) {
  const prescriptions = [
    { id: '1', name: 'Traitement grippe' },
    { id: '2', name: 'Traitement diabète' },
    { id: '3', name: 'Traitement Coeur' },
    { id: '4', name: 'Traitement Allergies' },
  ];

  const handleEditPress = (prescriptionsName) => {
    alert(`Modification de "${prescriptionsName}" non implémentée. `);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.prescriptionList}>
        {prescriptions.map((prescription, index) => (
          <View key={index} style={styles.prescriptionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.prescriptionTitle}>{prescription.name}</Text>
              <TouchableOpacity onPress={() => handleEditPress(prescription.name)} style={styles.editButton}>
                <Ionicons name="pencil" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => {/*Ajouter une prescription */}}>
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
    alignItems: 'center',
    backgroundColor: 'white',
  },
  prescription: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
  },
  prescriptionCard: {
    width: '100%',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#F57196',
    padding: 5,
    borderRadius: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
  gradient: {
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

