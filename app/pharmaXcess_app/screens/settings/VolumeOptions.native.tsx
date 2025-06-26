import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
    
// The VolumeOptions component allows users to select their preferred volume levels for notifications and alerts.
export default function VolumeOptions({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [volume, setVolume] = useState('medium');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Options de Volume</Text>

            <View style={styles.section}>
                {['mute', 'low', 'medium', 'high', 'max'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.option, volume === level && styles.selectedOption]}
                        onPress={() => setVolume(level)}
                    >
                        <Ionicons
                            name={volume === level ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {level === 'mute'
                                ? 'Silencieux'
                                : level === 'low'
                                ? 'Faible'
                                : level === 'medium'
                                ? 'Moyen'
                                : level === 'high'
                                ? 'Fort'
                                : 'Maximum'}
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
