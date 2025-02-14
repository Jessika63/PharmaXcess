import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PersonalInfo({ navigation}) {
    const [expanded, setExpanded] = useState(null);

    const hospitalizations = [
        {
            name: 'COVID-19',
            beginDate: '01/01/2021',
            endDate: '01/01/2021',
            duration: '1 jour',
            department: 'Réanimation',
            doctor: 'Dr. Dupont',
            hospital: 'Hôpital Saint-Louis',
            medications: 'Doliprane, antibiotiques',
            examens: 'Radiographie des poumons, prise de sang',
            comments: 'Bonne prise en charge mais attente longue aux urgences',
        },
        {
            name: 'Gastro-entérite',
            beginDate: '01/01/2020',
            endDate: '01/01/2020',
            duration: '1 jour',
            department: 'Gastro-entérologie',
            doctor: 'Dr. Martin',
            hospital: 'Hôpital Lariboisière',
            medications: 'Smecta, antibiotiques',
            examens: 'Échographie abdominale, prise de sang',
            comments: 'RAS',
        },
        {
            name: 'Fracture du poignet',
            beginDate: '01/01/2019',
            endDate: '01/01/2019',
            duration: '1 jour',
            department: 'Orthopédie',
            doctor: 'Dr. Lefevre',
            hospital: 'Hôpital Tenon',
            medications: 'Doliprane, anti-inflammatoires',
            examens: 'Radiographie du poignet',
            comments: 'Très bonne expérience avec le personnel soignant'
        },
        {
            name: 'Appendicite',
            beginDate: '01/01/2018',
            endDate: '01/01/2018',
            duration: '1 jour',
            department: 'Chirurgie',
            doctor: 'Dr. Lemoine',
            hospital: 'Hôpital Robert-Debré',
            medications: 'Antibiotiques, antalgiques',
            examens: 'Scanner abdominal, prise de sang',
            comments: 'Très bonne prise en charge',
        }
    ];

    const handleAddPress = () => {
        Alert.alert('Ajouter une hospitalisation', 'Cette fonctionnalité n\'est pas encore implémentée.');
    }

    const handleEditPress = (hospitalizationReason) => {
        Alert.alert('Modifier l\'hospitalisation', `Cette fonctionnalité n\'est pas encore implémentée pour l'hospitalisation "${hospitalizationReason}".`);
    }

    return(
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.hospitalizationList}>
                {hospitalizations.map((hospitalization, index) => (
                    <View key={index} style={styles.hospitalizationCard}>
                        <TouchableOpacity onPress={() => handleEditPress(hospitalization.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color="#ffffff" />                                
                        </TouchableOpacity>
                        <View style={styles.cardHeader}>
                            <Text style={styles.hospitalizationTitle}>{hospitalization.name}</Text>
                        </View>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {hospitalization.beginDate}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Date de fin: </Text>
                            {hospitalization.endDate}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Durée: </Text>
                            {hospitalization.duration}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Service: </Text>
                            {hospitalization.department}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Médecin: </Text>
                            {hospitalization.doctor}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Hôpital: </Text>
                            {hospitalization.hospital}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Médicaments: </Text>
                            {hospitalization.medications}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Examens: </Text>
                            {hospitalization.examens}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Commentaires: </Text>
                            {hospitalization.comments}
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
    hospitalizationList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    hospitalizationCard: {
        width: '100%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    },
    hospitalizationTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    hospitalizationText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    editButton: {
        position: 'absolute',
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
        top: 10,
    },
    editIcon: {
        fontSize: 20,
        color: 'white',
    },
    gradient: {
        padding: 15,
        borderRadius: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
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
});