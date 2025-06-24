import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './FirstSteps.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The FirstSteps component provides a list of initial setup tasks for new users, guiding them through account configuration, interface navigation, and settings customization.
export default function FirstSteps({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Configuration initiale du compte', route: 'AccountSetup', icon: 'settings-outline' },
        { title: 'Navigation dans l\'interface', route: 'InterfaceNavigation', icon: 'apps-outline' },
        { title: 'Personnalisation des paramètres', route: 'SettingsCustomization', icon: 'options-outline' },
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
