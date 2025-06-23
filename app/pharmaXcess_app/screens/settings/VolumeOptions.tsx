import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// The VolumeOptions component allows users to select their preferred volume levels for notifications and alerts.
export default function VolumeOptions({ navigation }): JSX.Element {
    const [volume, setVolume] = useState('medium'); 

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Options de Volume</Text>

            <View style={styles.section}>
                {['mute', 'low', 'medium', 'high', 'max'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.option, volume === level && styles.selectedOption]}
                        onPress={() => setVolume(level)}
                    >
                        <Ionicons
                            name={volume === level ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {level === 'mute'
                                ? 'Silencieux'
                                : level === 'low'
                                ? 'Faible'
                                : level === 'medium'
                                ? 'Moyen'
                                : level === 'high'
                                ? 'Fort'
                                : 'Maximum'}
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
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#adadad',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#F57196',
    },
    optionText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 10,
    },
    returnButton: {
        marginTop: 20,
        width: '100%',
        borderRadius: 10,
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
});