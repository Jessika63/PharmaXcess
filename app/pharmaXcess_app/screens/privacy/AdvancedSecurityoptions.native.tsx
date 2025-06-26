import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The AdvancedSecurityOptions component allows users to configure advanced security settings for their account.
export default function AdvancedSecurityOptions({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [securityLevel, setSecurityLevel] = useState('default');
    const [dataEncryption, setDataEncryption] = useState('default');
    const [twoFactorAuth, setTwoFactorAuth] = useState('default');
    const [sessionTimeout, setSessionTimeout] = useState('default');
    const [dataBackup, setDataBackup] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Chiffrement des données</Text>
                {['default', 'low', 'medium'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.option, securityLevel === level && styles.selectedOption]}
                        onPress={() => setSecurityLevel(level)}
                    >
                        <Ionicons
                            name={securityLevel === level ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {level === 'default'
                                ? 'Activer le chiffrement renforcé de bout en bout'
                                : level === 'low'
                                ? 'Chiffrer les données locales stockées sur l\'appareil'
                                : 'Régénérer automatiquement clés de chiffrement tous les 30 jours '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Backup et Sauvegarde</Text>
                {['default', 'enabled'].map((encryption) => (
                    <TouchableOpacity
                        key={encryption}
                        style={[styles.option, dataEncryption === encryption && styles.selectedOption]}
                        onPress={() => setDataEncryption(encryption)}
                    >
                        <Ionicons
                            name={dataEncryption === encryption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {encryption === 'default'
                                ? 'Sauvegardes quotidiennes'
                                : 'Sauvegardes locales de l\'appareil'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Notifications de sécurité </Text>
                {['default', 'enabled', 'disabled'].map((auth) => (
                    <TouchableOpacity
                        key={auth}
                        style={[styles.option, twoFactorAuth === auth && styles.selectedOption]}
                        onPress={() => setTwoFactorAuth(auth)}
                    >
                        <Ionicons
                            name={twoFactorAuth === auth ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {auth === 'default'
                                ? 'Alerte de connexion depuis un nouvel appareil '
                                : auth === 'enabled'
                                ? 'Notification de tentatives d\'accès échouées '
                                : 'Alerte activité inhabituelle'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Authentification renforcée</Text>
                {['default', 'short', 'medium'].map((timeout) => (
                    <TouchableOpacity
                        key={timeout}
                        style={[styles.option, sessionTimeout === timeout && styles.selectedOption]}
                        onPress={() => setSessionTimeout(timeout)}
                    >
                        <Ionicons
                            name={sessionTimeout === timeout ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {timeout === 'default'
                                ? 'Validation biométrique pour les informations sensibles'
                                : timeout === 'short'
                                ? 'Validation par SMS pour les modifications importantes'
                                : 'Authentification à deux facteurs'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Vérification des appareils </Text>
                {['default', 'enabled', 'disabled', 'approved'].map((backup) => (
                    <TouchableOpacity
                        key={backup}
                        style={[styles.option, dataBackup === backup && styles.selectedOption]}
                        onPress={() => setDataBackup(backup)}
                    >
                        <Ionicons
                            name={dataBackup === backup ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {backup === 'default'
                                ? 'Lister appareils connectés '
                                : backup === 'enabled'
                                ? 'Déconnecter autres appareils'
                                : backup === 'disabled'
                                ? 'Limiter à 3 appareils maximum '
                                : 'Approuver manuellement chaque appareil'}
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
