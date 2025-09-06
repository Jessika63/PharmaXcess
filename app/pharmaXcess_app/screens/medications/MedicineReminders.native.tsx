import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
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

    // State to manage notifications 
    const [notificationsEnabled, setNotificationsEnabled] = useState(false); 
    const [notificationIds, setNotificationIds] = useState<Map<string, string>>(new Map()); 

    // Setup notifications on mount 
    useEffect(() => { 
        setupNotifications(); 
    }, []); 

    const setupNotifications = async () => {
        // Setup notifications handler 
        Notifications.setNotificationHandler({ 
            handleNotification: async () => ({ 
                shouldShowAlert: true, 
                shouldPlaySound: true, 
                shouldSetBadge: false, 
                shouldShowBanner: true, 
                shouldShowList: true, 
            }),
        }); 

        // Ask for permissions 
        const { status } = await Notifications.requestPermissionsAsync(); 
        setNotificationsEnabled(status === 'granted'); 

        if (status !== 'granted') { 
            Alert.alert( 
                'Permissions de notification', 
                'Pour recevoir les rappels de médicaments, veuillez activer les notifications dans les paramètres de votre appareil.',
                [{ text: 'OK' }]
            ); 
        }
    }; 

    // Schedule a notification for an alarm 
    const scheduleNotification = async (alarm: Alarm) => { 
        if (!notificationsEnabled) {
            console.log(`⚠️ Notifications désactivées pour ${alarm.medicineName}`);
            return;
        }

        console.log(`🔄 Programmation des notifications pour ${alarm.medicineName}...`);

        // Cancel existing notification for this alarm first
        await cancelNotification(alarm.id);

        // Don't schedule if alarm is not active
        if (!alarm.isActive || alarm.days.length === 0) {
            console.log(`⏹️ Alarme ${alarm.medicineName} inactive ou pas de jours sélectionnés`);
            return;
        }

        const now = new Date();
        const [hours, minutes] = alarm.time.split(':').map(Number);
        
        // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
        const dayMap: { [key: string]: number } = {
            'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 
            'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
        };
        
        const alarmDays = alarm.days.map(day => dayMap[day]);
        const scheduledNotifications: string[] = [];

        try {
            // Program notifications for the next 2 weeks maximum
            let notificationsCount = 0;
            const maxNotifications = 10;
            
            for (let day = 0; day < 14 && notificationsCount < maxNotifications; day++) {
                const notificationDate = new Date();
                notificationDate.setDate(now.getDate() + day);
                notificationDate.setHours(hours, minutes, 0, 0);
                
                const dayOfWeek = notificationDate.getDay();
                
                // Check if this day is in the alarm days
                if (alarmDays.includes(dayOfWeek)) {
                    // Only schedule if the notification is in the future
                    if (notificationDate <= now) {
                        console.log(`⏭️ ${alarm.medicineName}: ${notificationDate.toLocaleString()} dans le passé, ignorée`);
                        continue;
                    }
                    
                    const triggerSeconds = Math.floor((notificationDate.getTime() - now.getTime()) / 1000);
                    
                    // Only schedule if the trigger time is at least 30 seconds in the future
                    if (triggerSeconds < 30) {
                        console.log(`⏭️ ${alarm.medicineName}: notification trop proche (${triggerSeconds}s), ignorée`);
                        continue;
                    }

                    const notificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `💊 Rappel: ${alarm.medicineName}`,
                            body: `Il est temps de prendre votre médicament: ${alarm.medicineName} (${alarm.dosage})`,
                            sound: true,
                            data: {
                                alarmId: alarm.id,
                                type: 'medicine-reminder',
                                scheduledTime: notificationDate.getTime()
                            },
                        },
                        trigger: { 
                            seconds: triggerSeconds 
                        } as any,
                    });

                    scheduledNotifications.push(notificationId);
                    notificationsCount++;
                    
                    console.log(`📅 ${alarm.medicineName}: notification programmée pour ${notificationDate.toLocaleDateString()} à ${notificationDate.toLocaleTimeString()} (dans ${Math.floor(triggerSeconds/60)} min)`);
                }
            }

            // Store all notification IDs for this alarm
            if (scheduledNotifications.length > 0) {
                setNotificationIds(prev => new Map(prev.set(alarm.id, scheduledNotifications.join(','))));
                console.log(`✅ ${scheduledNotifications.length} notifications programmées pour ${alarm.medicineName}`);
            } else {
                console.log(`⚠️ Aucune notification programmée pour ${alarm.medicineName} (peut-être que toutes les dates sont dans le passé)`);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la programmation des notifications:', error);
        }
    }; 

    // Cancel all scheduled notifications for an alarm
    const cancelNotification = async (alarmId: string) => { 
        const notificationIdsString = notificationIds.get(alarmId); 
        if (notificationIdsString) { 
            const ids = notificationIdsString.split(',');
            try {
                // Cancel all notifications for this alarm
                for (const notificationId of ids) {
                    await Notifications.cancelScheduledNotificationAsync(notificationId);
                }
                setNotificationIds(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(alarmId);
                    return newMap;
                }); 
                console.log(`🗑️ ${ids.length} notification(s) annulée(s) pour l'alarme ${alarmId}`);
            } catch (error) {
                console.error(`❌ Erreur lors de l'annulation des notifications:`, error);
            }
        }
    };

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
    const toggleAlarm = async (id: string) => {
        console.log(`🔄 Toggle alarme ${id}`);
        
        if (isMainProfile) {
            setAlarms(prevAlarms => 
                prevAlarms.map(alarm => {
                    if (alarm.id === id) {
                        const updatedAlarm = { 
                            ...alarm, 
                            isActive: !alarm.isActive,
                            nextAlarm: calculateNextAlarm({ ...alarm, isActive: !alarm.isActive })
                        };
                        
                        // Only schedule/cancel notifications when toggling
                        if (updatedAlarm.isActive) {
                            console.log(`🔔 Activation alarme ${alarm.medicineName}`);
                            setTimeout(() => scheduleNotification(updatedAlarm), 100);
                        } else {
                            console.log(`🔕 Désactivation alarme ${alarm.medicineName}`);
                            setTimeout(() => cancelNotification(id), 100);
                        }

                        return updatedAlarm;
                    }
                    return alarm;
                })
            );
        } else {
            // For other profiles: update profile data
            const currentAlarms = getCurrentAlarms();
            const alarmIndex = currentAlarms.findIndex(alarm => alarm.id === id);
            if (alarmIndex !== -1) {
                const currentAlarm = currentAlarms[alarmIndex];
                const updatedAlarm = {
                    ...currentAlarm,
                    isActive: !currentAlarm.isActive,
                    nextAlarm: calculateNextAlarm({ ...currentAlarm, isActive: !currentAlarm.isActive })
                };
                const updatedProfileAlarms = [...profileAlarmsData];
                updatedProfileAlarms[alarmIndex] = JSON.stringify(updatedAlarm);
                setProfileAlarmsData(updatedProfileAlarms);

                // Only schedule/cancel notifications when toggling
                if (updatedAlarm.isActive) {
                    console.log(`🔔 Activation alarme ${currentAlarm.medicineName} (profil)`);
                    setTimeout(() => scheduleNotification(updatedAlarm), 100);
                } else {
                    console.log(`🔕 Désactivation alarme ${currentAlarm.medicineName} (profil)`);
                    setTimeout(() => cancelNotification(id), 100);
                }
            }
        }
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
    const deleteAlarm = async (id: string, medicineName: string) => {
        Alert.alert(
            'Supprimer l\'alarme',
            `Êtes-vous sûr de vouloir supprimer l'alarme pour ${medicineName} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: async () => {
                        // Cancel the notification before deleting
                        await cancelNotification(id);
                        setAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== id));
                    }
                }
            ]
        );
    };

    const handleRemoveAlarm = async (id: string, medicineName: string) => {
        if (isMainProfile) {
            // For main profile: use existing delete function
            await deleteAlarm(id, medicineName);
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
                            // Cancel the notification before deleting
                            await cancelNotification(id);
                            
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
                // Cancel existing notification if time or days changed
                await cancelNotification(editingAlarm.id); 

                // Edit existing alarm
                setAlarms(prevAlarms => 
                    prevAlarms.map(alarm => 
                        alarm.id === editingAlarm.id ? alarmData : alarm
                    )
                );
                
                // Only schedule notifications if alarm is active
                if (alarmData.isActive && notificationsEnabled) {
                    console.log(`🔄 Alarme modifiée: ${alarmData.medicineName} - Reprogrammation`);
                    setTimeout(() => scheduleNotification(alarmData), 500);
                }
            } else {
                // Add new alarm
                setAlarms(prevAlarms => [...prevAlarms, alarmData]);
                
                // Only schedule notifications if alarm is active  
                if (alarmData.isActive && notificationsEnabled) {
                    console.log(`🆕 Nouvelle alarme créée: ${alarmData.medicineName} - Programmation`);
                    setTimeout(() => scheduleNotification(alarmData), 500);
                }
            }
        } else {
            // For other profiles: add to profile data
            if (editingAlarm) {
                // Edit existing alarm in profile data
                const currentAlarms = getCurrentAlarms();
                const alarmIndex = currentAlarms.findIndex(alarm => alarm.id === editingAlarm.id);
                if (alarmIndex !== -1) {
                    // Cancel old notification if time or days changed 
                    await cancelNotification(editingAlarm.id); 

                    const updatedProfileAlarms = [...profileAlarmsData];
                    updatedProfileAlarms[alarmIndex] = JSON.stringify(alarmData);
                    setProfileAlarmsData(updatedProfileAlarms);
                    Alert.alert('Succès', 'Alarme modifiée avec succès.');

                    // Only schedule notifications if alarm is active
                    if (alarmData.isActive && notificationsEnabled) {
                        console.log(`🔄 Alarme modifiée (profil): ${alarmData.medicineName} - Reprogrammation`);
                        setTimeout(() => scheduleNotification(alarmData), 500);
                    }
                } else {
                    Alert.alert('Erreur', 'Alarme introuvable.');
                }
            } else {
                // Add new alarm to profile
                const success = await handleAddAlarmToProfile(JSON.stringify(alarmData));
                if (success) {
                    Alert.alert('Succès', 'Alarme ajoutée avec succès.');

                    // Only schedule notifications if alarm is active
                    if (alarmData.isActive && notificationsEnabled) {
                        console.log(`🆕 Nouvelle alarme créée (profil): ${alarmData.medicineName} - Programmation`);
                        setTimeout(() => scheduleNotification(alarmData), 500);
                    }
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

    // Removed automatic notification scheduling useEffects to prevent immediate notifications
    // Notifications are now only scheduled manually when alarms are created/modified

    const syncNotificationsForAlarm = async (alarm: Alarm) => {
        if (!notificationsEnabled) return;

        if (alarm.isActive && alarm.nextAlarm) {
            await scheduleNotification(alarm);
        } else {
            await cancelNotification(alarm.id);
        }
    };

    // const syncExistingNotifications = async () => {
    //     const currentAlarms = getCurrentAlarms();
        
    //     // Cancel all existing notifications first to avoid duplicates
    //     for (const [alarmId, notificationId] of notificationIds.entries()) {
    //         try {
    //             await Notifications.cancelScheduledNotificationAsync(notificationId);
    //         } catch (error) {
    //             console.log(`Failed to cancel notification ${notificationId}:`, error);
    //         }
    //     }
        
    //     // Clear the notification IDs map
    //     setNotificationIds(new Map());
        
    //     // Schedule new notifications only for active alarms
    //     for (const alarm of currentAlarms) {
    //         if (alarm.isActive && alarm.nextAlarm) {
    //             await scheduleNotification(alarm);
    //         }
    //     }
    // };

    // Test notification function for development
    const testNotification = async () => {
        if (!notificationsEnabled) {
            Alert.alert('Erreur', 'Les notifications ne sont pas activées.');
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🧪 Test - Rappel de médicament',
                    body: 'Ceci est un test de notification pour les rappels de médicaments.',
                    sound: true,
                },
                trigger: { seconds: 1 } as any,
            });
            Alert.alert('Test envoyé', 'Une notification de test va apparaître dans 1 seconde.');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'envoyer la notification de test.');
        }
    };

    // Debug function to show scheduled notifications
    const showScheduledNotifications = async () => {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            const medicineNotifications = scheduled.filter(n => n.content.data?.type === 'medicine-reminder');
            
            Alert.alert(
                'Notifications programmées',
                `${medicineNotifications.length} notifications de médicaments programmées:\n\n` +
                medicineNotifications.map(n => 
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

                        {/* Button to test notifications */}
                        {__DEV__ && (
                            <>
                                <TouchableOpacity 
                                    style={[styles.addAlarmButton, { marginTop: 10, opacity: 0.8 }]} 
                                    onPress={testNotification}
                                >
                                    <LinearGradient colors={['#9C27B0', '#E91E63']} style={styles.gradient}>
                                        <Ionicons name="notifications-outline" size={24} color="white" />
                                        <Text style={[styles.buttonText, { fontSize: 14 }]}>Test notification</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.addAlarmButton, { marginTop: 10, opacity: 0.8 }]} 
                                    onPress={showScheduledNotifications}
                                >
                                    <LinearGradient colors={['#607D8B', '#455A64']} style={styles.gradient}>
                                        <Ionicons name="list-outline" size={24} color="white" />
                                        <Text style={[styles.buttonText, { fontSize: 14 }]}>Voir notifications programmées</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.addAlarmButton, { marginTop: 10, opacity: 0.8 }]} 
                                    onPress={clearAllNotifications}
                                >
                                    <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.gradient}>
                                        <Ionicons name="trash-outline" size={24} color="white" />
                                        <Text style={[styles.buttonText, { fontSize: 14 }]}>Supprimer toutes les notifications</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}
                        
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
