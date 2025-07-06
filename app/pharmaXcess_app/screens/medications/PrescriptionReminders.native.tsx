import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, TextInput, Switch } from 'react-native';
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
    isCompleted: boolean;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
};

type Props = {
    navigation: StackNavigationProp<any, any>;
};

// The PrescriptionReminders component provides an agenda-like system for managing prescription renewal reminders with calendar integration, priority levels, and completion tracking.
export default function PrescriptionReminders({ navigation }: Props): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [reminders, setReminders] = useState<Reminder[]>([
        {
            id: '1',
            name: 'Renouvellement Paracétamol',
            date: '15/07/2025',
            dueDate: new Date('2025-07-15'),
            sound: 'Son 1',
            isCompleted: false,
            priority: 'high',
            notes: 'Ordonnance expire bientôt',
        },
        {
            id: '2',
            name: 'Consultation cardiologue',
            date: '20/07/2025',
            dueDate: new Date('2025-07-20'),
            sound: 'Son 2',
            isCompleted: true,
            priority: 'medium',
            notes: 'RDV pris, confirmation reçue',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [newReminder, setNewReminder] = useState<Reminder>({
        id: '',
        name: '',
        date: '',
        sound: '',
        isCompleted: false,
        dueDate: new Date(),
        priority: 'medium',
        notes: '',
    });

    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedMonth, setSelectedMonth] = useState<number>(7);
    const [selectedDay, setSelectedDay] = useState<number>(15);
    const [selectedSound, setSelectedSound] = useState<string>('Son 1');
    const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];
    const priorities = [
        { label: 'Faible', value: 'low' },
        { label: 'Moyenne', value: 'medium' },
        { label: 'Élevée', value: 'high' }
    ];

    // Calculate days until due date and status
    const getDaysUntilDue = (dueDate: Date): number => {
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatusInfo = (reminder: Reminder) => {
        if (reminder.isCompleted) {
            return { status: 'completed', label: 'Terminé', color: '#4CAF50' };
        }
        
        const daysUntil = getDaysUntilDue(reminder.dueDate);
        
        if (daysUntil < 0) {
            return { status: 'overdue', label: `En retard de ${Math.abs(daysUntil)} jour(s)`, color: '#F44336' };
        } else if (daysUntil === 0) {
            return { status: 'today', label: 'Aujourd\'hui', color: '#FF9800' };
        } else if (daysUntil <= 3) {
            return { status: 'urgent', label: `Dans ${daysUntil} jour(s)`, color: '#FF5722' };
        } else if (daysUntil <= 7) {
            return { status: 'soon', label: `Dans ${daysUntil} jour(s)`, color: '#FF9800' };
        } else {
            return { status: 'future', label: `Dans ${daysUntil} jour(s)`, color: colors.infoTextSecondary };
        }
    };

    const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
        switch (priority) {
            case 'high': return '#F44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return colors.infoTextSecondary;
        }
    };

    const getPriorityIcon = (priority: 'low' | 'medium' | 'high'): keyof typeof Ionicons.glyphMap => {
        switch (priority) {
            case 'high': return 'alert-circle';
            case 'medium': return 'warning';
            case 'low': return 'checkmark-circle';
            default: return 'help-circle';
        }
    };

    // Toggle completion status
    const toggleCompletion = (id: string) => {
        setReminders(prevReminders => 
            prevReminders.map(reminder => 
                reminder.id === id 
                    ? { ...reminder, isCompleted: !reminder.isCompleted }
                    : reminder
            )
        );
    };

    // Delete reminder with confirmation
    const deleteReminder = (id: string, name: string) => {
        Alert.alert(
            'Supprimer le rappel',
            `Êtes-vous sûr de vouloir supprimer le rappel "${name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
                    }
                }
            ]
        );
    };

    const handleAddReminder = () => {
        if (!newReminder.name) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const dueDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
        const reminderData: Reminder = {
            id: editingReminder ? editingReminder.id : Math.random().toString(),
            name: newReminder.name,
            date: `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`,
            dueDate: dueDate,
            sound: selectedSound,
            priority: selectedPriority,
            isCompleted: false,
            notes: newReminder.notes || '',
        };

        if (editingReminder) {
            // Edit existing reminder
            setReminders(prevReminders => 
                prevReminders.map(reminder => 
                    reminder.id === editingReminder.id ? reminderData : reminder
                )
            );
        } else {
            // Add new reminder
            setReminders(prevReminders => [...prevReminders, reminderData]);
        }

        resetForm();
    };

    const resetForm = () => {
        setNewReminder({
            id: '',
            name: '',
            date: '',
            sound: '',
            isCompleted: false,
            dueDate: new Date(),
            priority: 'medium',
            notes: '',
        });
        setSelectedYear(2025);
        setSelectedMonth(7);
        setSelectedDay(15);
        setSelectedSound('Son 1');
        setSelectedPriority('medium');
        setEditingReminder(null);
        setIsModalVisible(false);
    };

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setNewReminder(reminder);
        setSelectedSound(reminder.sound);
        setSelectedPriority(reminder.priority);
        
        const dateParts = reminder.date.split('/');
        setSelectedDay(parseInt(dateParts[0]));
        setSelectedMonth(parseInt(dateParts[1]));
        setSelectedYear(parseInt(dateParts[2]));
        
        setIsModalVisible(true);
    };

    // Sort reminders by completion status and due date
    const sortedReminders = [...reminders].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1; // Completed items go to bottom
        }
        return a.dueDate.getTime() - b.dueDate.getTime(); // Sort by due date
    });

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedReminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const statusInfo = getStatusInfo(item);
                    return (
                        <View style={[styles.agendaCard, item.isCompleted && styles.completedCard]}>
                            <View style={styles.agendaHeader}>
                                <View style={styles.agendaDateContainer}>
                                    <Text style={[styles.agendaDate, item.isCompleted && styles.completedText]}>
                                        {item.date}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                                        <Text style={styles.statusText}>{statusInfo.label}</Text>
                                    </View>
                                </View>
                                <View style={styles.agendaActions}>
                                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]}>
                                        <Ionicons 
                                            name={getPriorityIcon(item.priority)} 
                                            size={16} 
                                            color="white" 
                                        />
                                    </View>
                                    <Switch
                                        value={item.isCompleted}
                                        onValueChange={() => toggleCompletion(item.id)}
                                        thumbColor={item.isCompleted ? '#4CAF50' : colors.inputBorder}
                                        trackColor={{ false: colors.inputBorder, true: '#A5D6A7' }}
                                        style={{ marginLeft: 8 }}
                                    />
                                </View>
                            </View>
                            
                            <View style={styles.agendaContent}>
                                <Text style={[styles.agendaTitle, item.isCompleted && styles.completedText]}>
                                    {item.name}
                                </Text>
                                {item.notes && (
                                    <Text style={[styles.agendaNotes, item.isCompleted && styles.completedText]}>
                                        📝 {item.notes}
                                    </Text>
                                )}
                                <Text style={[styles.agendaSound, item.isCompleted && styles.completedText]}>
                                    🔊 {item.sound}
                                </Text>
                            </View>
                            
                            <View style={styles.agendaFooter}>
                                <TouchableOpacity 
                                    onPress={() => handleEditReminder(item)} 
                                    style={styles.editIconButton}
                                >
                                    <Ionicons name="create-outline" size={20} color={colors.iconPrimary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => deleteReminder(item.id, item.name)} 
                                    style={styles.deleteIconButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            />

            {/* Fixed Add Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.addAlarmButton} onPress={() => setIsModalVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Ionicons name="calendar" size={24} color={colors.iconPrimary} />
                        <Text style={styles.buttonText}>Nouveau rappel</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                        <Text style={styles.modalTitle}>
                            {editingReminder ? 'Modifier le rappel' : 'Nouveau rappel'}
                        </Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Nom du rappel (ex: Renouvellement ordonnance)"
                            value={newReminder.name}
                            onChangeText={(text) => setNewReminder({ ...newReminder, name: text })}
                        />
                        
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Notes (optionnel)"
                            value={newReminder.notes}
                            onChangeText={(text) => setNewReminder({ ...newReminder, notes: text })}
                            multiline
                            textAlignVertical="top"
                        />
                        
                        <Text style={styles.label}>Date d'échéance</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
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
                                        label: (2025 + i).toString(), 
                                        value: 2025 + i 
                                    }))}
                                    placeholder="2025"
                                />
                            </View>
                        </View>
                        
                        <CustomPicker
                            label="Priorité"
                            selectedValue={selectedPriority}
                            onValueChange={(value) => setSelectedPriority(value as 'low' | 'medium' | 'high')}
                            options={priorities}
                            placeholder="Choisir une priorité"
                        />
                        
                        <CustomPicker
                            label="Son de notification"
                            selectedValue={selectedSound}
                            onValueChange={(value) => setSelectedSound(String(value))}
                            options={sounds.map(sound => ({ label: sound, value: sound }))}
                            placeholder="Choisir un son"
                        />
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleAddReminder}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>
                                        {editingReminder ? 'Modifier' : 'Enregistrer'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.button} onPress={resetForm}>
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
