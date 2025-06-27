import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

// The AuthenticationOptions component allows users to select their preferred authentication methods and options for two-factor authentication.
import type { StackNavigationProp } from '@react-navigation/stack';

type AuthenticationOptionsProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function AuthenticationOptions({ navigation }: AuthenticationOptionsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    // State variables to track the selected authentication type and duration for two-factor authentication.
    const [authType, setAuthType] = useState('default');
    const [authDuration, setAuthDuration] = useState('default'); 

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Méthodes de connexion</Text>
                {['default', 'type1', 'type2', 'type3', 'type4'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, authType === type && styles.selectedOption]}
                        onPress={() => setAuthType(type)}
                    >
                        <Ionicons
                            name={authType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Code PIN'
                                : type === 'type1'
                                ? 'Mot de passe'
                                : type === 'type2'
                                ? 'Empreinte digitale'
                                : type === 'type3'
                                ? 'Reconnaissance faciale'
                                : 'Double authentification'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Options double authentification</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, authDuration === duration && styles.selectedOption]}
                        onPress={() => setAuthDuration(duration)}
                    >
                        <Ionicons
                            name={authDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'SMS'
                                : duration === 'short'
                                ? 'Email'
                                : 'Application d\'authentification'}
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
