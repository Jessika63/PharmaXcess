import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Touchable, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TechnicalSupport({ navigation }): JSX.Element {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [requestType, setRequestType] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [attachment, setAttachment] = useState<string>('');

    const handleConfirm = () => {
        Alert.alert('Confirmation', 'Votre demande a été envoyée avec succès.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput style={styles.input} placeholder="Nom et prénom" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Numéro de téléphone" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Type de demande" value={requestType} onChangeText={setRequestType} />
            <TextInput style={styles.input} placeholder="Description de la demande" value={description} onChangeText={setDescription} />
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
    card: {
        width: '100%',
        height: 105,
        borderRadius: 10,
        paddingHorizontal: 20,
        marginVertical: 8,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    itemText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    icon: {
        position: 'absolute',
        right: 20,
        top: 15,
        width: 24,
        height: 24,
        marginTop: 15,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    button: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
});
