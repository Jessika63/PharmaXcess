
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Notifications désactivées',
            'Pour recevoir vos rappels de médicaments, activez les notifications dans les paramètres de votre appareil.',
            [
              { text: 'Plus tard', style: 'cancel' },
              { 
                text: 'Paramètres', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
          return false;
        }
      }

      // Configuration du handler de notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  static async checkNotificationSettings(): Promise<{
    enabled: boolean;
    canAlert: boolean;
    canPlaySound: boolean;
    canSetBadge: boolean;
  }> {
    const settings = await Notifications.getPermissionsAsync();

    return {
      enabled: settings.status === 'granted',
      canAlert: settings.canAskAgain || settings.status === 'granted',
      canPlaySound: Platform.OS === 'ios' ? (settings as any).allowsSound : true,
      canSetBadge: Platform.OS === 'ios' ? (settings as any).allowsBadge : true,
    };
  }

  static async scheduleRepeatingNotification(
    alarm: {
      id: string;
      medicineName: string;
      dosage: string;
      time: string;
      days: string[];
      isActive: boolean;
    }
  ): Promise<string[]> {
    if (!alarm.isActive) {
      return [];
    }

    const [hours, minutes] = alarm.time.split(':').map(Number);
    const notificationIds: string[] = [];

    // Mapping des jours
    const dayMap: { [key: string]: number } = {
      'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3,
      'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
    };

    // Programmer pour les 4 prochaines semaines
    const today = new Date();
    for (let week = 0; week < 4; week++) {
      for (const dayName of alarm.days) {
        const dayOfWeek = dayMap[dayName];

        // Calculer la prochaine occurrence de ce jour
        let targetDate = new Date(today);
        const daysUntilTarget = (dayOfWeek + 7 - today.getDay()) % 7;
        targetDate.setDate(today.getDate() + daysUntilTarget + (week * 7));
        targetDate.setHours(hours, minutes, 0, 0);

        // Ne programmer que les dates futures
        if (targetDate > today) {
          try {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `💊 ${alarm.medicineName}`,
                body: `Il est temps de prendre votre médicament : ${alarm.dosage}`,
                sound: true,
                data: {
                  alarmId: alarm.id,
                  type: 'medicine-reminder',
                  scheduledTime: targetDate.getTime()
                },
              },
              trigger: {
                type: 'date',
                date: targetDate,
              } as any,
            });

            notificationIds.push(notificationId);
            console.log(`📅 Notification programmée: ${alarm.medicineName} - ${targetDate.toLocaleString()}`);
          } catch (error) {
            console.error('Erreur programmation notification:', error);
          }
        }
      }
    }

    return notificationIds;
  }

  static async cancelNotifications(notificationIds: string[]): Promise<void> {
    try {
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      console.log(`🗑️ ${notificationIds.length} notifications annulées`);
    } catch (error) {
      console.error('Erreur annulation notifications:', error);
    }
  }

  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  }

  static async testNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test de notification',
          body: 'Si vous voyez ceci, les notifications fonctionnent !',
          sound: true,
        },
        trigger: { seconds: 2 } as any,
      });
    } catch (error) {
      console.error('Erreur test notification:', error);
      throw error;
    }
  }
}
