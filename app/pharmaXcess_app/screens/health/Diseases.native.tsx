import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, ViewStyle, TextInput, StyleProp, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { CustomPicker } from '../../components';

type Disease = {
    name : string; 
    description : string;
    symptoms : string;
    beginDate : string;
    medications : string;
    examens : string;
};

type DiseasesProps = {
    navigation: StackNavigationProp<any, any>;
};

// The Diseases component allows users to view, add, and manage their diseases, including details such as symptoms, medications, and examinations.
export default function Diseases({ navigation }: DiseasesProps) : React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [expanded, setExpanded] = useState<number | null>(null);

    const [diseases, setDiseases] = useState<Disease[]>([
        {
            name: 'Diabète',
            description: 'Le diabète est une maladie chronique qui se caractérise par un excès de sucre dans le sang.',
            symptoms: 'soif intense, besoin fréquent d\'uriner, fatigue, perte de poids, vision floue, cicatrisation lente, infections fréquentes, démangeaisons, fourmillements, douleurs, crampes, nausées, vomissements, haleine fruitée, perte de conscience',
            beginDate: '01/01/2000',
            medications: 'insuline, metformine, sulfamide hypoglycémiants, glinides, glitazones, inhibiteurs de l\'alpha-glucosidase, inhibiteurs de la DPP-4, agonistes des récepteurs du GLP-1, inhibiteurs du cotransporteur du sodium-glucose de type 2',
            examens: 'glycémie à jeun, hémoglobine glyquée, test de tolérance au glucose, test de glycémie aléatoire, test de glycémie postprandiale (après un repas)',
        },
        {
            name: 'Hypertension',
            description: 'L\'hypertension artérielle est une maladie chronique caractérisée par une pression artérielle trop élevée dans les artères.',
            symptoms: 'maux de tête, fatigue, étourdissements, bourdonnements d\'oreilles, palpitations, douleurs thoraciques, essoufflement, saignements de nez, vision floue',
            beginDate: '01/01/2005',
            medications: 'diurétiques, bêta-bloquants, inhibiteurs de l\'enzyme de conversion de l\'angiotensine (IECA), antagonistes des récepteurs de l\'angiotensine II (ARA II), inhibiteurs calciques, alpha-bloquants, alpha-bêta-bloquants, vasodilatateurs, antihypertenseurs centraux, antihypertenseurs d\'action directe, antihypertenseurs à action périphérique, antihypertenseurs à action centrale',
            examens: 'mesure de la pression artérielle, électrocardiogramme, échocardiographie, échographie des reins, prise de sang (créatinine, potassium, sodium, cholestérol, glycémie, urée)',
        },
    ]);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [newDisease, setNewDisease] = useState<Disease>({
        name: '',
        description: '',
        symptoms: '',
        beginDate: '',
        medications: '',
        examens: '',
    });

    // Function to toggle the expansion of a disease card
    const toggleCard = (index: number): void => {
        setExpanded(expanded === index ? null : index);
    };

    const [selectedYear, setSelectedYear] = useState<number>(2024);
    const [selectedMonth, setSelectedMonth] = useState<number>(1);
    const [selectedDay, setSelectedDay] = useState<number>(1);

    const handleAddPress = (): void => {
        if (
            !newDisease.name ||
            !newDisease.description ||
            !newDisease.symptoms ||
            !newDisease.medications ||
            !newDisease.examens
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs pour ajouter une nouvelle maladie.');
            return;
        }
    
        const newDiseaseData: Disease = {
            ...newDisease,
            beginDate: `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`,
        };
    
        setDiseases([newDiseaseData, ...diseases]);
        setNewDisease({
            name: '',
            description: '',
            symptoms: '',
            beginDate: '',
            medications: '',
            examens: '',
        });
        setModalVisible(false);
        setSelectedYear(2024);
        setSelectedMonth(1);
        setSelectedDay(1); 
    };

    const handleEditPress = (diseaseName: string): void => {
        Alert.alert('Modifier la maladie', `Cette fonctionnalité n\'est pas encore implémentée pour la maladie "${diseaseName}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {diseases.map((disease, index) => (
                    <TouchableOpacity key={index} onPress={() => toggleCard(index)}>
                        <View style={styles.card}>
                            <TouchableOpacity onPress={() => handleEditPress(disease.name)} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                            </TouchableOpacity>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{disease.name}</Text>
                            </View>
                            <Text style={styles.cardText}>
                                <Text style={styles.bold}>Description: </Text>
                                {expanded === index ? disease.description : `${disease.description.slice(0, 70)}...`}
                            </Text>
                            <Text style={styles.cardText}>
                                <Text style={styles.bold}>Symptômes: </Text>
                                {expanded === index ? disease.symptoms : `${disease.symptoms.slice(0, 75)}...`}
                            </Text>
                            <Text style={styles.cardText}>
                                <Text style={styles.bold}>Date de début: </Text>
                                {expanded === index ? disease.beginDate : `${disease.beginDate.slice(0, 25)}`}
                            </Text>
                            <Text style={styles.cardText}>
                                <Text style={styles.bold}>Traitements: </Text>
                                {expanded === index ? disease.medications : `${disease.medications.slice(0, 75)}...`}
                            </Text>
                            <Text style={styles.cardText}>
                                <Text style={styles.bold}>Examens: </Text>
                                {expanded === index ? disease.examens : `${disease.examens.slice(0, 75)}...`}
                            </Text>
                            <TouchableOpacity onPress={() => toggleCard(index)} style={styles.arrowContainer}>
                                <Ionicons
                                    name={expanded === index ? 'chevron-up-outline' : 'chevron-down-outline'}
                                    size={24}
                                    color={colors.iconPrimary}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
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
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                        <Text style={styles.modalTitle}>Ajouter une maladie</Text>
                        <TextInput
                            placeholder="Nom"
                            value={newDisease.name}
                            onChangeText={(text) => setNewDisease({ ...newDisease, name: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description"
                            value={newDisease.description}
                            onChangeText={(text) => setNewDisease({ ...newDisease, description: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Symptômes"
                            value={newDisease.symptoms}
                            onChangeText={(text) => setNewDisease({ ...newDisease, symptoms: text })}
                            style={styles.input}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={selectedDay}
                                    onValueChange={(value) => setSelectedDay(Number(value))}
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
                                    selectedValue={selectedMonth}
                                    onValueChange={(value) => setSelectedMonth(Number(value))}
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
                                    selectedValue={selectedYear}
                                    onValueChange={(value) => setSelectedYear(Number(value))}
                                    options={Array.from({ length: 10 }, (_, i) => ({ 
                                        label: (2024 + i).toString(), 
                                        value: 2024 + i 
                                    }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>
                        <TextInput
                            placeholder="Traitements"
                            value={newDisease.medications}
                            onChangeText={(text) => setNewDisease({ ...newDisease, medications: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Examens"
                            value={newDisease.examens}
                            onChangeText={(text) => setNewDisease({ ...newDisease, examens: text })}
                            style={styles.input}
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Ajouter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
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
