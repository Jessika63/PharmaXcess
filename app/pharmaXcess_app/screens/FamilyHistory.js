import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FamilyHistory({ navigation }) {

    const familyHistory = [
        {
            name: 'Diabète de type 2',
            familyMember: 'Père',
            age: 60,
            severity: 'Modéré',
            treatments: 'Traitement par Metformine'
        },
        {
            name: 'Cancer du sein',
            familyMember: 'Mère',
            age: 55,
            severity: 'Sévère',
            treatments: 'Chimiothérapie'
        },
        {
            name: 'Hypertension artérielle',
            familyMember: 'Grand-père',
            age: 70,
            severity: 'Modérée',
            treatments: 'Traitement par bêtabloquants'
        },
        {
            name: 'Alzheimer',
            familyMember: 'Grand-mère',
            age: 80,
            severity: 'Sévère',
            treatments: 'Traitement par Aricept'
        },
    ];

    const handleAddPress = () => {
        Alert.alert('Ajouter un antécédent familial', 'Cette fonctionnalité n\'est pas encore implémentée.');
    }

    const handleEditPress = (diseaseName) => {
        Alert.alert('Modifier l\'antécédent familial', `Cette fonctionnalité n\'est pas encore implémentée pour l'antécédent familial "${diseaseName}".`);
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.familyHistoryList}>
                {familyHistory.map((disease, index) => (
                    <View key={index} style={styles.familyHistoryCard}>
                        <TouchableOpacity onPress={() => handleEditPress(disease.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color="#ffffff" />
                        </TouchableOpacity>
                        <View style={styles.cardHeader}>
                            <Text style={styles.familyHistoryTitle}>{disease.name}</Text>
                        </View>
                        <Text style={styles.familyHistoryText}>
                            <Text style={styles.bold}>Membre de la famille: </Text>
                            {disease.familyMember}
                        </Text>
                        <Text style={styles.familyHistoryText}>
                            <Text style={styles.bold}>Âge: </Text>
                            {disease.age} ans
                        </Text>
                        <Text style={styles.familyHistoryText}>
                            <Text style={styles.bold}>Sévérité: </Text>
                            {disease.severity}
                        </Text>
                        <Text style={styles.familyHistoryText}>
                            <Text style={styles.bold}>Traitements: </Text>
                            {disease.treatments}
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
        backgroundColor: '#ffffff',
    },
    familyHistoryList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    familyHistoryCard: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 20,
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    familyHistoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    familyHistoryText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    arrowContainer: {
        alignItems: 'flex-end',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
        padding: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        marginBottom: 20,
        borderRadius: 10,
    },
    gradient: {
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});