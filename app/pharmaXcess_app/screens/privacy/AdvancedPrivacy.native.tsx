import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './AdvancedPrivacy.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}


// AdvancedPrivacy component displays a list of advanced privacy options for users to manage their data and preferences.
export default function AdvancedPrivacy({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Consulter nos documents', route: 'ViewDocuments', icon: 'document-text-outline' },
        { title: 'Préférences de notification', route: 'NotificationPreferences', icon: 'notifications-outline' },
        { title: 'Historique et transparence', route: 'HistoryTransparency', icon: 'time-outline' },
        { title: 'Données personnelles et utilisation', route: 'PersonalDataUsage', icon: 'shield-checkmark-outline' },
        { title: 'Préférences de communication', route: 'CommunicationPreferences', icon: 'chatbubble-ellipses-outline' },
        { title: 'Gestion des cookies', route: 'CookieManagement', icon: 'cog-outline' },
        { title: 'Exercice des droits RGPD ', route: 'ExerciseRights', icon: 'shield-outline' },
        { title: 'Options de gestion du compte', route: 'AccountManagement', icon: 'person-outline' },
    ]

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
