import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './HelpSupport.style';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The HelpSupport component allows users to access various support resources, including a tutorial, FAQ, technical support, and issue reporting, enhancing user experience and providing assistance when needed.
export default function HelpSupport({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Tutoriel', route: 'Tutorial', icon: 'book-outline' },
        { title: 'FAQ', route: 'FAQ', icon: 'help-circle-outline' },
        { title: 'Assistance technique', route: 'TechnicalSupport', icon: 'construct-outline' },
        { title: 'Signaler un problème', route: 'ReportIssue', icon: 'alert-circle-outline' },  
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.cardGradient}>
                        <Text style={styles.itemText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
