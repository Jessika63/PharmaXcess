import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Doctors({ navigation }) {
    const doctors = [
        {
            name: 'Dr. Dupont',
            specialty: 'Cardiologue',
            hospital: 'Hôpital Saint-Louis',
            phoneNumber: '01 23 45 67 89',
            email: 'dupont.cardio@hotmail.com',
            address: '1 rue de la paix, 75000 Paris',
        },
        {
            name: 'Dr. Martin',
            specialty: 'Gastro-entérologue',
            hospital: 'Hôpital Lariboisière',
            phoneNumber: '01 23 45 67 89',
            email: 'martin.gastro@hotmail.com',
            address: '2 rue de la paix, 75000 Paris',
        },
        {
            name: 'Dr. Lefevre',
            specialty: 'Orthopédiste',
            hospital: 'Hôpital Tenon',
            phoneNumber: '01 23 45 67 89',
            email: 'lefevre.ortho@hotmail.com',
            address: '3 rue de la paix, 75000 Paris',
        },
        {
            name: 'Dr. Lemoine',
            specialty: 'Chirurgien',
            hospital: 'Hôpital Robert-Debré',
            phoneNumber: '01 23 45 67 89',
            email: 'lemoine.chirurgie@hotmail.com',
            address: '4 rue de la paix, 75000 Paris',
        },
    ];

    const handleAddPress = () => {
        Alert.alert('Ajouter un médecin', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    const handleEditPress = (doctorName) => {
        Alert.alert('Modifier le médecin', `Cette fonctionnalité n\'est pas encore implémentée pour le médecin "${doctorName}".`);
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
    },
    doctorList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
        width: '100%',
    },
    doctorCard: {
        width: '100%',
        backgroundColor: '#F2F2F2',
        marginVertical: 8,
        borderRadius: 10,
        marginBottom: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    doctorTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    doctorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        width: '40%',
        borderRadius: 10,
    },
    gradient: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});