import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

type VisualOptionsProps = {
    navigation: StackNavigationProp<any>;
};

// The VisualOptions component allows users to customize visual settings such as font size, contrast modes, and application theme.
export default function VisualOptions({ navigation }: VisualOptionsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [fontSize, setFontSize] = useState('medium');
    const [contrast, setContrast] = useState('standard');
    const [theme, setTheme] = useState('light');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Options de police</Text>
                    {['small', 'medium', 'large'].map((size) => (
                        <TouchableOpacity
                            key={size}
                            style={[styles.option, fontSize === size && styles.selectedOption]}
                            onPress={() => setFontSize(size)}
                        >
                            <Ionicons
                                name={fontSize === size ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={colors.iconPrimary}
                            />
                            <Text style={styles.optionText}>
                                {size === 'small' 
                                ? 'Petite' 
                                : size === 'medium' 
                                ? 'Moyenne' 
                                : 'Grande'}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Options de contraste</Text>
                {['standard', 'deuteranopia', 'protanopia', 'tritanopia'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.option, contrast === mode && styles.selectedOption]}
                        onPress={() => setContrast(mode)}
                    >
                        <Ionicons
                            name={contrast === mode ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {mode === 'standard' 
                            ? 'Standard' 
                            : mode === 'deuteranopia' 
                            ? 'Deutéranopie' 
                            : mode === 'protanopia' 
                            ? 'Protanopie' 
                            : 'Tritanopie'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Thème de l'application</Text>
                {['light', 'dark'].map((themeOption) => (
                    <TouchableOpacity
                        key={themeOption}
                        style={[styles.option, theme === themeOption && styles.selectedOption]}
                        onPress={() => setTheme(themeOption)}
                    >
                        <Ionicons
                            name={theme === themeOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {themeOption === 'light' 
                            ? 'Clair' 
                            : 'Sombre'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.returnButton}
                onPress={() => navigation.goBack()}
            >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}
