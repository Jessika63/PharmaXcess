import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VibrationOptions({ navigation }): JSX.Element {
    const [vibrationType, setVibrationType] = useState('default');
    const [vibrationDuration, setVibrationDuration] = useState('default');
    const [vibrationAssociation, setVibrationAssociation] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Intensité</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, vibrationType === type && styles.selectedOption]}
                        onPress={() => setVibrationType(type)}
                    >
                        <Ionicons
                            name={vibrationType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Désactivé (aucune vibration)'
                                : type === 'type1'
                                ? 'Légère (vibration légère)'
                                : type === 'type2'
                                ? 'Moyenne (vibration moyenne)'
                                : 'Forte (vibration forte)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Schéma de vibration</Text>
                {['default', 'short', 'medium', 'long', 'sos'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, vibrationDuration === duration && styles.selectedOption]}
                        onPress={() => setVibrationDuration(duration)}
                    >
                        <Ionicons
                            name={vibrationDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Simple (1 vibration)'
                                : duration === 'short'
                                ? 'Double (2 vibrations)'
                                : duration === 'medium'
                                ? 'Triple (3 vibrations)'
                                : duration === 'long'
                                ? 'Continu (vibration continue)'
                                : 'SOS (morse)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Association vibration/son</Text>
                {['default', 'short', 'medium', 'long'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, vibrationAssociation === duration && styles.selectedOption]}
                        onPress={() => setVibrationAssociation(duration)}
                    >
                        <Ionicons
                            name={vibrationAssociation === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Simultané (vibration et son)'
                                : duration === 'short'
                                ? 'Alterné (vibration et son alternés)'
                                : duration === 'medium'
                                ? 'Vibration unique (vibration unique)'
                                : 'Son unique (son unique)'}
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
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: 'lightgray',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#F57196',
    },
    optionText: {
        fontSize: 18,
        color: 'white',
        marginLeft: 10,
    },
    returnButton: {
        alignSelf: 'center',
        width: '80%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 20,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
});