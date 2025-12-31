import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { logger } from './logger';

/**
 * Get the Expo Push Token for this device
 * Returns null if notifications are not supported or permission denied
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // On Android, we need to set up a default notification channel BEFORE
    // requesting the push token, otherwise getExpoPushTokenAsync can fail
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      });
    }

    // Check if we have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.log('Push notification permission not granted');
      return null;
    }

    // Get the project ID from Expo config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      logger.error('Missing EAS project ID for push notifications');
      return null;
    }

    // Get the Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    logger.log('Got Expo push token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    logger.error('Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Set up notification channels for Android
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('friend-requests', {
      name: 'Friend Requests',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });

    await Notifications.setNotificationChannelAsync('puzzle-completions', {
      name: 'Friend Puzzle Completions',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#10b981',
    });
  }
}

/**
 * Notification response data types
 */
export interface NotificationData {
  type: 'friend_request' | 'puzzle_completion';
  friendshipId?: string;
  userId?: string;
}

/**
 * Parse notification data from a notification response
 */
export function parseNotificationData(
  response: Notifications.NotificationResponse
): NotificationData | null {
  try {
    const data = response.notification.request.content.data as NotificationData;
    if (data && data.type) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
