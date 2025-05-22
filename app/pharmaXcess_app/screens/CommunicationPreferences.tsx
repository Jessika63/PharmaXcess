import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CommunicationPreferences({ navigation }): JSX.Element {
    const [communicationMethod, setCommunicationMethod] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Méthode de communication</Text>
                {['default', 'email', 'sms'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.option, communicationMethod === method && styles.selectedOption]}
                        onPress={() => setCommunicationMethod(method)}
                    >
                        <Ionicons
                            name={communicationMethod === method ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {method === 'default'
                                ? 'Email'
                                : method === 'email'
                                ? 'SMS'
                                : 'Appel téléphonique'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.returnButtonGradient}>
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
        backgroundColor: 'white',
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
        paddingVertical: 10,
    },
    selectedOption: {
        backgroundColor: '#F57196',
        borderRadius: 10,
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
    },
    returnButton: {
        marginTop: 20,
    },
    returnButtonGradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
    },
});