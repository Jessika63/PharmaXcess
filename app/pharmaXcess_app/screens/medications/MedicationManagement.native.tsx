import react, { useState } from 'react';
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

// The MedicationManagement component allows users to manage their medication-related tasks, including adding new treatments, configuring reminders, and tracking medication history.
import type { StackNavigationProp } from '@react-navigation/stack';

type MedicationManagementProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function MedicationManagement({ navigation }: MedicationManagementProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Ajouter un nouveau traitement', route: 'AddTreatment', icon: 'add-circle-outline' },
        { title: 'Configuration des rappels', route: 'ReminderSettings', icon: 'alarm-outline' },
        { title: 'Suivi de l\'historique des prises', route: 'HistoryTracking', icon: 'time-outline' },

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
