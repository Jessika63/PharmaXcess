import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SoundTypeOptions({ navigation }): JSX.Element {
    const [soundType, setSoundType] = useState('default'); // Options: 'default', 'type1', 'type2', 'type3'

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Options de Type de Son</Text>

            {/* Options de Type de Son */}
            <View style={styles.section}>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, soundType === type && styles.selectedOption]}
                        onPress={() => setSoundType(type)}
                    >
                        <Ionicons
                            name={soundType === type ? 'checkbox-outline' : 'square-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Par défaut'
                                : type === 'type1'
                                ? 'Type 1'
                                : type === 'type2'
                                ? 'Type 2'
                                : 'Type 3'}
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
        backgroundColor: '#EE9AD0',
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