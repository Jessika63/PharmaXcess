import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Allergies({ navigation }) {
    const allergies = [
        {
            name: 'Pollen',
            beginDate: '01/01/2021',
            severity: 'Modérée',
            symptoms: 'Éternuements, nez qui coule',
            medications: 'Antihistaminiques',
            comments: 'Allergie saisonnière'
        },
        {
            name: 'Pénicilline',
            beginDate: '01/01/2020',
            severity: 'Sévère',
            symptoms: 'Urticaire, œdème de Quincke',
            medications: 'Éviter les pénicillines',
            comments: 'Allergie connue'
        },
        {
            name: 'Arachides',
            beginDate: '01/01/2019',
            severity: 'Sévère',
            symptoms: 'Choc anaphylactique',
            medications: 'Éviter les arachides',
            comments: 'Allergie connue'
        },
        {
            name: 'Acariens',
            beginDate: '01/01/2018',
            severity: 'Modérée',
            symptoms: 'Éternuements',
            medications: 'Antihistaminiques',
            comments: 'Allergie saisonnière'
        },
    ];

    const handleAddPress = () => {
        Alert.alert('Ajouter une allergie', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    const handleEditPress = (allergyName) => {
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
            <TouchableOpacity style={styles.button} onPress={handleAddPress}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        alignItems: 'center',
    },
    allergyList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 20
    },
    allergyCard: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#f5f5f5',
        marginVertical: 8,
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 20
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    allergyTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold'
    },
    editButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
    },
    allergyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10
    },
    bold: {
        fontWeight: 'bold'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        width: '48%'
    },
    gradient: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 5
    },
    buttonText: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});