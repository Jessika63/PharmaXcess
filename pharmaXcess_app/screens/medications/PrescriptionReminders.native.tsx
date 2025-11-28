import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import createStyles from '../../styles/Reminders.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';
import { CustomPicker } from '../../components';
import { NotificationService } from '../../utils/notificationService';

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
    const { currentProfile } = useProfile();
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

    // For profile-based reminder management (simulated)
    const [profileRemindersData, setProfileRemindersData] = useState<string[]>([]);

    // State to manage notifications
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationIds, setNotificationIds] = useState<Map<string, string>>(new Map());

    // Setup notifications on mount
    useEffect(() => {
        initializeNotifications();
    }, []);

    const initializeNotifications = async () => {
        const isEnabled = await NotificationService.requestPermissions();
        setNotificationsEnabled(isEnabled);

        if (!isEnabled) {
            Alert.alert(
                'Notifications désactivées',
                'Les rappels d\'ordonnances ne fonctionneront pas sans les notifications. Vous pouvez les activer dans les paramètres.',
                [
                    { text: 'Plus tard', style: 'cancel' },
                    { text: 'Paramètres', onPress: () => NotificationService.requestPermissions() }
                ]
            );
        }
    };

    // Schedule a notification for a reminder
    const scheduleNotification = async (reminder: Reminder) => {
        if (!notificationsEnabled) {
            console.log(`⚠️ Notifications désactivées pour ${reminder.name}`);
            return [];
        }

        console.log(`🔄 Programmation notification pour ${reminder.name}...`);

        // Don't schedule a notification if the reminder is completed
        if (reminder.isCompleted) {
            console.log(`⏹️ Rappel ${reminder.name} déjà terminé, pas de notification`);
            return [];
        }

        const now = new Date();
        const reminderDate = new Date(reminder.dueDate);
        reminderDate.setHours(9, 0, 0, 0); // Schedule for 9 AM on the due date

        // Don't schedule if date is in the past
        if (reminderDate <= now) {
            console.log(`⏭️ ${reminder.name}: date ${reminderDate.toLocaleDateString()} dans le passé, ignorée`);
            return [];
        }

        try {
            const priorityEmoji = reminder.priority === 'high' ? '🚨' :
                                reminder.priority === 'medium' ? '⚠️' : 'ℹ️';

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `${priorityEmoji} Rappel d'ordonnance`,
                    body: `Il est temps de renouveler votre ordonnance: ${reminder.name}${reminder.notes ? '\n' + reminder.notes : ''}`,
                    sound: true,
                    data: {
                        reminderId: reminder.id,
                        type: 'prescription-reminder'
                    },
                },
                trigger: {
                    type: 'date',
                    date: reminderDate,
                } as any,
            });

            console.log(`✅ Notification programmée pour ${reminder.name} le ${reminderDate.toLocaleDateString()} à 9h00`);
            return [notificationId];
        } catch (error) {
            console.error('❌ Erreur lors de la programmation de la notification:', error);
            return [];
        }
    };

    // Cancel a scheduled notification
    const cancelNotification = async (reminderId: string) => {
        const notificationId = notificationIds.get(reminderId);
        if (notificationId) {
            try {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
                setNotificationIds(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(reminderId);
                    return newMap;
                });
                console.log(`Notification annulée pour le rappel ${reminderId}`);
            } catch (error) {
                console.error('Erreur lors de l\'annulation de la notification:', error);
            }
        }
    };

    // Simple reminder management by profile (simulated functions)
    const handleAddReminderToProfile = async (reminderData: string): Promise<boolean> => {
        // Simulate adding reminder to profile
        if (!profileRemindersData.includes(reminderData)) {
            setProfileRemindersData([...profileRemindersData, reminderData]);
            return true;
        }
        return false;
    };

    const handleRemoveReminderFromProfile = async (reminder: string): Promise<boolean> => {
        // Simulate removing reminder from profile
        setProfileRemindersData(profileRemindersData.filter(r => r !== reminder));
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
            title: 'Rappels d\'ordonnances',
        });
    }, [navigation]);

    // Determine if it's the main profile
    const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

    // Get the reminders to display based on profile
    const getCurrentReminders = () => {
        if (isMainProfile) {
            return reminders;
        } else {
            // Parse profile-specific reminders from JSON strings
            return profileRemindersData.map(reminderStr => {
                try {
                    const parsedReminder = JSON.parse(reminderStr);
                    // Convert dueDate string back to Date object
                    return {
                        ...parsedReminder,
                        dueDate: new Date(parsedReminder.dueDate)
                    };
                } catch {
                    return null;
                }
            }).filter(Boolean);
        }
    };

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
        if (isMainProfile) {
            setReminders(prevReminders =>
                prevReminders.map(reminder => {
                    if (reminder.id === id) {
                        const updatedReminder = { ...reminder, isCompleted: !reminder.isCompleted };

                        // Handle notification based on completion status
                        if (updatedReminder.isCompleted) {
                            console.log(`✅ Rappel ${reminder.name} terminé - Annulation notification`);
                            setTimeout(() => cancelNotification(id), 100);
                        } else {
                            console.log(`🔄 Rappel ${reminder.name} réactivé - Programmation notification`);
                            setTimeout(async () => {
                                const notificationIds = await scheduleNotification(updatedReminder);
                                if (notificationIds.length > 0) {
                                    setNotificationIds(prev => new Map(prev.set(id, notificationIds[0])));
                                }
                            }, 100);
                        }

                        return updatedReminder;
                    }
                    return reminder;
                })
            );
        } else {
            // For other profiles: update profile data
            const currentReminders = getCurrentReminders();
            const reminderIndex = currentReminders.findIndex(reminder => reminder.id === id);
            if (reminderIndex !== -1) {
                const updatedReminder = {
                    ...currentReminders[reminderIndex],
                    isCompleted: !currentReminders[reminderIndex].isCompleted
                };
                const updatedProfileReminders = [...profileRemindersData];
                updatedProfileReminders[reminderIndex] = JSON.stringify(updatedReminder);
                setProfileRemindersData(updatedProfileReminders);

                // Handle notification based on completion status
                if (updatedReminder.isCompleted) {
                    console.log(`✅ Rappel ${updatedReminder.name} terminé (profil) - Annulation notification`);
                    setTimeout(() => cancelNotification(id), 100);
                } else {
                    console.log(`🔄 Rappel ${updatedReminder.name} réactivé (profil) - Programmation notification`);
                    setTimeout(async () => {
                        const notificationIds = await scheduleNotification(updatedReminder);
                        if (notificationIds.length > 0) {
                            setNotificationIds(prev => new Map(prev.set(id, notificationIds[0])));
                        }
                    }, 100);
                }
            }
        }
    };

    // Delete reminder with confirmation
    const deleteReminder = async (id: string, name: string) => {
        Alert.alert(
            'Supprimer le rappel',
            `Êtes-vous sûr de vouloir supprimer le rappel "${name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        // Cancel the notification before deleting
                        await cancelNotification(id);
                        setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
                    }
                }
            ]
        );
    };

    const handleAddReminder = async () => {
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
            isCompleted: editingReminder ? editingReminder.isCompleted : false,
            notes: newReminder.notes || '',
        };

        if (isMainProfile) {
            // For main profile: use existing logic
            if (editingReminder) {
                // Cancel existing notifications before updating
                await cancelNotification(editingReminder.id);

                // Edit existing reminder
                setReminders(prevReminders =>
                    prevReminders.map(reminder =>
                        reminder.id === editingReminder.id ? reminderData : reminder
                    )
                );

                console.log(`🔄 Rappel modifié: ${reminderData.name}`);
            } else {
                // Add new reminder
                setReminders(prevReminders => [...prevReminders, reminderData]);
                console.log(`🆕 Nouveau rappel créé: ${reminderData.name}`);
            }

            // Schedule notification only once after state update
            if (!reminderData.isCompleted && notificationsEnabled) {
                console.log(`📅 Programmation notification pour: ${reminderData.name}`);
                const notificationIds = await scheduleNotification(reminderData);
                if (notificationIds.length > 0) {
                    setNotificationIds(prev => new Map(prev.set(reminderData.id, notificationIds[0])));
                }
            }
        } else {
            // For other profiles: add to profile data
            if (editingReminder) {
                // Edit existing reminder in profile data
                const currentReminders = getCurrentReminders();
                const reminderIndex = currentReminders.findIndex(reminder => reminder.id === editingReminder.id);
                if (reminderIndex !== -1) {
                    // Cancel old notification
                    await cancelNotification(editingReminder.id);

                    const updatedProfileReminders = [...profileRemindersData];
                    updatedProfileReminders[reminderIndex] = JSON.stringify(reminderData);
                    setProfileRemindersData(updatedProfileReminders);
                    Alert.alert('Succès', 'Rappel modifié avec succès.');

                    // Schedule notification for profile reminder
                    if (!reminderData.isCompleted && notificationsEnabled) {
                        console.log(`📅 Programmation notification (profil) pour: ${reminderData.name}`);
                        const notificationIds = await scheduleNotification(reminderData);
                        if (notificationIds.length > 0) {
                            setNotificationIds(prev => new Map(prev.set(reminderData.id, notificationIds[0])));
                        }
                    }
                } else {
                    Alert.alert('Erreur', 'Rappel introuvable.');
                }
            } else {
                // Add new reminder to profile
                const success = await handleAddReminderToProfile(JSON.stringify(reminderData));
                if (success) {
                    Alert.alert('Succès', 'Rappel ajouté avec succès.');

                    // Schedule notification for new profile reminder
                    if (!reminderData.isCompleted && notificationsEnabled) {
                        console.log(`📅 Programmation notification (profil) pour: ${reminderData.name}`);
                        const notificationIds = await scheduleNotification(reminderData);
                        if (notificationIds.length > 0) {
                            setNotificationIds(prev => new Map(prev.set(reminderData.id, notificationIds[0])));
                        }
                    }
                } else {
                    Alert.alert('Erreur', 'Ce rappel est déjà enregistré ou une erreur est survenue.');
                }
            }
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

    const handleRemoveReminder = async (id: string, name: string) => {
        if (isMainProfile) {
            // For main profile: use existing delete function
            await deleteReminder(id, name);
        } else {
            // For other profiles: remove from profile data
            Alert.alert(
                'Supprimer le rappel',
                `Êtes-vous sûr de vouloir supprimer le rappel "${name}" ?`,
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: async () => {
                            // Cancel the notification before deleting
                            await cancelNotification(id);

                            const currentReminders = getCurrentReminders();
                            const reminderIndex = currentReminders.findIndex(reminder => reminder.id === id);
                            if (reminderIndex !== -1) {
                                const reminderToRemove = profileRemindersData[reminderIndex];
                                await handleRemoveReminderFromProfile(reminderToRemove);
                            }
                        }
                    }
                ]
            );
        }
    };

    // Sort reminders by completion status and due date
    const currentReminders = getCurrentReminders();
    const sortedReminders = [...currentReminders].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1; // Completed items go to bottom
        }
        return a.dueDate.getTime() - b.dueDate.getTime(); // Sort by due date
    });

        // Removed automatic notification scheduling useEffects to prevent immediate notifications
    // Notifications are now only scheduled manually when reminders are created/modified

    // Test notification function for development
    const testNotification = async () => {
        if (!notificationsEnabled) {
            Alert.alert(
                'Notifications désactivées',
                'Activez d\'abord les notifications dans les paramètres de votre appareil.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Paramètres', onPress: () => NotificationService.requestPermissions() }
                ]
            );
            return;
        }

        try {
            await NotificationService.testNotification();
            Alert.alert('Test envoyé', 'Une notification de test va apparaître dans 2 secondes.');
        } catch (error) {
            console.error('Erreur test notification:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer la notification de test. Vérifiez les permissions.');
        }
    };

    // Create a test reminder that triggers in 1 minute
    const createTestReminder = async () => {
        if (!notificationsEnabled) {
            Alert.alert('Erreur', 'Activez d\'abord les notifications.');
            return;
        }

        const now = new Date();
        const testTime = new Date(now.getTime() + 60000); // +1 minute

        const testReminder: Reminder = {
            id: 'test-' + Date.now(),
            name: 'Test Rappel Ordonnance',
            date: `${testTime.getDate().toString().padStart(2, '0')}/${(testTime.getMonth() + 1).toString().padStart(2, '0')}/${testTime.getFullYear()}`,
            dueDate: testTime,
            sound: 'Son 1',
            priority: 'high',
            isCompleted: false,
            notes: 'Ceci est un test de notification'
        };

        // Add to reminders list
        setReminders(prev => [...prev, testReminder]);

        // Schedule the notification
        const notificationIds = await scheduleNotification(testReminder);
        if (notificationIds.length > 0) {
            setNotificationIds(prev => new Map(prev.set(testReminder.id, notificationIds[0])));
            Alert.alert(
                'Rappel test créé',
                `Une notification test va arriver à ${testTime.toLocaleTimeString()}.\n\nVous pouvez la supprimer ensuite.`
            );
        } else {
            Alert.alert('Erreur', 'Impossible de programmer le rappel test.');
        }
    };

    // Debug function to show scheduled notifications
    const showScheduledNotifications = async () => {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            const prescriptionNotifications = scheduled.filter(n => n.content.data?.type === 'prescription-reminder');

            Alert.alert(
                'Notifications programmées',
                `${prescriptionNotifications.length} rappels d'ordonnances programmés:\n\n` +
                prescriptionNotifications.map(n =>
                    `• ${n.content.title}\n  ID: ${n.identifier.substring(0, 8)}...`
                ).join('\n\n'),
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de récupérer les notifications programmées.');
        }
    };

    // Debug function to clear all notifications
    const clearAllNotifications = async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            setNotificationIds(new Map());
            Alert.alert('Succès', 'Toutes les notifications ont été supprimées.');
            console.log('🧹 Toutes les notifications supprimées');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer les notifications.');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedReminders}
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
                        {!isMainProfile && sortedReminders.length === 0 && (
                            <View style={styles.alarmCard}>
                                <Text style={[styles.alarmDays, { textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }]}>
                                    Aucun rappel ajouté pour ce profil
                                </Text>
                            </View>
                        )}
                    </>
                )}
                ListFooterComponent={() => (
                    <View style={{ paddingTop: 20, paddingBottom: 20 }}>
                        <TouchableOpacity style={styles.addAlarmButton} onPress={() => setIsModalVisible(true)}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Ionicons name="calendar" size={24} color={colors.iconPrimary} />
                                <Text style={styles.buttonText}>Nouveau rappel</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Indicator for notification status */}
                        <View style={{ marginTop: 15, padding: 10, backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.inputBorder }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons
                                    name={notificationsEnabled ? "checkmark-circle" : "alert-circle"}
                                    size={20}
                                    color={notificationsEnabled ? "#4CAF50" : "#FF9800"}
                                />
                                <Text style={[
                                    styles.alarmDays,
                                    {
                                        marginLeft: 8,
                                        textAlign: 'center',
                                        color: notificationsEnabled ? "#4CAF50" : "#FF9800"
                                    }
                                ]}>
                                    {notificationsEnabled
                                        ? "Notifications activées"
                                        : "Notifications désactivées"
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
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
                                    onPress={() => handleRemoveReminder(item.id, item.name)}
                                    style={styles.deleteIconButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={{ padding: 20 }}
            />

            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 20, paddingBottom: 100 }}>
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
                                <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
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
