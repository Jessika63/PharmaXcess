import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}
type AdvancedPrivacyProps = {
    navigation: StackNavigationProp<any>;
};


// AdvancedPrivacy component displays a list of advanced privacy options for users to manage their data and preferences.
export default function AdvancedPrivacy({ navigation }: AdvancedPrivacyProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Consulter nos documents', route: 'ViewDocuments', icon: 'document-text-outline' },
        { title: 'Préférences de notification', route: 'NotificationPreferences', icon: 'notifications-outline' },
        { title: 'Historique et transparence', route: 'HistoryTransparency', icon: 'time-outline' },
        { title: 'Données personnelles et utilisation', route: 'PersonalDataUsage', icon: 'shield-checkmark-outline' },
        { title: 'Préférences de communication', route: 'CommunicationPreferences', icon: 'chatbubble-ellipses-outline' },
        { title: 'Gestion des cookies', route: 'CookieManagement', icon: 'cog-outline' },
        { title: 'Exercice des droits RGPD ', route: 'ExerciseRights', icon: 'shield-outline' },
        { title: 'Options de gestion du compte', route: 'AccountManagement', icon: 'person-outline' },
    ]

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
