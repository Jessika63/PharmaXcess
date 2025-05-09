import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdvancedSecurityOptions({ navigation }): JSX.Element {
    const [securityLevel, setSecurityLevel] = useState('default');
    const [dataEncryption, setDataEncryption] = useState('default');
    const [twoFactorAuth, setTwoFactorAuth] = useState('default');
    const [sessionTimeout, setSessionTimeout] = useState('default');
    const [dataBackup, setDataBackup] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Niveau de sécurité</Text>
                {['default', 'low', 'medium', 'high'].map((level) => (
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
                                ? 'Sécurité par défaut'
                                : level === 'low'
                                ? 'Sécurité faible'
                                : level === 'medium'
                                ? 'Sécurité moyenne'
                                : 'Sécurité élevée'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Chiffrement des données</Text>
                {['default', 'enabled', 'disabled'].map((encryption) => (
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
                                ? 'Chiffrement par défaut'
                                : encryption === 'enabled'
                                ? 'Chiffrement activé'
                                : 'Chiffrement désactivé'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Authentification à deux
                    facteurs</Text>
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
                                ? 'Authentification par défaut'
                                : auth === 'enabled'
                                ? 'Authentification à deux facteurs activée'
                                : 'Authentification à deux facteurs désactivée'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Délai d'expiration de la session</Text>
                {['default', 'short', 'medium', 'long'].map((timeout) => (
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
                                ? 'Délai d\'expiration par défaut'
                                : timeout === 'short'
                                ? 'Délai d\'expiration court'
                                : timeout === 'medium'
                                ? 'Délai d\'expiration moyen'
                                : 'Délai d\'expiration long'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Sauvegarde des données</Text>
                {['default', 'enabled', 'disabled'].map((backup) => (
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
                                ? 'Sauvegarde par défaut'
                                : backup === 'enabled'
                                ? 'Sauvegarde activée'
                                : 'Sauvegarde désactivée'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
        backgroundColor: '#F57196',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        width: '100%',
        height: 60,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    selectedOption: {
        backgroundColor: '#EE9AD0',
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
