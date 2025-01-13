import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Treatments({ navigation }) {
    const [expanded, setExpanded] = useState(null);

    const treatments = [
        {
            name: 'Metformine',
            beginDate: '01/01/2021',
            endDate: '01/01/2022',
            dosage: '1 comprimé par jour',
            duration: '1 an',
            sideEffects: 'nausées, vomissements, diarrhée',
            disease: 'Diabète de type 2',
        },
        {
            name: 'Lévothyrox',
            beginDate: '01/01/2020',
            endDate: '01/01/2022',
            dosage: '1 comprimé par jour',
            duration: '2 ans',
            sideEffects: 'palpitations, tremblements, maux de tête',
            disease: 'Hypothyroïdie',
        },
        {
            name: 'Sertraline',
            beginDate: '01/01/2021',
            endDate: '01/01/2022',
            dosage: '1 comprimé par jour',
            duration: '1 an',
            sideEffects: 'insomnie, somnolence, maux de tête',
            disease: 'Dépression',
        },
        {
            name: 'Atorvastatine',
            beginDate: '01/01/2020',
            endDate: '01/01/2022',
            dosage: '1 comprimé par jour',
            duration: '2 ans',
            sideEffects: 'douleurs musculaires, fatigue, maux de tête',
            disease: 'Hypercholestérolémie',
        },
    ];

    const handleAddPress = () => {
        Alert.alert('Ajouter un traitement', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    const handleEditPress = (treatmentName) => {
        Alert.alert('Modifier le traitement', `Cette fonctionnalité n\'est pas encore implémentée pour le traitement "${treatmentName}".`);
    };

    return(
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.treatmentList}>
                {treatments.map((treatment, index) => (
                    <View key={index} style={styles.treatmentCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.treatmentTitle}>{treatment.name}</Text>
                            <TouchableOpacity onPress={() => handleEditPress(treatment.name)} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color="#ffffff" />                                
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {treatment.beginDate}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Date de fin: </Text>
                            {treatment.endDate}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Dosage: </Text>
                            {treatment.dosage}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Durée: </Text>
                            {treatment.duration}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Effets secondaires: </Text>
                            {treatment.sideEffects}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Maladie: </Text>
                            {treatment.disease}
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
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    treatmentList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    treatmentCard: {
        width: '100%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    },
    gradient: {
        padding: 15,
        borderRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    treatmentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#F57196',
        padding: 5,
        borderRadius: 50,
    },
    editIcon: {
        fontSize: 20,
        color: 'white',
    },
    treatmentText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
        marginTop: 5,
    },
    bold: {
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
});