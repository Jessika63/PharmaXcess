import React, { useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { CustomPicker } from '../../components';

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

// The Allergies component allows users to view, add, and manage their allergies, including details such as severity, symptoms, medications, and comments.
export default function Allergies({ navigation }: AllergiesProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

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

    const [selectedBeginYear, setSelectedBeginYear] = useState<number>(2024);
    const [selectedBeginMonth, setSelectedBeginMonth] = useState<number>(1);
    const [selectedBeginDay, setSelectedBeginDay] = useState<number>(1);

    const handleAddPress = (): void => {
        if (
            !newAllergy.name ||
            !newAllergy.severity ||
            !newAllergy.symptoms ||
            !newAllergy.medications ||
            !newAllergy.comments
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newAllergyData: Allergy = {
            ...newAllergy,
            beginDate: `${selectedBeginDay.toString().padStart(2, '0')}/${selectedBeginMonth.toString().padStart(2, '0')}/${selectedBeginYear}`,
        };

        setAllergies([...allergies, newAllergyData]);
        setNewAllergy({
            name: '',
            beginDate: '',
            severity: '',
            symptoms: '',
            medications: '',
            comments: '',
        });
        setSelectedBeginYear(2024);
        setSelectedBeginMonth(1);
        setSelectedBeginDay(1);
        setIsModalVisible(false);
    };

    const handleEditPress = (allergyName: string): void => {
        Alert.alert('Modifier l\'allergie', `Cette fonctionnalité n\'est pas encore implémentée pour l'allergie "${allergyName}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {allergies.map((allergy, index) => (
                    <View key={index} style={styles.card}>
                        <TouchableOpacity onPress={() => handleEditPress(allergy.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                        </TouchableOpacity>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{allergy.name}</Text>
                        </View>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {allergy.beginDate}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Gravité: </Text>
                            {allergy.severity}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Symptômes: </Text>
                            {allergy.symptoms}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Médicaments: </Text>
                            {allergy.medications}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Commentaires: </Text>
                            {allergy.comments}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={isModalVisible} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalContainer} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior='automatic'>
                        <Text style={styles.modalTitle}>Ajouter une allergie</Text>
                        <TextInput
                            placeholder="Nom de l'allergie"
                            value={newAllergy.name}
                            onChangeText={(text) => setNewAllergy({ ...newAllergy, name: text })}
                            style={styles.input}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={selectedBeginDay}
                                    onValueChange={(value) => setSelectedBeginDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}>
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={selectedBeginMonth}
                                    onValueChange={(value) => setSelectedBeginMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <CustomPicker
                                    label="Année"
                                    selectedValue={selectedBeginYear}
                                    onValueChange={(value) => setSelectedBeginYear(Number(value))}
                                    options={Array.from({ length: 10 }, (_, i) => ({ 
                                        label: (2024 + i).toString(), 
                                        value: 2024 + i 
                                    }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>
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
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Ajouter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.button}>
                                <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                </ScrollView>
            </Modal>
        </View>
    );
}
