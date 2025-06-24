import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './NotificationPreferences.style';

// The NotificationPreferences component allows users to customize their notification preferences, including the frequency of notifications they receive.
export default function NotificationPreferences({ navigation }): JSX.Element {
    const [notificationFrequency, setNotificationFrequency] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Fréquence des notifications</Text>
                {['default', 'daily', 'weekly'].map((frequency) => (
                    <TouchableOpacity
                        key={frequency}
                        style={[styles.option, notificationFrequency === frequency && styles.selectedOption]}
                        onPress={() => setNotificationFrequency(frequency)}
                    >
                        <Ionicons
                            name={notificationFrequency === frequency ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {frequency === 'default'
                                ? 'Immédiatement'
                                : frequency === 'daily'
                                ? 'Mensuel '
                                : 'Désactivée '}
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
