import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './HistoryTransparency.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The HistoryTransparency component provides a list of options for users to view and manage their version history, recent changes, and version comparisons.
export default function HistoryTransparency({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Consulter l\'historique des versions', route: 'VersionHistory', icon: 'document-text-outline' },
        { title: 'Voir les changements récents', route: 'RecentChanges', icon: 'document-text-outline' },
        { title: 'Comparer les versions', route: 'CompareVersions', icon: 'document-text-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
