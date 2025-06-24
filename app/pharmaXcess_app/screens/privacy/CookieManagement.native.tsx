import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './CookieManagement.style';

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
