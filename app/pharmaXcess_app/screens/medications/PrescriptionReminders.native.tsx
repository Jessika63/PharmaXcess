import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/Reminders.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { CustomPicker } from '../../components';

type Reminder = {
    id: string;
    name: string;
    date: string;
    sound: string;
};

type Props = {
    navigation: StackNavigationProp<any, any>;
};

// The PrescriptionReminders component allows users to manage their prescription reminders, including adding new reminders with specific dates and sounds.
export default function PrescriptionReminders({ navigation }: Props): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [reminders, setReminders] = useState<Reminder[]>([
        {
            id: '1',
            name: 'Ordonnance 1',
            date: '01/10/2023',
            sound: 'Son 1',
        },
        {
            id: '2',
            name: 'Ordonnance 2',
            date: '02/10/2023',
            sound: 'Son 2',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newReminder, setNewReminder] = useState<Reminder>({
        id: '',
        name: '',
        date: '',
        sound: '',
    });

    const [selectedYear, setSelectedYear] = useState<number>(2024);
    const [selectedMonth, setSelectedMonth] = useState<number>(1);
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedSound, setSelectedSound] = useState<string>('Son 1');

    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];

    const handleAddReminder = () => {
        if (!newReminder.name) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newReminderData: Reminder = {
            id: Math.random().toString(),
            name: newReminder.name,
            date: `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`,
            sound: selectedSound,
        };

        setReminders([...reminders, newReminderData]);
        setNewReminder({
            id: '',
            name: '',
            date: '',
            sound: '',
        });
        setSelectedYear(2024);
        setSelectedMonth(1);
        setSelectedDay(1);
        setSelectedSound('Son 1');
        setIsModalVisible(false);
    };

    const handleEditPress = (name: string): void => {
        Alert.alert('Modifier le rappel', `Cette fonctionnalité n'est pas encore implémentée pour ${name}.`);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.alarmCard}>
                        <Text style={styles.alarmName}>Ordonnance: {item.name}</Text>
                        <TouchableOpacity onPress={() => handleEditPress(item.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.alarmText}>Date: {item.date}</Text>
                        <Text style={styles.alarmText}>Son: {item.sound}</Text>
                    </View>
                )}
            />

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
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <Text style={styles.modalTitle}>Ajouter un rappel</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom de l'ordonnance"
                            value={newReminder.name}
                            onChangeText={(text) => setNewReminder({ ...newReminder, name: text })}
                        />
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
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
                        
                        <CustomPicker
                            label="Son"
                            selectedValue={selectedSound}
                            onValueChange={(value) => {
                                console.log('Son sélectionné:', value);
                                setSelectedSound(String(value));
                            }}
                            options={sounds.map(sound => ({ label: sound, value: sound }))}
                            placeholder="Choisir un son"
                        />
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleAddReminder}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Enregistrer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(false)}>
                                <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
