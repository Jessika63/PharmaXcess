import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './VisualOptions.style';

// The VisualOptions component allows users to customize visual settings such as font size, contrast modes, and application theme.
export default function VisualOptions({ navigation }): JSX.Element {
    const [fontSize, setFontSize] = useState('medium');
    const [contrast, setContrast] = useState('standard');
    const [theme, setTheme] = useState('light');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Options de police</Text>
                    {['small', 'medium', 'large'].map((size) => (
                        <TouchableOpacity
                            key={size}
                            style={[styles.option, fontSize === size && styles.selectedOption]}
                            onPress={() => setFontSize(size)}
                        >
                            <Ionicons
                                name={fontSize === size ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color="white"
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
                <Text style={styles.sectionTitle}>Options de contraste</Text>
                {['standard', 'deuteranopia', 'protanopia', 'tritanopia'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.option, contrast === mode && styles.selectedOption]}
                        onPress={() => setContrast(mode)}
                    >
                        <Ionicons
                            name={contrast === mode ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.sectionTitle}>Thème de l'application</Text>
                {['light', 'dark'].map((themeOption) => (
                    <TouchableOpacity
                        key={themeOption}
                        style={[styles.option, theme === themeOption && styles.selectedOption]}
                        onPress={() => setTheme(themeOption)}
                    >
                        <Ionicons
                            name={theme === themeOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}
