import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './AccountManagement.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The AccountManagement component allows users to manage their account settings, including temporary deactivation, permanent deletion, and selective data retention.
export default function AccountManagement({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Désactivation temporaire', route: 'TemporaryDeactivation', icon: 'pause-circle-outline' },
        { title: 'Suppression définitive', route: 'PermanentDeletion', icon: 'trash-outline' },
        { title: 'Conservation sélective des données', route: 'SelectiveDataRetention', icon: 'shield-checkmark-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Render each item as a card with a gradient background and an icon */}
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.cardGradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
