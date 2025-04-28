import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PrivacySecurity({ navigation }): JSX.Element {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('consentOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Gestion du consentement et des données</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('authenticationOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Authentification et sécurité</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('sensibleDataOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Protection des données sensibles</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('personalDataOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Gestion des données personnelles</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('reglementationOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Conformité réglementaire</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('avancedSecurityOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Sécurité avancée</Text>
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
    gradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    itemText: {
        fontSize: 20,
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});
//         paddingVertical: 15,