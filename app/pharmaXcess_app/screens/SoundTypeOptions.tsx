import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SoundTypeOptions({ navigation }): JSX.Element {
    const [soundType, setSoundType] = useState('default');
    const [soundDuration, setSoundDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Son de notification</Text>
                    {['default', 'type1', 'type2', 'type3', 'type4'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.option, soundType === type && styles.selectedOption]}
                            onPress={() => setSoundType(type)}
                        >
                            <Ionicons
                                name={soundType === type ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color="white"
                            />
                            <Text style={styles.optionText}>
                                {type === 'default'
                                    ? 'Standard (son par défaut)'
                                    : type === 'type1'
                                    ? 'Discret'
                                    : type === 'type2'
                                    ? 'Médical (son médical)'
                                    : type === 'type3'
                                    ? 'Nature'
                                    : 'Personnalisé (son personnalisé)'}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Durée du son</Text>
                    {['default', 'type1', 'type2', 'type3'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.option, soundDuration === type && styles.selectedOption]}
                            onPress={() => setSoundDuration(type)}
                        >
                            <Ionicons
                                name={soundDuration === type ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color="white"
                            />
                            <Text style={styles.optionText}>
                                {type === 'default'
                                    ? 'Court (2 secondes)'
                                    : type === 'type1'
                                    ? 'Moyen (5 secondes)'
                                    : type === 'type2'
                                    ? 'Long (10 secondes)'
                                    : 'Répétitif (15 secondes)'}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>

            {/* Bouton Retour */}
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
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#adadad',
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
        textAlign: 'center',
    },
});