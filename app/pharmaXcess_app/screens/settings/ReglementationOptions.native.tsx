import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

type ReglementationOptionsProps = {
    navigation: StackNavigationProp<any>;
};

// The ReglementationOptions component allows users to customize their GDPR compliance settings, including data access rights, privacy policy notifications, and certification visibility.
export default function ReglementationOptions({ navigation }: ReglementationOptionsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [reglementationType, setReglementationType] = useState('default');
    const [reglementationDuration, setReglementationDuration] = useState('default');
    const [reglementationAccess, setReglementationAccess] = useState('default');
    const [reglementationConfirmation, setReglementationConfirmation] = useState('default');
    const [reglementationConfidentiality, setReglementationConfidentiality] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Statut RGPD</Text>
                {['default', 'type1', 'type2'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, reglementationType === type && styles.selectedOption]}
                        onPress={() => setReglementationType(type)}
                    >
                        <Ionicons
                            name={reglementationType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Afficer le statut RGPD'
                                : type === 'type1'
                                ? 'Recevoir notifications des mises à jour de politique RGPD'
                                : 'Revoir et renouveler mon consentement annuellement'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Droit d'accès</Text>
                {['default', 'short', 'medium', 'long'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, reglementationDuration === duration && styles.selectedOption]}
                        onPress={() => setReglementationDuration(duration)}
                    >
                        <Ionicons
                            name={reglementationDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Demander l\'accès complet à mes données'
                                : duration === 'short'
                                ? 'Demander la rectification de mes données'
                                : duration === 'medium'
                                ? 'Demander l\'effacement de mes données'
                                : 'Limiter le traitement de mes données'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Politique de confidentialité</Text>
                {['default', 'public'].map((access) => (
                    <TouchableOpacity
                        key={access}
                        style={[styles.option, reglementationAccess === access && styles.selectedOption]}
                        onPress={() => setReglementationAccess(access)}
                    >
                        <Ionicons
                            name={reglementationAccess === access ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {access === 'default'
                                ? 'Recevoir la politique de confidentialité'
                                : 'Notifier changement de la politique de confidentialité'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Mises à jours des conditions</Text>
                {['default', 'immediate', 'weekly'].map((confirmation) => (
                    <TouchableOpacity
                        key={confirmation}
                        style={[styles.option, reglementationConfirmation === confirmation && styles.selectedOption]}
                        onPress={() => setReglementationConfirmation(confirmation)}
                    >
                        <Ionicons
                            name={reglementationConfirmation === confirmation ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {confirmation === 'default'
                                ? 'Consentement explicite pour chaque mise à jour'
                                : confirmation === 'immediate'
                                ? 'Comparaison des mises à jour'
                                : 'Option refus nouvelles conditions'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Certifications et normes</Text>
                {['default', 'high', 'medium', 'low'].map((confidentiality) => (
                    <TouchableOpacity
                        key={confidentiality}
                        style={[styles.option, reglementationConfidentiality === confidentiality && styles.selectedOption]}
                        onPress={() => setReglementationConfidentiality(confidentiality)}
                    >
                        <Ionicons
                            name={reglementationConfidentiality === confidentiality ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {confidentiality === 'default'
                                ? 'Afficher les certifications'
                                : confidentiality === 'high'
                                ? 'Vérifier la conformité aux normes'
                                : confidentiality === 'medium'
                                ? 'Consulter les audits de sécurité'
                                : 'Télécharger attestations conformité'}
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
