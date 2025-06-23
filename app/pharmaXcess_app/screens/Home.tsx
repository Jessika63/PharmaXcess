import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type HomeProps = {
    navigation: StackNavigationProp<any, any>;
};

type Item = {
    title: string;
    route: string;
    icon: JSX.Element;
};

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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    } as ViewStyle,
    card: {
        width: '100%',
        height: 100, 
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden',
    } as ViewStyle,
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    } as ViewStyle,
    itemText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    } as TextStyle,
});