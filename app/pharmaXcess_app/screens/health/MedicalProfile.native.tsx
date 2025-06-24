import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './MedicalProfile.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The MedicalProfile component displays a list of options related to medical profile management, allowing users to navigate to different screens.
export default function MedicalProfile({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Configuration du profil médical', route: 'ProfileSetup', icon: 'person-add-outline' },
        { title: 'Ajout de conditions médicales et allergies', route: 'MedicalConditions', icon: 'medkit-outline' },
        { title: 'Partage sécurisé avec les professionnels de santé', route: 'SecureSharing', icon: 'shield-checkmark-outline' },
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
