import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];  
}

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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    card: {
        width: '100%',
        height: 105,
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
    itemText: {
        fontSize: 20,
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    icon: {
        marginLeft: 10,
        width: 24,
        height: 24,
    },
});