import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        flexDirection: 'column',
    },
    card: {
        width: '100%',
        height: 100,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    gradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 20,
        color: '#ffffff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});