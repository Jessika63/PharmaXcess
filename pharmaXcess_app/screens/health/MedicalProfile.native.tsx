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

// The MedicalProfile component displays a list of options related to medical profile management, allowing users to navigate to different screens.
import type { StackNavigationProp } from '@react-navigation/stack';

type MedicalProfileProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function MedicalProfile({ navigation }: MedicalProfileProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Configuration du profil médical', route: 'ProfileSetup', icon: 'person-add-outline' },
        { title: 'Ajout de conditions médicales et allergies', route: 'MedicalConditions', icon: 'medkit-outline' },
        { title: 'Partage sécurisé avec les professionnels de santé', route: 'SecureSharing', icon: 'shield-checkmark-outline' },
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
