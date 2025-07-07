import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { CustomPicker } from '../../components';

type FamilyHistoryItem = {
    name: string;
    familyMember: string;
    severity: string;
    treatment: string;
};

type FamilyHistoryProps = {
    navigation: StackNavigationProp<any, any>;
};

// The FamilyHistory component allows users to view, add, and modify family medical history items.
export default function FamilyHistory({ navigation }: FamilyHistoryProps) : React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const familyMembers = ['Père', 'Mère', 'Frère', 'Sœur', 'Grand-père paternel', 'Grand-mère paternelle', 'Grand-père maternel', 'Grand-mère maternelle', 'Oncle', 'Tante', 'Cousin(e)', 'Autre'];
    const severityLevels = ['Léger', 'Modéré', 'Sévère', 'Critique'];

    const [familyHistory, setFamilyHistory] = useState<FamilyHistoryItem[]>([
        {
            name: 'Diabète de type 2',
            familyMember: 'Père',
            severity: 'Modéré',
            treatment: 'Insuline, régime alimentaire',
        },
        {
            name: 'Hypertension artérielle',
            familyMember: 'Mère',
            severity: 'Sévère',
            treatment: 'Bêtabloquants, régime alimentaire',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newFamilyHistory, setNewFamilyHistory] = useState<FamilyHistoryItem>({
        name: '',
        familyMember: '',
        severity: '',
        treatment: '',
    });
    const [editedFamilyHistory, setEditedFamilyHistory] = useState<FamilyHistoryItem>({
        name: '',
        familyMember: '',
        severity: '',
        treatment: '',
    });

    const handleAddPress = (): void => {
        if (!newFamilyHistory.name || !newFamilyHistory.treatment) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const finalFamilyHistory = {
            ...newFamilyHistory,
            familyMember: newFamilyHistory.familyMember || familyMembers[0],
            severity: newFamilyHistory.severity || severityLevels[0]
        };

        setFamilyHistory([...familyHistory, finalFamilyHistory]);
        setNewFamilyHistory({
            name: '',
            familyMember: '',
            severity: '',
            treatment: '',
        });
        setIsModalVisible(false);
    };

    const handleEditPress = (index: number): void => {
        const item = familyHistory[index];
        setEditedFamilyHistory({ ...item });
        setEditingIndex(index);
        setEditModalVisible(true);
    };

    const handleSaveEdit = (): void => {
        if (!editedFamilyHistory.name || !editedFamilyHistory.treatment) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (editingIndex !== null) {
            const updatedFamilyHistory = [...familyHistory];
            updatedFamilyHistory[editingIndex] = editedFamilyHistory;
            setFamilyHistory(updatedFamilyHistory);
        }

        setEditModalVisible(false);
        setEditingIndex(null);
        Alert.alert('Succès', 'Les informations de l\'antécédent familial ont été mises à jour.');
    };

    const handleDeleteFamilyHistory = (index: number): void => {
        const item = familyHistory[index];
        Alert.alert(
            'Supprimer l\'antécédent familial',
            `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        const updatedFamilyHistory = familyHistory.filter((_, i) => i !== index);
                        setFamilyHistory(updatedFamilyHistory);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {familyHistory.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => handleEditPress(index)} style={styles.editButton}>
                                    <Ionicons name="create-outline" size={25} color={colors.iconPrimary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteFamilyHistory(index)} style={styles.deleteButton}>
                                    <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Membre de la famille: </Text>
                            {item.familyMember}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Sévérité: </Text>
                            {item.severity}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Traitement: </Text>
                            {item.treatment}
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

            <Modal animationType="slide" visible={isModalVisible}>
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <Text style={styles.modalTitle}>Ajouter un antécédent familial</Text>
                    
                    <TextInput
                        placeholder="Nom de la maladie"
                        value={newFamilyHistory.name}
                        onChangeText={(text) => setNewFamilyHistory({ ...newFamilyHistory, name: text })}
                        style={styles.input}
                    />
                    
                    <CustomPicker
                        label="Membre de la famille"
                        selectedValue={newFamilyHistory.familyMember || familyMembers[0]}
                        onValueChange={(value) => setNewFamilyHistory({ ...newFamilyHistory, familyMember: String(value) })}
                        options={familyMembers.map(member => ({ 
                            label: member, 
                            value: member 
                        }))}
                        placeholder="Sélectionner un membre"
                    />
                    
                    <CustomPicker
                        label="Sévérité"
                        selectedValue={newFamilyHistory.severity || severityLevels[0]}
                        onValueChange={(value) => setNewFamilyHistory({ ...newFamilyHistory, severity: String(value) })}
                        options={severityLevels.map(level => ({ 
                            label: level, 
                            value: level 
                        }))}
                        placeholder="Sélectionner la sévérité"
                    />
                    
                    <TextInput
                        placeholder="Traitement"
                        value={newFamilyHistory.treatment}
                        onChangeText={(text) => setNewFamilyHistory({ ...newFamilyHistory, treatment: text })}
                        style={styles.input}
                    />
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Ajouter</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setIsModalVisible(false);
                            setNewFamilyHistory({
                                name: '',
                                familyMember: '',
                                severity: '',
                                treatment: '',
                            });
                        }} style={styles.button}>
                            <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                <Text style={styles.buttonText}>Annuler</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>

            <Modal visible={isEditModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <Text style={styles.modalTitle}>Modifier l'antécédent familial</Text>
                    
                    <TextInput
                        placeholder="Nom de la maladie"
                        value={editedFamilyHistory.name}
                        onChangeText={(text) => setEditedFamilyHistory({ ...editedFamilyHistory, name: text })}
                        style={styles.input}
                    />
                    
                    <CustomPicker
                        label="Membre de la famille"
                        selectedValue={editedFamilyHistory.familyMember}
                        onValueChange={(value) => setEditedFamilyHistory({ ...editedFamilyHistory, familyMember: String(value) })}
                        options={familyMembers.map(member => ({ 
                            label: member, 
                            value: member 
                        }))}
                        placeholder="Sélectionner un membre"
                    />
                    
                    <CustomPicker
                        label="Sévérité"
                        selectedValue={editedFamilyHistory.severity}
                        onValueChange={(value) => setEditedFamilyHistory({ ...editedFamilyHistory, severity: String(value) })}
                        options={severityLevels.map(level => ({ 
                            label: level, 
                            value: level 
                        }))}
                        placeholder="Sélectionner la sévérité"
                    />
                    
                    <TextInput
                        placeholder="Traitement"
                        value={editedFamilyHistory.treatment}
                        onChangeText={(text) => setEditedFamilyHistory({ ...editedFamilyHistory, treatment: text })}
                        style={styles.input}
                    />
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleSaveEdit} style={styles.button}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Sauvegarder</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setEditModalVisible(false);
                            setEditingIndex(null);
                            setEditedFamilyHistory({
                                name: '',
                                familyMember: '',
                                severity: '',
                                treatment: '',
                            });
                        }} style={styles.button}>
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