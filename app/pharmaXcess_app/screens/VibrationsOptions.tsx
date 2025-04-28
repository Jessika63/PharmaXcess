import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VibrationOptions({ navigation }): JSX.Element {
    const [vibrationType, setVibrationType] = useState('default');
    const [vibrationDuration, setVibrationDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Options de Vibration</Text>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Type de vibration</Text>
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
                                ? 'Standard (vibration par défaut)'
                                : type === 'type1'
                                ? 'Discret'
                                : type === 'type2'
                                ? 'Médical (vibration médicale)'
                                : 'Personnalisé (vibration personnalisée)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Durée de la vibration</Text>
                {['default', 'short', 'medium', 'long'].map((duration) => (
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
                                ? 'Court (2 secondes)'
                                : duration === 'short'
                                ? 'Moyen (5 secondes)'
                                : duration === 'medium'
                                ? 'Long (10 secondes)'
                                : 'Répétitif (15 secondes)'}
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
        fontSize: 20,
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
//     },
//     optionText: {
//         fontSize: 18,
//         color: 'white',
//         marginLeft: 10,