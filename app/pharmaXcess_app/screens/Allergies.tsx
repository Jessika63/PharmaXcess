import React, { useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type Allergy = {
    name: string;
    beginDate: string;
    severity: string;
    symptoms: string;
    medications: string;
    comments: string;
};

type AllergiesProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function Allergies({ navigation }: AllergiesProps): JSX.Element {
    const [allergies, setAllergies] = useState<Allergy[]>([
        {
            name: 'Pollen',
            beginDate: '01/01/2021',
            severity: 'Modérée',
            symptoms: 'Éternuements, nez qui coule',
            medications: 'Antihistaminiques',
            comments: 'Allergie saisonnière',
        },
        {
            name: 'Pénicilline',
            beginDate: '01/01/2020',
            severity: 'Sévère',
            symptoms: 'Urticaire, œdème de Quincke',
            medications: 'Éviter les pénicillines',
            comments: 'Allergie connue',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newAllergy, setNewAllergy] = useState<Allergy>({
        name: '',
        beginDate: '',
        severity: '',
        symptoms: '',
        medications: '',
        comments: '',
    });

    const handleAddPress = (): void => {
        if (!newAllergy.name || !newAllergy.beginDate || !newAllergy.severity || !newAllergy.symptoms || !newAllergy.medications || !newAllergy.comments) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        setAllergies([...allergies, newAllergy]);
        setNewAllergy({
            name: '',
            beginDate: '',
            severity: '',
            symptoms: '',
            medications: '',
            comments: '',
        });
        setIsModalVisible(false);
    };

    const handleEditPress = (allergyName: string): void => {
        Alert.alert('Modifier l\'allergie', `Cette fonctionnalité n\'est pas encore implémentée pour l'allergie "${allergyName}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.allergyList}>
                {allergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyCard}>
                        <TouchableOpacity onPress={() => handleEditPress(allergy.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color="#ffffff" />
                        </TouchableOpacity>
                        <View style={styles.cardHeader}>
                            <Text style={styles.allergyTitle}>{allergy.name}</Text>
                        </View>
                        <Text style={styles.allergyText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {allergy.beginDate}
                        </Text>
                        <Text style={styles.allergyText}>
                            <Text style={styles.bold}>Gravité: </Text>
                            {allergy.severity}
                        </Text>
                        <Text style={styles.allergyText}>
                            <Text style={styles.bold}>Symptômes: </Text>
                            {allergy.symptoms}
                        </Text>
                        <Text style={styles.allergyText}>
                            <Text style={styles.bold}>Médicaments: </Text>
                            {allergy.medications}
                        </Text>
                        <Text style={styles.allergyText}>
                            <Text style={styles.bold}>Commentaires: </Text>
                            {allergy.comments}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.container}>
                    <Text style={styles.allergyTitle}>Ajouter une allergie</Text>
                    <TextInput
                        placeholder="Nom de l'allergie"
                        value={newAllergy.name}
                        onChangeText={(text) => setNewAllergy({ ...newAllergy, name: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Date de début"
                        value={newAllergy.beginDate}
                        onChangeText={(text) => setNewAllergy({ ...newAllergy, beginDate: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Gravité"
                        value={newAllergy.severity}
                        onChangeText={(text) => setNewAllergy({ ...newAllergy, severity: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Symptômes"
                        value={newAllergy.symptoms}
                        onChangeText={(text) => setNewAllergy({ ...newAllergy, symptoms: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Médicaments"
                        value={newAllergy.medications}
                        onChangeText={(text) => setNewAllergy({ ...newAllergy, medications: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Commentaires"
                        value={newAllergy.comments}
                        onChangeText={(text) => setNewAllergy({ ...newAllergy, comments: text })}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                        <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                            <Text style={styles.buttonText}>Ajouter</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        alignItems: 'center',
    } as ViewStyle,
    allergyList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 20,
    } as ViewStyle,
    allergyCard: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#f5f5f5',
        marginVertical: 8,
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 20,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    } as ViewStyle,
    allergyTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    } as TextStyle,
    editButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
    } as ViewStyle,
    allergyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    } as TextStyle,
    bold: {
        fontWeight: 'bold',
    } as TextStyle,
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    } as ViewStyle,
    button: {
        flex: 1,
        marginHorizontal: 10,
        width: '48%',
    } as ViewStyle,
    gradient: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    } as ViewStyle,
    buttonText: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
    } as TextStyle,
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
    }
});