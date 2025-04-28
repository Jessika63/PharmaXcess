import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ConsentOptions({ navigation }): JSX.Element {
    const [consentType, setConsentType] = useState('default');
    const [consentDuration, setConsentDuration] = useState('default');
    const [consentAssociation, setConsentAssociation] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Options de Consentement</Text>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Type de consentement</Text>
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
                                ? 'Aucun (aucun consentement requis)'
                                : type === 'type1'
                                ? 'Standard (consentement standard)'
                                : type === 'type2'
                                ? 'Opt-in (consentement explicite)'
                                : 'Opt-out (consentement implicite)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Durée du consentement</Text>
                {['default', 'short', 'medium', 'long'].map((duration) => (
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
                                ? 'Court (1 mois)'
                                : duration === 'short'
                                ? 'Moyen (6 mois)'
                                : duration === 'medium'
                                ? 'Long (1 an)'
                                : 'Permanent (sans expiration)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Association de consentement</Text>
                {['default', 'type1', 'type2'].map((association) => (
                    <TouchableOpacity
                        key={association}
                        style={[styles.option, consentAssociation === association && styles.selectedOption]}
                        onPress={() => setConsentAssociation(association)}
                    >
                        <Ionicons
                            name={consentAssociation === association ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {association === 'default'
                                ? 'Aucune (aucune association)'
                                : association === 'type1'
                                ? 'Anonyme (association anonyme)'
                                : 'Identifiable (association identifiable)'}
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
        alignItems: 'center',
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
        backgroundColor: 'lightgray',
        marginBottom: 10,
    },
});