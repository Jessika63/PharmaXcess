import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

type PrivacySecurityProps = {
    navigation: StackNavigationProp<any>;
};

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}
 
// The PrivacySecurity component allows users to manage their privacy and security settings within the application.
export default function PrivacySecurity({ navigation }: PrivacySecurityProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Gestion du consentement et des données', route: 'ConsentOptions', icon: 'shield-checkmark-outline' },
        { title: 'Authentification et sécurité', route: 'AuthenticationOptions', icon: 'lock-closed-outline' },
        { title: 'Protection des données sensibles', route: 'SensibleDataOptions', icon: 'shield-outline' },
        { title: 'Gestion des données personnelles', route: 'PersonalDataOptions', icon: 'person-outline' },
        { title: 'Conformité réglementaire', route: 'ReglementationOptions', icon: 'document-text-outline' },
        { title: 'Sécurité avancée', route: 'AdvancedSecurityOptions', icon: 'shield-checkmark-outline' },
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
