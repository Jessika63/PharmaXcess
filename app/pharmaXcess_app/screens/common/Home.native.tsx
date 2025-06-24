import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import styles from './Home.style';

type HomeProps = {
    navigation: StackNavigationProp<any, any>;
};

type Item = {
    title: string;
    route: string;
    icon: JSX.Element;
};

// The Home component serves as the main dashboard for the application, providing quick access to various features such as prescriptions, medication reminders, and prescription reminders.
export default function Home({ navigation }: HomeProps): JSX.Element {
    const items: Item[] = [
        {
            title: 'Mes ordonnances',
            route: 'MyPrescriptions',
            icon: <Ionicons name="document-text-outline" size={24} color="white" />,
        },
        {
            title: 'Mes rappels médicaments',
            route: 'MedicineReminders',
            icon: <MaterialCommunityIcons name="pill" size={24} color="white" />,
        },
        {
            title: 'Mes rappels ordonnances',
            route: 'PrescriptionReminders',
            icon: <Ionicons name="newspaper-outline" size={24} color="white" />,
        },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Map through the items array to create a card for each feature */}
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.card}
                    onPress={() => navigation.navigate(item.route)}
                >
                    <LinearGradient
                        colors={['#EE9AD0', '#F57196']}
                        style={styles.gradient}
                    >
                        <Text style={styles.itemText}>{item.title}</Text>
                        {item.icon}
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
