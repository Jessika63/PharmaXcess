import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './TechnicalIssuesFAQ.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The TechnicalIssuesFAQ component provides a list of frequently asked questions related to technical issues, allowing users to navigate to specific sections such as App Sync Issues, Connection Issues, and Notification Issues.
export default function TechnicalIssuesFAQ({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'L\'application ne se synchronise pas', route: 'AppSyncIssues', icon: 'sync-outline' },
        { title: 'Problèmes de connexion', route: 'ConnectionIssues', icon: 'wifi-outline' },
        { title: 'Problèmes de notifications', route: 'NotificationIssues', icon: 'notifications-off-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.itemText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
