import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AccountProfile({ navigation }): JSX.Element {
    const [profileType, setProfileType] = useState('default');
    const [profileDuration, setProfileDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Options de Profil</Text>

            <View style={styles.section}>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, profileType === type && styles.selectedOption]}
                        onPress={() => setProfileType(type)}
                    >
                        <Ionicons
                            name={profileType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Profil Standard'
                                : type === 'type1'
                                ? 'Profil Avancé'
                                : type === 'type2'
                                ? 'Profil Professionnel'
                                : 'Profil Administrateur'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, profileDuration === duration && styles.selectedOption]}
                        onPress={() => setProfileDuration(duration)}
                    >
                        <Ionicons
                            name={profileDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Durée Standard'
                                : duration === 'short'
                                ? 'Durée Courte'
                                : 'Durée Longue'}
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
        padding: 10,
        borderWidth: 1,
        borderColor: '#F57196',
        borderRadius: 5,
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
        marginTop: 20,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    returnButtonText: {
        color: 'white',
        fontSize: 18,
    },
});