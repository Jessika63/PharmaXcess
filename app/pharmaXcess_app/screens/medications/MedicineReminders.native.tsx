import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput } from 'react-native-gesture-handler';
import createStyles from '../../styles/Reminders.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { TimePicker, CustomPicker } from '../../components';

type Alarm = {
    id: string;
    medicineName: string;
    time: string;
    days: string[];
    sound: string;
};

type MedicineRemindersProps = {
    navigation: StackNavigationProp<any, any>;
};

// MedicineReminders component allows users to manage their medication reminders, including adding, editing, and viewing reminders for medications.
export default function MedicineReminders({ navigation }: MedicineRemindersProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [alarms, setAlarms] = useState<Alarm[]>([
        {
            id: '1',
            medicineName: 'Paracétamol',
            time: '08:00',
            days: ['Lundi', 'Mercredi', 'Vendredi'],
            sound: 'Son 1',
        },
        {
            id: '2',
            medicineName: 'Ibuprofène',
            time: '12:00',
            days: ['Mardi', 'Jeudi'],
            sound: 'Son 2',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newAlarm, setNewAlarm] = useState<Alarm>({
        id: '',
        medicineName: '',
        time: '',
        days: [],
        sound: '',
    });

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedSound, setSelectedSound] = useState<string>('Son 1');
    const [selectedHour, setSelectedHour] = useState<number>(8);
    const [selectedMinute, setSelectedMinute] = useState<number>(0);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];

    const handleAddAlarm = () => {
        if (!newAlarm.medicineName || selectedDays.length === 0) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newAlarmData: Alarm = {
            id: Math.random().toString(),
            medicineName: newAlarm.medicineName,
            time: `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`,
            days: selectedDays,
            sound: selectedSound,
        };

        setAlarms([...alarms, newAlarmData]);
        setNewAlarm({
            id: '',
            medicineName: '',
            time: '',
            days: [],
            sound: '',
        });
        setSelectedDays([]);
        setSelectedHour(8);
        setSelectedMinute(0);
        setSelectedSound('Son 1');
        setIsModalVisible(false);
    };

    const handleEditPress = (name: string): void => {
         Alert.alert('Modifier le rappel', `Cette fonctionnalité n'est pas encore implémentée pour ${name}.`);
    };

    const toggleDaySelection = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.alarmCard}>
                        <Text style={styles.alarmName}>Médicament: {item.medicineName}</Text>
                        <TouchableOpacity onPress={() => handleEditPress(item.medicineName)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.alarmText}>Heure: {item.time}</Text>
                        <Text style={styles.alarmText}>Jours: {item.days.join(', ')}</Text>
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
                            placeholder="Nom du médicament"
                            value={newAlarm.medicineName}
                            onChangeText={(text) => setNewAlarm({ ...newAlarm, medicineName: text })}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 50 }}>
                            <View style={{ width: '45%' }}>
                                <CustomPicker
                                    label="Heures"
                                    selectedValue={selectedHour}
                                    onValueChange={(value) => setSelectedHour(Number(value))}
                                    options={Array.from({ length: 24 }, (_, i) => ({ 
                                        label: i.toString().padStart(2, '0'), 
                                        value: i 
                                    }))}
                                    placeholder="00"
                                />
                            </View>
                            <View style={{ width: '45%' }}>
                                <CustomPicker
                                    label="Minutes"
                                    selectedValue={selectedMinute}
                                    onValueChange={(value) => setSelectedMinute(Number(value))}
                                    options={Array.from({ length: 60 }, (_, i) => ({ 
                                        label: i.toString().padStart(2, '0'), 
                                        value: i 
                                    }))}
                                    placeholder="00"
                                />
                            </View>
                        </View>
                        
                        <Text style={styles.label}>Jours</Text>
                        {daysOfWeek.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.input,
                                    selectedDays.includes(day) && styles.selectedDay,
                                ]}
                                onPress={() => toggleDaySelection(day)}
                            >
                                <Text style={styles.dayText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                        
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
                            <TouchableOpacity style={styles.button} onPress={handleAddAlarm}>
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
