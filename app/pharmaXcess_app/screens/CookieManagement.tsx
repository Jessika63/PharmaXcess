import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CookieManagement({ navigation }): JSX.Element {
    const [cookieConsent, setCookieConsent] = useState('default');
    const [cookieDuration, setCookieDuration] = useState('default');
    const [cookieUsage, setCookieUsage] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Consentement aux cookies</Text>
                {['default', 'yes'].map((consent) => (
                    <TouchableOpacity
                        key={consent}
                        style={[styles.option, cookieConsent === consent && styles.selectedOption]}
                        onPress={() => setCookieConsent(consent)}
                    >
                        <Ionicons
                            name={cookieConsent === consent ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {consent === 'default'
                                ? 'On'
                                : 'Off'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Durée de conservation des cookies</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, cookieDuration === duration && styles.selectedOption]}
                        onPress={() => setCookieDuration(duration)}
                    >
                        <Ionicons
                            name={cookieDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? '30 jours'
                                : duration === 'short'
                                ? '7 jours'
                                : '1 jour'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Utilisation des cookies</Text>
                {['default', 'analytics', 'advertising'].map((usage) => (
                    <TouchableOpacity
                        key={usage}
                        style={[styles.option, cookieUsage === usage && styles.selectedOption]}
                        onPress={() => setCookieUsage(usage)}
                    >
                        <Ionicons
                            name={cookieUsage === usage ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {usage === 'default'
                                ? 'Cookies de session'
                                : usage === 'analytics'
                                ? 'Cookies d\'analyse'
                                : 'Cookies publicitaires'}
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
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
    },
    returnButtonGradient: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        width: '100%',
        overflow: 'hidden',
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#F57196',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
