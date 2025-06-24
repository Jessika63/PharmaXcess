import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './FAQ.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];  
}

// FAQ component provides a list of frequently asked questions (FAQ) categories, allowing users to navigate to specific FAQ sections such as General, Account Privacy, Medication Management, Technical Issues, and Partner Pharmacies.
export default function FAQ({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Général', route: 'GeneralFAQ', icon: 'help-circle-outline' },
        { title: 'Compte et confidentialité', route: 'AccountPrivacyFAQ', icon: 'lock-closed-outline' },
        { title: 'Gestion des médicaments', route: 'MedicationManagementFAQ', icon: 'medkit-outline' },
        { title: 'Problèmes techniques', route: 'TechnicalIssuesFAQ', icon: 'bug-outline' },
        { title: 'Pharmacies partenaires', route: 'PartnerPharmaciesFAQ', icon: 'business-outline' },
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
