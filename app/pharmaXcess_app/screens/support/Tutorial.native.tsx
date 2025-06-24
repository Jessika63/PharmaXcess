import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './Tutorial.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The Tutorial component provides a list of tutorial sections, allowing users to navigate to specific topics such as First Steps, Medication Management, Prescription Import, and Medical Profile.
export default function Tutorial({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Premiers pas', route: 'FirstSteps', icon: 'book-outline' },
        { title: 'Gestion des médicaments', route: 'MedicationManagement', icon: 'medkit-outline' },
        { title: 'Importation des ordonnances', route: 'PrescriptionImport', icon: 'document-text-outline' },
        { title: 'Profil médical', route: 'MedicalProfile', icon: 'person-outline' },
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
