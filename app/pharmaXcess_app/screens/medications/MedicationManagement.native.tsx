import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './MedicationManagement.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The MedicationManagement component allows users to manage their medication-related tasks, including adding new treatments, configuring reminders, and tracking medication history.
export default function MedicationManagement({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Ajouter un nouveau traitement', route: 'AddTreatment', icon: 'add-circle-outline' },
        { title: 'Configuration des rappels', route: 'ReminderSettings', icon: 'alarm-outline' },
        { title: 'Suivi de l\'historique des prises', route: 'HistoryTracking', icon: 'time-outline' },

    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.cardGradient}>
                        <Text style={styles.itemText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
