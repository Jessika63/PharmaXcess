import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function AdvancedPrivacy({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Gestion des données', route: 'DataManagement', icon: 'shield-checkmark-outline' },
        { title: 'Sécurité des données', route: 'DataSecurity', icon: 'lock-closed-outline' },
        { title: 'Confidentialité des données', route: 'DataPrivacy', icon: 'eye-off-outline' },
        { title: 'Paramètres de confidentialité avancés', route: 'AdvancedPrivacySettings', icon: 'settings-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
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
        flexDirection: 'column',
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
    cardGradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    gradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 20,
        color: '#ffffff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});