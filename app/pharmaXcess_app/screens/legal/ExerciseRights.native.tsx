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

// The ExerciseRights component allows users to exercise their rights regarding personal data, such as requesting data copies, limiting processing, and correcting inaccuracies.
export default function ExerciseRights({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const items: Item[] = [
        { title: 'Demander une copie complète de mes données personnelles', route: 'RequestData', icon: 'document-text-outline' },
        { title: 'Demander la limitation du traitement de mes données personnelles', route: 'LimitProcessing', icon: 'shield-checkmark-outline' },
        { title: 'Demander la rectification des données personnelles inexactes', route: 'RequestCorrection', icon: 'checkmark-circle-outline' },
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
