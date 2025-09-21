import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

type CookieManagementProps = {
    navigation: StackNavigationProp<any>;
};

// The CookieManagement component allows users to manage their cookie preferences for the application.
export default function CookieManagement({ navigation }: CookieManagementProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [cookieConsent, setCookieConsent] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Niveau de cookies acceptés </Text>
                {['default', 'yes', 'nothing'].map((consent) => (
                    <TouchableOpacity
                        key={consent}
                        style={[styles.option, cookieConsent === consent && styles.selectedOption]}
                        onPress={() => setCookieConsent(consent)}
                    >
                        <Ionicons
                            name={cookieConsent === consent ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {consent === 'default'
                                ? 'Tous les cookies'
                                : consent === 'yes'
                                ? 'Essentiels uniquement'
                                : 'Aucun cookie'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}
