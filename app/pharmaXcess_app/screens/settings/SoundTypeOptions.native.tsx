import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The SoundTypeOptions component allows users to customize notification sound types and durations for the application.
export default function SoundTypeOptions({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [soundType, setSoundType] = useState('default');
    const [soundDuration, setSoundDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Son de notification</Text>
                    {['default', 'type1', 'type2', 'type3', 'type4'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.option, soundType === type && styles.selectedOption]}
                            onPress={() => setSoundType(type)}
                        >
                            <Ionicons
                                name={soundType === type ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={colors.iconPrimary}
                            />
                            <Text style={styles.optionText}>
                                {type === 'default'
                                    ? 'Standard (son par défaut)'
                                    : type === 'type1'
                                    ? 'Discret'
                                    : type === 'type2'
                                    ? 'Médical (son médical)'
                                    : type === 'type3'
                                    ? 'Nature'
                                    : 'Personnalisé (son personnalisé)'}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Durée du son</Text>
                    {['default', 'type1', 'type2', 'type3'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.option, soundDuration === type && styles.selectedOption]}
                            onPress={() => setSoundDuration(type)}
                        >
                            <Ionicons
                                name={soundDuration === type ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={colors.iconPrimary}
                            />
                            <Text style={styles.optionText}>
                                {type === 'default'
                                    ? 'Court (2 secondes)'
                                    : type === 'type1'
                                    ? 'Moyen (5 secondes)'
                                    : type === 'type2'
                                    ? 'Long (10 secondes)'
                                    : 'Répétitif (15 secondes)'}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>

            {/* Bouton Retour */}
            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}