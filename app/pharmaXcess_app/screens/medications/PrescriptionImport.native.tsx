import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}
 
// The PrescriptionImport component allows users to import prescriptions by scanning them, validating the information, and synchronizing with a pharmacy.
import type { StackNavigationProp } from '@react-navigation/stack';

interface PrescriptionImportProps {
    navigation: StackNavigationProp<any, any>;
}

export default function PrescriptionImport({ navigation }: PrescriptionImportProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Scanner une ordonnance', route: 'ScanPrescription', icon: 'camera-outline' },
        { title: 'Validation des informations', route: 'ValidatePrescription', icon: 'checkmark-circle-outline' },
        { title: 'Synchronisation avec pharmacie', route: 'SyncPharmacy', icon: 'sync-outline' },
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