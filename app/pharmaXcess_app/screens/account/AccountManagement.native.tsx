import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
 

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

type Props = {
    navigation: StackNavigationProp<any, any>;
};

// The AccountManagement component allows users to manage their account settings, including temporary deactivation, permanent deletion, and selective data retention.
export default function AccountManagement({ navigation }: Props): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Désactivation temporaire', route: 'TemporaryDeactivation', icon: 'pause-circle-outline' },
        { title: 'Suppression définitive', route: 'PermanentDeletion', icon: 'trash-outline' },
        { title: 'Conservation sélective des données', route: 'SelectiveDataRetention', icon: 'shield-checkmark-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Render each item as a card with a gradient background and an icon */}
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
