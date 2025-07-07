import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

type VibrationOptionsProps = {
    navigation: StackNavigationProp<any>;
};

// The VibrationOptions component allows users to customize vibration settings for the application, including vibration intensity, pattern, and association with sound.
export default function VibrationOptions({ navigation }: VibrationOptionsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [vibrationType, setVibrationType] = useState('default');
    const [vibrationDuration, setVibrationDuration] = useState('default');
    const [vibrationAssociation, setVibrationAssociation] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.section}>
                <Text style={styles.title}>Intensité</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, vibrationType === type && styles.selectedOption]}
                        onPress={() => setVibrationType(type)}
                    >
                        <Ionicons
                            name={vibrationType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Désactivé (aucune vibration)'
                                : type === 'type1'
                                ? 'Légère (vibration légère)'
                                : type === 'type2'
                                ? 'Moyenne (vibration moyenne)'
                                : 'Forte (vibration forte)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Schéma de vibration</Text>
                {['default', 'short', 'medium', 'long', 'sos'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, vibrationDuration === duration && styles.selectedOption]}
                        onPress={() => setVibrationDuration(duration)}
                    >
                        <Ionicons
                            name={vibrationDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Simple (1 vibration)'
                                : duration === 'short'
                                ? 'Double (2 vibrations)'
                                : duration === 'medium'
                                ? 'Triple (3 vibrations)'
                                : duration === 'long'
                                ? 'Continu (vibration continue)'
                                : 'SOS (morse)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Association vibration/son</Text>
                {['default', 'short', 'medium', 'long'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, vibrationAssociation === duration && styles.selectedOption]}
                        onPress={() => setVibrationAssociation(duration)}
                    >
                        <Ionicons
                            name={vibrationAssociation === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Simultané (vibration et son)'
                                : duration === 'short'
                                ? 'Alterné (vibration et son alternés)'
                                : duration === 'medium'
                                ? 'Vibration unique (vibration unique)'
                                : 'Son unique (son unique)'}
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