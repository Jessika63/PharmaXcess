import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';


// The AccountProfile component allows users to manage their health profile settings, including treatment management, prescription synchronization, data export/import, and medical contacts.
import type { StackNavigationProp } from '@react-navigation/stack';

type AccountProfileProps = {
    navigation: StackNavigationProp<any>;
};

export default function AccountProfile({ navigation }: AccountProfileProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [profileType, setProfileType] = useState('default');
    const [profileDuration, setProfileDuration] = useState('default');
    const [exports, setExports] = useState('default');
    const [contacts, setContacts] = useState('default'); 

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.section}>
                <Text style={styles.title}>Gestion des traitements</Text>
                {['default', 'type1', 'type2'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, profileType === type && styles.selectedOption]}
                        onPress={() => setProfileType(type)}
                    >
                        <Ionicons
                            name={profileType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Partager mes traitements avec mes professionnels de santé'
                                : type === 'type1'
                                ? 'Générer rapport suivi de traitement'
                                : 'Masquer certains traitements au public '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Synchronisation des ordonnances</Text>
                {['default', 'short'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, profileDuration === duration && styles.selectedOption]}
                        onPress={() => setProfileDuration(duration)}
                    >
                        <Ionicons
                            name={profileDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Synchronisation automatique avec ma pharmacie'
                                : 'Notifications avant expiration de mon ordonnance '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Exportation/import de données médicales </Text>
                {['default', 'short', 'medium', 'share'].map((exportType) => (
                    <TouchableOpacity
                        key={exportType}
                        style={[styles.option, exports === exportType && styles.selectedOption]}
                        onPress={() => setExports(exportType)}
                    >
                        <Ionicons
                            name={exports === exportType ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {exportType === 'default'
                                ? 'Format médical standard (HL7, FHIR) '
                                : exportType === 'short'
                                ? 'Intégration avec mon dossier médical partagé '
                                : exportType === 'medium'
                                ? 'Import depuis d\'autres applications de santé'
                                : 'Partage sécurisé avec les professionnels autorisés '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Contacts médicaux </Text>
                {['default', 'short', 'medium'].map((contactType) => (
                    <TouchableOpacity
                        key={contactType}
                        style={[styles.option, contacts === contactType && styles.selectedOption]}
                        onPress={() => setContacts(contactType)}
                    >
                        <Ionicons
                            name={contacts === contactType ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {contactType === 'default'
                                ? 'Ajouter pharmacie habituelle'
                                : contactType === 'short'
                                ? 'Définir des contacts d\'urgence'
                                : 'Autorisations accès professionnel '}
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

