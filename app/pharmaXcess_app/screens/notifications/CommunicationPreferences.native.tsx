import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The CommunicationPreferences component allows users to set their communication preferences regarding features, partnerships, clinical trials, and surveys.
export default function CommunicationPreferences({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [communicationMethod, setCommunicationMethod] = useState('default');
    const [partnershipCommunication, setPartnershipCommunication] = useState('default');
    const [tryInformation, setTryInformation] = useState('default');
    const [askPatient, setAskPatient] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Communication sur les fonctionnalités</Text>
                {['default', 'email'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.option, communicationMethod === method && styles.selectedOption]}
                        onPress={() => setCommunicationMethod(method)}
                    >
                        <Ionicons
                            name={communicationMethod === method ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {method === 'default'
                                ? 'On'
                                : 'Off'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Communication avec les partenaires</Text>
                {['default', 'yes'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, partnershipCommunication === option && styles.selectedOption]}
                        onPress={() => setPartnershipCommunication(option)}
                    >
                        <Ionicons
                            name={partnershipCommunication === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {option === 'default'
                                ? 'On'
                                : 'Off '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Informations sur les essais cliniques</Text>
                {['default', 'yes'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, tryInformation === option && styles.selectedOption]}
                        onPress={() => setTryInformation(option)}
                    >
                        <Ionicons
                            name={tryInformation === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {option === 'default'
                                ? 'On '
                                : 'Off '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Sondages et retours d'expérience </Text>
                {['default', 'yes'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, askPatient === option && styles.selectedOption]}
                        onPress={() => setAskPatient(option)}
                    >
                        <Ionicons
                            name={askPatient === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {option === 'default'
                                ? 'On '
                                : 'Off '}
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
