
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export class FirebaseNotificationService {
  static async initialize(): Promise<void> {
    // Ask for permissions
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Firebase Messaging autorisé:', authStatus);
      await this.getFCMToken();
    }

    // HHandle for foreground notifications
    messaging().onMessage(async remoteMessage => {
      console.log('Message reçu en premier plan:', remoteMessage);

      // Display a local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          sound: true,
          data: remoteMessage.data,
        },
        trigger: null, // immediate notification
      });
    });

    // Handler for background and quit state notifications
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification ouverte depuis arrière-plan:', remoteMessage);
    });

    // Check if the app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App ouverte depuis notification fermée:', remoteMessage);
        }
      });
  }

  static async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      // Send this token to your backend server
      return token;
    } catch (error) {
      console.error('Erreur récupération FCM token:', error);
      return null;
    }
  }

  static async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Abonné au topic: ${topic}`);
    } catch (error) {
      console.error(`Erreur abonnement topic ${topic}:`, error);
    }
  }

  static async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Désabonné du topic: ${topic}`);
    } catch (error) {
      console.error(`Erreur désabonnement topic ${topic}:`, error);
    }
  }

  // Send a push notification via Firebase Cloud Messaging
  static async sendPushNotification(data: {
    token: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<void> {
    // This function would typically call your backend server API to send the notification
    // Example usage with Firebase Admin SDK
    const message = {
      notification: {
        title: data.title,
        body: data.body,
      },
      data: data.data,
      token: data.token,
    };

    // Send via Firebase Admin SDK from your server
    console.log('Message à envoyer:', message);
  }
}
