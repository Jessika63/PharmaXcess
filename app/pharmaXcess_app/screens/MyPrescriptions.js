import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyPrescriptions({ navigation }) {
  const prescriptions = [
    { id: '1', name: 'Traitement grippe' },
    { id: '2', name: 'Traitement diabète' },
    { id: '3', name: 'Traitement Coeur' },
    { id: '4', name: 'Traitement Allergies' },
  ];

  const renderPrescription = ({ item }) => (
    <View style={styles.prescriptionItem}>
      <View style={styles.prescriptionBar} />
      <Text style={styles.prescriptionText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={prescriptions}
        renderItem={renderPrescription}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.prescriptionList}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => {/* action pour ajouter une ordonnance */}}>
          <LinearGradient colors={['#F57196', '#F7C5E0']} style={styles.gradient}>
            <Text style={styles.buttonText}>Ajouter</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <LinearGradient colors={['#F57196', '#F7C5E0']} style={styles.gradient}>
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
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  prescriptionList: {
    alignItems: 'center',
  },
  prescriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionBar: {
    width: 10,
    height: '100%',
    backgroundColor: '#F57196',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 15,
  },
  prescriptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  gradient: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '80%', 
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
