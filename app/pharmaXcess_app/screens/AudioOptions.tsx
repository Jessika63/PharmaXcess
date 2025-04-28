import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AudioOptions({ navigation }): JSX.Element {
    const [volume, setVolume] = useState('medium');
    const [sound, setSound] = useState('default');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Volume</Text>
                {['low', 'medium', 'high'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.optionButton, volume === level && styles.selectedOption]}
                        onPress={() => setVolume(level)}
                    >
                        <Ionicons
                            name={volume === level ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {level === 'low' ? 'Bas' : level === 'medium' ? 'Moyen' : 'Haut'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Son</Text>
                {['default', 'chime', 'alert'].map((soundOption) => (
                    <TouchableOpacity
                        key={soundOption}
                        style={[styles.optionButton, sound === soundOption && styles.selectedOption]}
                        onPress={() => setSound(soundOption)}
                    >
                        <Ionicons
                            name={sound === soundOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {soundOption === 'default' ? 'Par défaut' : sound === 'chime' ? 'Carillon' : 'Alerte'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <TouchableOpacity
                    style={[styles.optionButton, notificationsEnabled && styles.selectedOption]}
                    onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                    <Ionicons
                        name={notificationsEnabled ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color="white"
                    />
                    <Text style={styles.optionText}>
                        {notificationsEnabled ? 'Activées' : 'Désactivées'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.returnButton}
                onPress={() => navigation.goBack()}
            >
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
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: 'lightgray',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#F57196',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
    },
    gradient: {
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    returnButtonText: {
        fontSize: 18,
        color: '#ffffff',
    },
});