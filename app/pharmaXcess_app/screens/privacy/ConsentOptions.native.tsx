import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The ConsentOptions component allows users to manage their consent preferences for data collection and sharing.
export default function ConsentOptions({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [consentType, setConsentType] = useState('default');
    const [consentDuration, setConsentDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Consentements</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, consentType === type && styles.selectedOption]}
                        onPress={() => setConsentType(type)}
                    >
                        <Ionicons
                            name={consentType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Collecte et stockage de vos informations personnelles'
                                : type === 'type1'
                                ? 'Utilisation pour la gestion de votre compte'
                                : type === 'type2'
                                ? 'Stockage de votre historique médical'
                                : 'Gestion de vos prescriptions médicales'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Autorisations</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, consentDuration === duration && styles.selectedOption]}
                        onPress={() => setConsentDuration(duration)}
                    >
                        <Ionicons
                            name={consentDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Partage avec les professionnels de santé'
                                : duration === 'short'
                                ? 'Partage avec les pharmaciens'
                                : 'Partage avec les proches'}
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
