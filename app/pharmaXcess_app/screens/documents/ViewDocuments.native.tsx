import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './ViewDocuments.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The ViewDocuments component displays a list of documents related to privacy policies and allows users to navigate to different sections or download them in PDF format.
export default function ViewDocuments({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Politique de confidentialité complète ', route: 'PrivacyPolicy', icon: 'document-text-outline' },
        { title: 'Version simplifiée et résumé', route: 'SimplifiedVersion', icon: 'document-text-outline' },
        { title: 'Télécharger au format PDF', route: 'DownloadPDF', icon: 'document-text-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Map through the items array to create a card for each document */}
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
