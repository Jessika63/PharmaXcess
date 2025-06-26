import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextStyle, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileChat.style';
import { useTheme } from '../../context/ThemeContext';

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
export default function PersonalInfo({ navigation }: PersonalInfoProps) : React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);


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
                <View key={key} style ={styles.card}>
                    <Text style={styles.title}>{labels[key as keyof PatientInfo]}</Text>
                    <Text style={styles.content}>{value}</Text>
                </View>
            ))}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleModifyPress}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Modifier</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
