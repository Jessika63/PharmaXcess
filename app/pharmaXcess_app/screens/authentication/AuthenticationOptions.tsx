import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// The AuthenticationOptions component allows users to select their preferred authentication methods and options for two-factor authentication.
export default function AuthenticationOptions({ navigation }): JSX.Element {
    // State variables to track the selected authentication type and duration for two-factor authentication.
    const [authType, setAuthType] = useState('default');
    const [authDuration, setAuthDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Méthodes de connexion</Text>
                {['default', 'type1', 'type2', 'type3', 'type4'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, authType === type && styles.selectedOption]}
                        onPress={() => setAuthType(type)}
                    >
                        <Ionicons
                            name={authType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Code PIN'
                                : type === 'type1'
                                ? 'Mot de passe'
                                : type === 'type2'
                                ? 'Empreinte digitale'
                                : type === 'type3'
                                ? 'Reconnaissance faciale'
                                : 'Double authentification'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Options double authentification</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, authDuration === duration && styles.selectedOption]}
                        onPress={() => setAuthDuration(duration)}
                    >
                        <Ionicons
                            name={authDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'SMS'
                                : duration === 'short'
                                ? 'Email'
                                : 'Application d\'authentification'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F57196',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#adadad',
    },
    selectedOption: {
        backgroundColor: '#F57196',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 16,
    },
    returnButton: {
        marginTop: 20,
        alignSelf: 'center',
        width: '80%',
    },
    gradient: {
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    returnButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});