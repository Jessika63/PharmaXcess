import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CommunicationPreferences({ navigation }): JSX.Element {
    const [communicationMethod, setCommunicationMethod] = useState('default');
    const [partnershipCommunication, setPartnershipCommunication] = useState('default');
    const [tryInformation, setTryInformation] = useState('default');
    const [askPatient, setAskPatient] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Communication sur les fonctionnalités</Text>
                {['default', 'email'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.option, communicationMethod === method && styles.selectedOption]}
                        onPress={() => setCommunicationMethod(method)}
                    >
                        <Ionicons
                            name={communicationMethod === method ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Communication avec les partenaires</Text>
                {['default', 'yes'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, partnershipCommunication === option && styles.selectedOption]}
                        onPress={() => setPartnershipCommunication(option)}
                    >
                        <Ionicons
                            name={partnershipCommunication === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Informations sur les essais cliniques</Text>
                {['default', 'yes'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, tryInformation === option && styles.selectedOption]}
                        onPress={() => setTryInformation(option)}
                    >
                        <Ionicons
                            name={tryInformation === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <Text style={styles.subtitle}>Sondages et retours d'expérience </Text>
                {['default', 'yes'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, askPatient === option && styles.selectedOption]}
                        onPress={() => setAskPatient(option)}
                    >
                        <Ionicons
                            name={askPatient === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
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
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.returnButtonGradient}>
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
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#adadad',
    },
    selectedOption: {
        backgroundColor: '#F57196',
        borderRadius: 10,
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
    },
    returnButton: {
        marginTop: 20,
    },
    returnButtonGradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
    },
});