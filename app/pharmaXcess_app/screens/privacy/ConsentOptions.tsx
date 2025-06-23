import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// The ConsentOptions component allows users to manage their consent preferences for data collection and sharing.
export default function ConsentOptions({ navigation }): JSX.Element {
    const [consentType, setConsentType] = useState('default');
    const [consentDuration, setConsentDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Consentements</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, consentType === type && styles.selectedOption]}
                        onPress={() => setConsentType(type)}
                    >
                        <Ionicons
                            name={consentType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Collecte et stockage de vos informations personnelles'
                                : type === 'type1'
                                ? 'Utilisation pour la gestion de votre compte'
                                : type === 'type2'
                                ? 'Stockage de votre historique médical'
                                : 'Gestion de vos prescriptions médicales'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Autorisations</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, consentDuration === duration && styles.selectedOption]}
                        onPress={() => setConsentDuration(duration)}
                    >
                        <Ionicons
                            name={consentDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Partage avec les professionnels de santé'
                                : duration === 'short'
                                ? 'Partage avec les pharmaciens'
                                : 'Partage avec les proches'}
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
    selectedOption: {
        backgroundColor: '#F57196',
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
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#adadad',
        marginBottom: 10,
    },
});