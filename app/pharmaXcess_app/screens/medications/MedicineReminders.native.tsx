import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, Switch } from 'react-native';
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
    isActive: boolean;
    dosage: string;
    nextAlarm?: Date;
};

type MedicineRemindersProps = {
    navigation: StackNavigationProp<any, any>;
};

// MedicineReminders component - A complete alarm system for medication reminders with enable/disable functionality, next alarm calculation, and alarm-like interface.
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
            isActive: true,
            dosage: '500mg',
        },
        {
            id: '2',
            medicineName: 'Ibuprofène',
            time: '12:00',
            days: ['Mardi', 'Jeudi'],
            sound: 'Son 2',
            isActive: false,
            dosage: '200mg',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
    const [newAlarm, setNewAlarm] = useState<Alarm>({
        id: '',
        medicineName: '',
        time: '',
        days: [],
        sound: '',
        isActive: true,
        dosage: '',
    });

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedSound, setSelectedSound] = useState<string>('Son 1');
    const [selectedHour, setSelectedHour] = useState<number>(8);
    const [selectedMinute, setSelectedMinute] = useState<number>(0);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];

    // Calculate next alarm time for a given alarm
    const calculateNextAlarm = (alarm: Alarm): Date | undefined => {
        if (!alarm.isActive || alarm.days.length === 0) return undefined;
        
        const now = new Date();
        const [hours, minutes] = alarm.time.split(':').map(Number);
        
        // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
        const dayMap: { [key: string]: number } = {
            'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 
            'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
        };
        
        const alarmDays = alarm.days.map(day => dayMap[day]).sort();
        
        // Find the next alarm occurrence
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(now.getDate() + i);
            checkDate.setHours(hours, minutes, 0, 0);
            
            const dayOfWeek = checkDate.getDay();
            if (alarmDays.includes(dayOfWeek)) {
                if (i === 0 && checkDate <= now) {
                    continue; // Skip if time has already passed today
                }
                return checkDate;
            }
        }
        return undefined;
    };

    // Update next alarm times when alarms change
    useEffect(() => {
        setAlarms(prevAlarms => 
            prevAlarms.map(alarm => ({
                ...alarm,
                nextAlarm: calculateNextAlarm(alarm)
            }))
        );
    }, [alarms.length]);

    // Toggle alarm active state
    const toggleAlarm = (id: string) => {
        setAlarms(prevAlarms => 
            prevAlarms.map(alarm => 
                alarm.id === id 
                    ? { 
                        ...alarm, 
                        isActive: !alarm.isActive,
                        nextAlarm: calculateNextAlarm({ ...alarm, isActive: !alarm.isActive })
                      }
                    : alarm
            )
        );
    };

    // Delete alarm with confirmation
    const deleteAlarm = (id: string, medicineName: string) => {
        Alert.alert(
            'Supprimer l\'alarme',
            `Êtes-vous sûr de vouloir supprimer l'alarme pour ${medicineName} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        setAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== id));
                    }
                }
            ]
        );
    };

    const handleAddAlarm = () => {
        if (!newAlarm.medicineName || !newAlarm.dosage || selectedDays.length === 0) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const alarmData: Alarm = {
            id: editingAlarm ? editingAlarm.id : Math.random().toString(),
            medicineName: newAlarm.medicineName,
            dosage: newAlarm.dosage,
            time: `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`,
            days: selectedDays,
            sound: selectedSound,
            isActive: true,
        };
        
        alarmData.nextAlarm = calculateNextAlarm(alarmData);

        if (editingAlarm) {
            // Edit existing alarm
            setAlarms(prevAlarms => 
                prevAlarms.map(alarm => 
                    alarm.id === editingAlarm.id ? alarmData : alarm
                )
            );
        } else {
            // Add new alarm
            setAlarms(prevAlarms => [...prevAlarms, alarmData]);
        }

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setNewAlarm({
            id: '',
            medicineName: '',
            time: '',
            days: [],
            sound: '',
            isActive: true,
            dosage: '',
        });
        setSelectedDays([]);
        setSelectedHour(8);
        setSelectedMinute(0);
        setSelectedSound('Son 1');
        setEditingAlarm(null);
        setIsModalVisible(false);
    };

    const handleEditAlarm = (alarm: Alarm) => {
        setEditingAlarm(alarm);
        setNewAlarm(alarm);
        setSelectedDays(alarm.days);
        setSelectedSound(alarm.sound);
        const [hours, minutes] = alarm.time.split(':').map(Number);
        setSelectedHour(hours);
        setSelectedMinute(minutes);
        setIsModalVisible(true);
    };

    // Format next alarm display
    const formatNextAlarm = (nextAlarm?: Date): string => {
        if (!nextAlarm) return 'Désactivé';
        
        const now = new Date();
        const diffMs = nextAlarm.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `Dans ${diffDays}j ${diffHours}h`;
        } else if (diffHours > 0) {
            return `Dans ${diffHours}h ${diffMinutes}min`;
        } else if (diffMinutes > 0) {
            return `Dans ${diffMinutes}min`;
        } else {
            return 'Maintenant';
        }
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
                    <View style={[styles.alarmCard, !item.isActive && styles.disabledAlarmCard]}>
                        <View style={styles.alarmMainInfo}>
                            <View style={styles.alarmTimeContainer}>
                                <Text style={[styles.alarmTime, !item.isActive && styles.disabledText]}>
                                    {item.time}
                                </Text>
                                <Text style={[styles.alarmNextTime, !item.isActive && styles.disabledText]}>
                                    {formatNextAlarm(item.nextAlarm)}
                                </Text>
                            </View>
                            <View style={styles.alarmSwitchContainer}>
                                <Switch
                                    value={item.isActive}
                                    onValueChange={() => toggleAlarm(item.id)}
                                    thumbColor={item.isActive ? colors.primary : colors.inputBorder}
                                    trackColor={{ false: colors.inputBorder, true: colors.secondary }}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.alarmDetails}>
                            <Text style={[styles.alarmMedicine, !item.isActive && styles.disabledText]}>
                                {item.medicineName} - {item.dosage}
                            </Text>
                            <Text style={[styles.alarmDays, !item.isActive && styles.disabledText]}>
                                {item.days.join(', ')}
                            </Text>
                            <Text style={[styles.alarmSound, !item.isActive && styles.disabledText]}>
                                🔊 {item.sound}
                            </Text>
                        </View>
                        
                        <View style={styles.alarmActions}>
                            <TouchableOpacity 
                                onPress={() => handleEditAlarm(item)} 
                                style={styles.editIconButton}
                            >
                                <Ionicons name="create-outline" size={24} color={colors.iconPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => deleteAlarm(item.id, item.medicineName)} 
                                style={styles.deleteIconButton}
                            >
                                <Ionicons name="trash-outline" size={24} color="#FF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            />
            
            {/* Fixed Add Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.addAlarmButton} onPress={() => setIsModalVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Ionicons name="add" size={28} color={colors.iconPrimary} />
                        <Text style={styles.buttonText}>Nouvelle alarme</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                        <Text style={styles.modalTitle}>
                            {editingAlarm ? 'Modifier l\'alarme' : 'Nouvelle alarme'}
                        </Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Nom du médicament"
                            value={newAlarm.medicineName}
                            onChangeText={(text) => setNewAlarm({ ...newAlarm, medicineName: text })}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Dosage (ex: 500mg, 2 comprimés...)"
                            value={newAlarm.dosage}
                            onChangeText={(text) => setNewAlarm({ ...newAlarm, dosage: text })}
                        />
                        
                        <Text style={styles.label}>Heure de prise</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
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
                        
                        <Text style={styles.label}>Jours de la semaine</Text>
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
