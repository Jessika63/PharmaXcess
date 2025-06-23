import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextStyle, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

type PersonalInfoProps = {
    navigation: StackNavigationProp<any, any>;
};

type PatientInfo = {
    name: string;
    birthDate: string;
    age: number;
    weight: string;
    height: string;
    bloodType: string;
    phone: string;
    email: string;
    socialSecurityNumber: string;
    address: string;
    emergencyContact: string;
};


// The PersonalInfo component displays the personal information of a patient, allowing them to view and modify their details.
export default function PersonalInfo({ navigation }: PersonalInfoProps) : JSX.Element {
    const patientInfo: PatientInfo = {
        name: 'John Doe',
        birthDate: '01/01/1980',
        age: 42,
        weight: '70 kg',
        height: '180 cm',
        bloodType: 'A+',
        phone: '06 12 34 56 78',
        email: 'johndoe@hotmailcom',
        socialSecurityNumber: '123-45-6789',
        address: '1 rue de la paix, 75000 Paris',
        emergencyContact: 'Jane Doe, 06 12 34 56 79',
    };

    // Define labels for each piece of patient information to be displayed in French
    const labels: { [key in keyof PatientInfo]: string } = {
        name: 'Nom',
        birthDate: 'Date de naissance',
        age: 'Âge',
        weight: 'Poids',
        height: 'Taille',
        bloodType: 'Groupe sanguin',
        phone: 'Téléphone',
        email: 'Email',
        socialSecurityNumber: 'Numéro de sécurité sociale',
        address: 'Adresse',
        emergencyContact: 'Contact d\'urgence',
    };

    const handleModifyPress = (): void => {
        Alert.alert('Modifier mes informations', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Map through the patientInfo object to display each piece of information */}
            {Object.entries(patientInfo).map(([key, value]) => (
                <View key={key} style ={styles.infoCard}>
                    <Text style={styles.label}>{labels[key as keyof PatientInfo]}</Text>
                    <Text style={styles.value}>{value}</Text>
                </View>
            ))}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleModifyPress}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Modifier</Text>
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