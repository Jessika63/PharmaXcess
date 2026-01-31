import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import config from '../../config';

export default function CreateTicket(): React.JSX.Element {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { currentProfile } = useProfile();

    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');

    const handleCreateTicket = async () => {
        if (!title || !question) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        try {
            const payload = {
                utilisateur_id: Number(currentProfile?.id),
                subject: title,
                name: user?.name,
                question: question,
                flag: null,
                region: (currentProfile as any)?.region || 'all',
            };

            const response = await fetch(`${config.backendUrl}/discussions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de la création du ticket: ${response.statusText}`);
            }

            Alert.alert('Succès', 'Le ticket a été créé avec succès.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la création du ticket.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Titre du ticket</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Entrez le titre du ticket"
            />

            <Text style={styles.label}>Question</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={question}
                onChangeText={setQuestion}
                placeholder="Entrez votre question"
                multiline
            />

            <Button title="Confirmer" onPress={handleCreateTicket} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});