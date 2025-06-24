import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './PartnerPharmaciesFAQ.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The PartnerPharmaciesFAQ component displays a list of frequently asked questions related to partner pharmacies.
export default function PartnerPharmaciesFAQ({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Comment trouver une pharmacie compatible ?', route: 'FindCompatiblePharmacy', icon: 'search-outline' },
        { title: 'Comment synchroniser mon ordonnance avec une pharmacie ?', route: 'SyncPrescription', icon: 'sync-outline' },
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
