import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// The AdvancedSecurityOptions component allows users to configure advanced security settings for their account.
export default function AdvancedSecurityOptions({ navigation }): JSX.Element {
    const [securityLevel, setSecurityLevel] = useState('default');
    const [dataEncryption, setDataEncryption] = useState('default');
    const [twoFactorAuth, setTwoFactorAuth] = useState('default');
    const [sessionTimeout, setSessionTimeout] = useState('default');
    const [dataBackup, setDataBackup] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Chiffrement des données</Text>
                {['default', 'low', 'medium'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.option, securityLevel === level && styles.selectedOption]}
                        onPress={() => setSecurityLevel(level)}
                    >
                        <Ionicons
                            name={securityLevel === level ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Backup et Sauvegarde</Text>
                {['default', 'enabled'].map((encryption) => (
                    <TouchableOpacity
                        key={encryption}
                        style={[styles.option, dataEncryption === encryption && styles.selectedOption]}
                        onPress={() => setDataEncryption(encryption)}
                    >
                        <Ionicons
                            name={dataEncryption === encryption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Notifications de sécurité </Text>
                {['default', 'enabled', 'disabled'].map((auth) => (
                    <TouchableOpacity
                        key={auth}
                        style={[styles.option, twoFactorAuth === auth && styles.selectedOption]}
                        onPress={() => setTwoFactorAuth(auth)}
                    >
                        <Ionicons
                            name={twoFactorAuth === auth ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Authentification renforcée</Text>
                {['default', 'short', 'medium'].map((timeout) => (
                    <TouchableOpacity
                        key={timeout}
                        style={[styles.option, sessionTimeout === timeout && styles.selectedOption]}
                        onPress={() => setSessionTimeout(timeout)}
                    >
                        <Ionicons
                            name={sessionTimeout === timeout ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Vérification des appareils </Text>
                {['default', 'enabled', 'disabled', 'approved'].map((backup) => (
                    <TouchableOpacity
                        key={backup}
                        style={[styles.option, dataBackup === backup && styles.selectedOption]}
                        onPress={() => setDataBackup(backup)}
                    >
                        <Ionicons
                            name={dataBackup === backup ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F57196',
    },
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F57196',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#adadad',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    selectedOption: {
        backgroundColor: '#F57196',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});
