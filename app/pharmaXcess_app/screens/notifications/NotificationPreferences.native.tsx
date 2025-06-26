import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The NotificationPreferences component allows users to customize their notification preferences, including the frequency of notifications they receive.
export default function NotificationPreferences({ navigation }): React.JSX.Element {
    const [notificationFrequency, setNotificationFrequency] = useState('default');
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Fréquence des notifications</Text>
                {['default', 'daily', 'weekly'].map((frequency) => (
                    <TouchableOpacity
                        key={frequency}
                        style={[styles.option, notificationFrequency === frequency && styles.selectedOption]}
                        onPress={() => setNotificationFrequency(frequency)}
                    >
                        <Ionicons
                            name={notificationFrequency === frequency ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {frequency === 'default'
                                ? 'Immédiatement'
                                : frequency === 'daily'
                                ? 'Mensuel '
                                : 'Désactivée '}
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
