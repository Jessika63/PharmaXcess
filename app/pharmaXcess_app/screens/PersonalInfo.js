import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PersonalInfo({ navigation}) {
    const patientInfo = {
        name: 'John Doe',
        birthDate: '01/01/1980',
        age: 42,
        weight: '70 kg',
        height: '180 cm',
        bloodType : 'A+',
        phone: '06 12 34 56 78',
        email: 'johndoe@hotmail.com',
        socialSecurityNumber: '123-45-6789',
        address: '1 rue de la paix, 75000 Paris',
        emergencyContact: 'Jane Doe, 06 12 34 56 79',
    };

    const handleModifyPress = () => {
        Alert.alert('Modifier mes informations', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.infoCard}>
                <Text style={styles.label}>Nom</Text>
                <Text style={styles.value}>{patientInfo.name}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Date de naissance</Text>
                <Text style={styles.value}>{patientInfo.birthDate}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Âge</Text>
                <Text style={styles.value}>{patientInfo.age}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Poids</Text>
                <Text style={styles.value}>{patientInfo.weight}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Taille</Text>
                <Text style={styles.value}>{patientInfo.height}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Numéro de sécurité sociale</Text>
                <Text style={styles.value}>{patientInfo.socialSecurityNumber}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Contact d'urgence</Text>
                <Text style={styles.value}>{patientInfo.emergencyContact}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Groupe sanguin</Text>
                <Text style={styles.value}>{patientInfo.bloodType}</Text>
            </View>

            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleModifyPress}>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
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
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});