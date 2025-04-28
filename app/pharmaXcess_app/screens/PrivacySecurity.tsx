import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function PrivacySecurity({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Gestion du consentement et des données', route: 'ConsentOptions', icon: 'shield-checkmark-outline' },
        { title: 'Authentification et sécurité', route: 'AuthenticationOptions', icon: 'lock-closed-outline' },
        { title: 'Protection des données sensibles', route: 'SensibleDataOptions', icon: 'shield-outline' },
        { title: 'Gestion des données personnelles', route: 'PersonalDataOptions', icon: 'person-outline' },
        { title: 'Conformité réglementaire', route: 'ReglementationOptions', icon: 'document-text-outline' },
        { title: 'Sécurité avancée', route: 'AdvancedSecurityOptions', icon: 'shield-checkmark-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.itemText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
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
        height: 105,
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
