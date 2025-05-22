import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationPreferences({ navigation }): JSX.Element {
    const [notificationType, setNotificationType] = useState('default');
    const [notificationFrequency, setNotificationFrequency] = useState('default');
    const [notificationMethod, setNotificationMethod] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Type de notification</Text>
                {['default', 'type1', 'type2'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, notificationType === type && styles.selectedOption]}
                        onPress={() => setNotificationType(type)}
                    >
                        <Ionicons
                            name={notificationType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Notifications push'
                                : type === 'type1'
                                ? 'E-mails'
                                : 'SMS'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
                                ? 'Quotidiennement'
                                : 'Hebdomadairement'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Méthode de notification</Text>
                {['default', 'email', 'sms'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.option, notificationMethod === method && styles.selectedOption]}
                        onPress={() => setNotificationMethod(method)}
                    >
                        <Ionicons
                            name={notificationMethod === method ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {method === 'default'
                                ? 'Application'
                                : method === 'email'
                                ? 'E-mail'
                                : 'SMS'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => navigation.navigate('Settings')}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.saveButtonText}>Enregistrer les préférences</Text>
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    selectedOption: {
        backgroundColor: '#EE9AD0',
        borderRadius: 10,
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
