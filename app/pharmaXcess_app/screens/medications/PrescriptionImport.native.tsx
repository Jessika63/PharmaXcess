import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './PrescriptionImport.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The PrescriptionImport component allows users to import prescriptions by scanning them, validating the information, and synchronizing with a pharmacy.
export default function PrescriptionImport({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Scanner une ordonnance', route: 'ScanPrescription', icon: 'camera-outline' },
        { title: 'Validation des informations', route: 'ValidatePrescription', icon: 'checkmark-circle-outline' },
        { title: 'Synchronisation avec pharmacie', route: 'SyncPharmacy', icon: 'sync-outline' },
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