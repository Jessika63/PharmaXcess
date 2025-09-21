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
 
// The Tutorial component provides a list of tutorial sections, allowing users to navigate to specific topics such as First Steps, Medication Management, Prescription Import, and Medical Profile.
import type { StackNavigationProp } from '@react-navigation/stack';

type TutorialScreenNavigationProp = StackNavigationProp<any>;

interface TutorialProps {
    navigation: TutorialScreenNavigationProp;
}

export default function Tutorial({ navigation }: TutorialProps): React.JSX.Element {

    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

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
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color={colors.iconPrimary} style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
