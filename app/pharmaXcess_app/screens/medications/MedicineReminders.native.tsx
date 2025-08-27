import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput } from 'react-native-gesture-handler';
import createStyles from '../../styles/Reminders.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';
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
    const { currentProfile } = useProfile();
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

    // For profile-based alarm management (simulated)
    const [profileAlarmsData, setProfileAlarmsData] = useState<string[]>([]);

    // Simple alarm management by profile (simulated functions)
    const handleAddAlarmToProfile = async (alarmData: string): Promise<boolean> => {
        // Simulate adding alarm to profile
        if (!profileAlarmsData.includes(alarmData)) {
            setProfileAlarmsData([...profileAlarmsData, alarmData]);
            return true;
        }
        return false;
    };

    const handleRemoveAlarmFromProfile = async (alarm: string): Promise<boolean> => {
        // Simulate removing alarm from profile
        setProfileAlarmsData(profileAlarmsData.filter(a => a !== alarm));
        return true;
    };

    const getRelationshipText = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'Mon profil';
            case 'child': return 'Profil enfant';
            case 'parent': return 'Profil parent';
            case 'spouse': return 'Profil conjoint(e)';
            case 'other': return 'Autre profil';
            default: return 'Mon profil';
        }
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Rappels de médicaments',
        });
    }, [navigation]);

    // Determine if it's the main profile 
    const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

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

    // Get the alarms to display based on profile
    const getCurrentAlarms = () => {
        if (isMainProfile) {
            return alarms;
        } else {
            // Parse profile-specific alarms from JSON strings
            return profileAlarmsData.map(alarmStr => {
                try {
                    const parsedAlarm = JSON.parse(alarmStr);
                    // Recalculate nextAlarm since Date objects don't serialize properly
                    return {
                        ...parsedAlarm,
                        nextAlarm: calculateNextAlarm(parsedAlarm)
                    };
                } catch {
                    return null;
                }
            }).filter(Boolean);
        }
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

    const handleRemoveAlarm = async (id: string, medicineName: string) => {
        if (isMainProfile) {
            // For main profile: use existing delete function
            deleteAlarm(id, medicineName);
        } else {
            // For other profiles: remove from profile data
            Alert.alert(
                'Supprimer l\'alarme',
                `Êtes-vous sûr de vouloir supprimer l'alarme pour ${medicineName} ?`,
                [
                    { text: 'Annuler', style: 'cancel' },
                    { 
                        text: 'Supprimer', 
                        style: 'destructive',
                        onPress: async () => {
                            const currentAlarms = getCurrentAlarms();
                            const alarmIndex = currentAlarms.findIndex(alarm => alarm.id === id);
                            if (alarmIndex !== -1) {
                                const alarmToRemove = profileAlarmsData[alarmIndex];
                                await handleRemoveAlarmFromProfile(alarmToRemove);
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleAddAlarm = async () => {
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
            isActive: editingAlarm ? editingAlarm.isActive : true,
        };
        
        alarmData.nextAlarm = calculateNextAlarm(alarmData);

        if (isMainProfile) {
            // For main profile: use existing logic
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
        } else {
            // For other profiles: add to profile data
            if (editingAlarm) {
                // Edit existing alarm in profile data
                const currentAlarms = getCurrentAlarms();
                const alarmIndex = currentAlarms.findIndex(alarm => alarm.id === editingAlarm.id);
                if (alarmIndex !== -1) {
                    const updatedProfileAlarms = [...profileAlarmsData];
                    updatedProfileAlarms[alarmIndex] = JSON.stringify(alarmData);
                    setProfileAlarmsData(updatedProfileAlarms);
                    Alert.alert('Succès', 'Alarme modifiée avec succès.');
                } else {
                    Alert.alert('Erreur', 'Alarme introuvable.');
                }
            } else {
                // Add new alarm to profile
                const success = await handleAddAlarmToProfile(JSON.stringify(alarmData));
                if (success) {
                    Alert.alert('Succès', 'Alarme ajoutée avec succès.');
                } else {
                    Alert.alert('Erreur', 'Cette alarme est déjà enregistrée ou une erreur est survenue.');
                }
            }
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
    const formatNextAlarm = (nextAlarm?: Date | string): string => {
        if (!nextAlarm) return 'Désactivé';
        
        // Convert string to Date if necessary
        const alarmDate = typeof nextAlarm === 'string' ? new Date(nextAlarm) : nextAlarm;
        
        // Check if the date is valid
        if (isNaN(alarmDate.getTime())) return 'Désactivé';
        
        const now = new Date();
        const diffMs = alarmDate.getTime() - now.getTime();
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

    const currentAlarms = getCurrentAlarms();

    return (
        <View style={styles.container}>
            <FlatList
                data={currentAlarms}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                    <>
                        {/* Header for current profile */}
                        {currentProfile && (
                            <View style={[styles.alarmCard, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={[styles.alarmMedicine, { color: colors.primary, fontWeight: 'bold' }]}>
                                            {getRelationshipText(currentProfile.relationship)}
                                        </Text>
                                        <Text style={[styles.alarmDays, { color: colors.primary, opacity: 0.8 }]}>
                                            {currentProfile.name}
                                        </Text>
                                    </View>
                                    <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                                </View>
                            </View>
                        )}
                        
                        {/* Empty state message for secondary profiles */}
                        {!isMainProfile && currentAlarms.length === 0 && (
                            <View style={styles.alarmCard}>
                                <Text style={[styles.alarmDays, { textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }]}>
                                    Aucune alarme ajoutée pour ce profil
                                </Text>
                            </View>
                        )}
                    </>
                )}
                ListFooterComponent={() => (
                    <View style={{ paddingTop: 20, paddingBottom: 20 }}>
                        <TouchableOpacity style={styles.addAlarmButton} onPress={() => setIsModalVisible(true)}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Ionicons name="add" size={28} color={colors.iconPrimary} />
                                <Text style={styles.buttonText}>Nouvelle alarme</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
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
                                    onValueChange={() => {
                                        if (isMainProfile) {
                                            toggleAlarm(item.id);
                                        }
                                    }}
                                    thumbColor={item.isActive ? colors.primary : colors.inputBorder}
                                    trackColor={{ false: colors.inputBorder, true: colors.secondary }}
                                    disabled={!isMainProfile}
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
                                onPress={() => handleRemoveAlarm(item.id, item.medicineName)} 
                                style={styles.deleteIconButton}
                            >
                                <Ionicons name="trash-outline" size={24} color="#FF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ padding: 20 }}
            />

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
