import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportIssue({ navigation }): JSX.Element {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [issueType, setIssueType] = useState<string>('');
    const [attachment, setAttachment] = useState<string>('');

    const handleConfirm = () => {
        Alert.alert('Confirmation', 'Votre problème a été signalé avec succès.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput style={styles.input} placeholder="Type de problème" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Criticité du problème" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Description détaillée " value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Etapes pour reproduire le problème " value={issueType} onChangeText={setIssueType} />
            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Déposer un fichier', 'Fonctionnalité à venir')}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Déposer un fichier</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Confirmer</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    button: {
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 20,
        width: '100%',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 15,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
}); 
