import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';

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
    const styles = createStyles(colors);

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
    const [newFamilyHistory, setNewFamilyHistory] = useState<FamilyHistoryItem>({
        name: '',
        familyMember: '',
        severity: '',
        treatment: '',
    });

    const handleAddPress = (): void => {
        if (!newFamilyHistory.name || !newFamilyHistory.familyMember || !newFamilyHistory.severity || !newFamilyHistory.treatment) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        setFamilyHistory([...familyHistory, newFamilyHistory]);
        setNewFamilyHistory({
            name: '',
            familyMember: '',
            severity: '',
            treatment: '',
        });
        setIsModalVisible(false);
    };

    const handleModifyPress = (): void => {
        Alert.alert('Modifier un antécédent familial', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {familyHistory.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <TouchableOpacity onPress={() => handleModifyPress()} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                            </TouchableOpacity>
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
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Ajouter un antécédent familial</Text>
                    <TextInput
                        placeholder="Nom de la maladie"
                        value={newFamilyHistory.name}
                        onChangeText={(text) => setNewFamilyHistory({ ...newFamilyHistory, name: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Membre de la famille"
                        value={newFamilyHistory.familyMember}
                        onChangeText={(text) => setNewFamilyHistory({ ...newFamilyHistory, familyMember: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Sévérité"
                        value={newFamilyHistory.severity}
                        onChangeText={(text) => setNewFamilyHistory({ ...newFamilyHistory, severity: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Traitement"
                        value={newFamilyHistory.treatment}
                        onChangeText={(text) => setNewFamilyHistory({ ...newFamilyHistory, treatment: text })}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                            <Text style={styles.buttonText}>Confirmer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}