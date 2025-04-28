import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AuthenticationOptions({ navigation }): JSX.Element {
    const [authType, setAuthType] = useState('default');
    const [authDuration, setAuthDuration] = useState('default');
    const [authAssociation, setAuthAssociation] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Authentification</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, authType === type && styles.selectedOption]}
                        onPress={() => setAuthType(type)}
                    >
                        <Ionicons
                            name={authType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Authentification par mot de passe'
                                : type === 'type1'
                                ? 'Authentification par empreinte digitale'
                                : type === 'type2'
                                ? 'Authentification par reconnaissance faciale'
                                : 'Authentification par code PIN'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Durée de session</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, authDuration === duration && styles.selectedOption]}
                        onPress={() => setAuthDuration(duration)}
                    >
                        <Ionicons
                            name={authDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Session de 30 minutes'
                                : duration === 'short'
                                ? 'Session de 15 minutes'
                                : 'Session de 60 minutes'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Association d'appareils</Text>
                {['default', 'phone', 'tablet'].map((association) => (
                    <TouchableOpacity
                        key={association}
                        style={[styles.option, authAssociation === association && styles.selectedOption]}
                        onPress={() => setAuthAssociation(association)}
                    >
                        <Ionicons
                            name={authAssociation === association ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {association === 'default'
                                ? 'Aucun appareil associé'
                                : association === 'phone'
                                ? 'Appareil mobile associé'
                                : 'Tablette associée'}
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
        backgroundColor: '#f5f5f5',
    },
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#6200ee',
    },
    selectedOption: {
        backgroundColor: '#3700b3',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 16,
    },
    returnButton: {
        marginTop: 20,
        alignSelf: 'center',
        width: '80%',
    },
    gradient: {
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    returnButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});