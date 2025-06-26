import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import createStyles from '../../styles/Home.style';

type HomeProps = {
    navigation: StackNavigationProp<any, any>; 
};

type Item = {
    title: string;
    route: string;
    icon: React.JSX.Element;
};

// The Home component serves as the main dashboard for the application, providing quick access to various features such as prescriptions, medication reminders, and prescription reminders.
export default function Home({ navigation }: HomeProps): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    
    const items: Item[] = [
        {
            title: 'Mes ordonnances',
            route: 'MyPrescriptions',
            icon: <Ionicons name="document-text-outline" size={24} color={colors.iconPrimary} />,
        },
        {
            title: 'Mes rappels médicaments',
            route: 'MedicineReminders',
            icon: <MaterialCommunityIcons name="pill" size={24} color={colors.iconPrimary} />,
        },
        {
            title: 'Mes rappels ordonnances',
            route: 'PrescriptionReminders',
            icon: <Ionicons name="newspaper-outline" size={24} color={colors.iconPrimary} />,
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
                        colors={[colors.primary, colors.secondary]}
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
