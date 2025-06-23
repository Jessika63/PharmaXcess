import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// The NotificationPreferences component allows users to customize their notification preferences, including the frequency of notifications they receive.
export default function NotificationPreferences({ navigation }): JSX.Element {
    const [notificationFrequency, setNotificationFrequency] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Fréquence des notifications</Text>
                {['default', 'daily', 'weekly'].map((frequency) => (
                    <TouchableOpacity
                        key={frequency}
                        style={[styles.option, notificationFrequency === frequency && styles.selectedOption]}
                        onPress={() => setNotificationFrequency(frequency)}
                    >
                        <Ionicons
                            name={notificationFrequency === frequency ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {frequency === 'default'
                                ? 'Immédiatement'
                                : frequency === 'daily'
                                ? 'Mensuel '
                                : 'Désactivée '}
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
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    optionText: {
        fontSize: 16,
        marginLeft: 10,
    },
    saveButton: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    saveButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },  
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    returnButtonGradient: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
    card: {
        width: '100%',
        height: 100,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        overflow: 'hidden',
    },
    cardText: {
        fontSize: 20,
        color: '#ffffff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
});
