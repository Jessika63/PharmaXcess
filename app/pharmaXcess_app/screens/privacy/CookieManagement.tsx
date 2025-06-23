import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// The CookieManagement component allows users to manage their cookie preferences for the application.
export default function CookieManagement({ navigation }): JSX.Element {
    const [cookieConsent, setCookieConsent] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Niveau de cookies acceptés </Text>
                {['default', 'yes', 'nothing'].map((consent) => (
                    <TouchableOpacity
                        key={consent}
                        style={[styles.option, cookieConsent === consent && styles.selectedOption]}
                        onPress={() => setCookieConsent(consent)}
                    >
                        <Ionicons
                            name={cookieConsent === consent ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {consent === 'default'
                                ? 'Tous les cookies'
                                : consent === 'yes'
                                ? 'Essentiels uniquement'
                                : 'Aucun cookie'}
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
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 16,
    },
    returnButtonGradient: {
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    returnButton: {
        marginTop: 20,
        width: '80%',
        alignSelf: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
