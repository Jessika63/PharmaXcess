import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './MedicationManagementFAQ.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];    
}

// The MedicationManagementFAQ component provides a list of frequently asked questions related to medication management, allowing users to navigate to specific sections for more information.
export default function MedicationManagementFAQ({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Comment ajouter des médicaments non prescrits ?', route: 'AddOverTheCounter', icon: 'medkit-outline' },
        { title: 'Que faire si je manque une prise ?', route: 'MissedDose', icon: 'alert-circle-outline' },
        { title: 'Comment gérer les interactions médicamenteuses ?', route: 'DrugInteractions', icon: 'warning-outline' },
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