import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Item {
    title: string;
    description: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function HelpSupport({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Aide et support', description: 'Obtenez de l\'aide et du support pour votre application.', icon: 'help-circle-outline' },
        { title: 'Contactez-nous', description: 'Contactez notre équipe d\'assistance.', icon: 'mail-outline' },
        { title: 'FAQ', description: 'Consultez notre foire aux questions.', icon: 'information-circle-outline' },
        { title: 'Retour d\'expérience', description: 'Partagez vos commentaires sur l\'application.', icon: 'chatbubble-ellipses-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.title)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.cardGradient}>
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
    cardGradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    itemText: {
        fontSize: 20,
        color: 'white',
        flex: 1,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#adadad',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
        fontWeight: 'bold',
    },
    selectedOption: {
        backgroundColor: '#F57196',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
}); 