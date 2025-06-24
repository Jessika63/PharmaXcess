import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './AccountPrivacyFAQ.style'

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The AccountPrivacyFAQ component provides a list of frequently asked questions related to account privacy, allowing users to navigate to specific sections for more information.
export default function AccountPrivacyFAQ({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Comment supprimer mon compte ?', route: 'DeleteAccount', icon: 'trash-outline' },
        { title: 'Qui a accès à mes données ?', route: 'DataAccess', icon: 'lock-closed-outline' },
        { title: 'Comment modifier mes informations personnelles ?', route: 'EditPersonalInfo', icon: 'create-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Map through the items array to create a card for each FAQ item */}
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

