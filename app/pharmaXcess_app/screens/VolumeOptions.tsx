import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VolumeOptions({ navigation }): JSX.Element {
    const [volume, setVolume] = useState('medium');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                {['low', 'medium', 'high'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.volumeButton, volume === level && styles.selectedVolume]}
                        onPress={() => setVolume(level)}
                    >
                        <Ionicons
                            name={volume === level ? 'checkbox-outline' : 'square-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {level === 'low' ? 'Bas' : level === 'medium' ? 'Moyen' : 'Haut'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
                    
            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Retour</Text>
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
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    volumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#F57196',
        marginHorizontal: 5,
    },
    selectedVolume: {
        backgroundColor: '#EE9AD0',
    },
    optionText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    returnButton: {
        width: '100%',
        marginTop: 20,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});