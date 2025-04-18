import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type FamilyHistoryItem = {
    name: string;
    familyMember: string;
    age: number;
    severity: string;
    treatment: string;
};

type FamilyHistoryProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function FamilyHistory({ navigation }: FamilyHistoryProps) : JSX.Element {
    const familyHistory: FamilyHistoryItem[] = [
        {
            name: 'Diabète de type 2',
            familyMember: 'Père',
            age: 65,
            severity: 'Modéré',
            treatment: 'Insuline, régime alimentaire',
        },
        {
            name: 'Hypertension artérielle',
            familyMember: 'Mère',
            age: 60,
            severity: 'Sévère',
            treatment: 'Bêtabloquants, régime alimentaire',
        },
        {
            name: 'Asthme',
            familyMember: 'Frère',
            age: 30,
            severity: 'Modéré',
            treatment: 'Inhalateur, corticostéroïdes',
        },
    ];

    const handleAddPress = (): void => {
        Alert.alert('Ajouter un antécédent familial', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    const handleModifyPress = (): void => {
        Alert.alert('Modifier un antécédent familial', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.familyList}>
                {familyHistory.map((item, index) => (
                    <View key={index} style={styles.familyCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.familyTitle}>{item.name}</Text>
                            <TouchableOpacity onPress={() => handleModifyPress()} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.familyText}>
                            <Text style={styles.bold}>Membre de la famille: </Text>
                            {item.familyMember}
                        </Text>
                        <Text style={styles.familyText}>
                            <Text style={styles.bold}>Âge: </Text>
                            {item.age}
                        </Text>
                        <Text style={styles.familyText}>
                            <Text style={styles.bold}>Sévérité: </Text>
                            {item.severity}
                        </Text>
                        <Text style={styles.familyText}>
                            <Text style={styles.bold}>Traitement: </Text>
                            {item.treatment}
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
    } as ViewStyle,
    familyList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 20,
    } as ViewStyle,
    familyCard: {
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
    familyTitle: {
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
    familyText: {
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
});