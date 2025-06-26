import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];  
}

// FAQ component provides a list of frequently asked questions (FAQ) categories, allowing users to navigate to specific FAQ sections such as General, Account Privacy, Medication Management, Technical Issues, and Partner Pharmacies.
export default function FAQ({ navigation }): React.JSX.Element {

    const { colors } = useTheme();
    const styles = createStyles(colors);

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
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color={colors.iconPrimary} style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
