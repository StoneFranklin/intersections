import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Helper to get today's date key (same format as in index.tsx)
function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Check if user has completed today's puzzle
async function hasPuzzleBeenCompletedToday(): Promise<boolean> {
  try {
    const todayKey = getTodayKey();
    const completed = await AsyncStorage.getItem(`completed-${todayKey}`);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking puzzle completion:', error);
    return false;
  }
}

// Unique identifier for the daily puzzle notification
const DAILY_NOTIFICATION_ID = 'daily-puzzle-reminder';

// Storage key for notification preference
const NOTIFICATIONS_ENABLED_KEY = 'notifications-enabled';

/**
 * Request notification permissions from the user
 * @returns true if permission granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false; // Notifications not supported on web
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule notification for tomorrow at 9 AM if puzzle hasn't been completed today
 * This approach ensures we only notify users who haven't completed the puzzle
 */
export async function scheduleDailyNotification(): Promise<void> {
  if (Platform.OS === 'web') {
    return; // Notifications not supported on web
  }

  try {
    // Cancel any existing daily notification first
    await cancelDailyNotification();

    // Calculate time until tomorrow at 9 AM
    const now = new Date();
    const tomorrow9AM = new Date();
    tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
    tomorrow9AM.setHours(9, 0, 0, 0);

    const secondsUntilTomorrow9AM = Math.floor((tomorrow9AM.getTime() - now.getTime()) / 1000);

    // Only schedule if it's in the future
    if (secondsUntilTomorrow9AM > 0) {
      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_NOTIFICATION_ID,
        content: {
          title: "New Puzzle Ready! 🎯",
          body: "Today's Intersections puzzle is waiting for you!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTomorrow9AM,
        },
      });

      console.log(`Daily notification scheduled for tomorrow at 9 AM (in ${secondsUntilTomorrow9AM}s)`);
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Schedule notification for today at 9 AM if it hasn't happened yet and puzzle not completed
 */
export async function scheduleNotificationForToday(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Check if notifications are enabled by user
    const notificationsEnabled = await areNotificationsEnabled();
    if (!notificationsEnabled) {
      console.log('Notifications disabled by user, skipping');
      return;
    }

    const isCompleted = await hasPuzzleBeenCompletedToday();
    if (isCompleted) {
      // Don't schedule if already completed
      console.log('Puzzle already completed today, skipping notification');
      return;
    }

    // Cancel existing notification
    await cancelDailyNotification();

    const now = new Date();
    const today9AM = new Date();
    today9AM.setHours(9, 0, 0, 0);

    // If it's before 9 AM today, schedule for today
    if (now < today9AM) {
      const secondsUntil9AM = Math.floor((today9AM.getTime() - now.getTime()) / 1000);

      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_NOTIFICATION_ID,
        content: {
          title: "New Puzzle Ready! 🎯",
          body: "Today's Intersections puzzle is waiting for you!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil9AM,
        },
      });

      console.log(`Notification scheduled for today at 9 AM (in ${secondsUntil9AM}s)`);
    } else {
      // It's after 9 AM, schedule for tomorrow
      await scheduleDailyNotification();
    }
  } catch (error) {
    console.error('Error scheduling notification for today:', error);
  }
}

/**
 * Cancel the daily notification
 * Call this when the user completes the puzzle for the day
 */
export async function cancelDailyNotification(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID);
    console.log('Daily notification cancelled');
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Check if daily notification is currently scheduled
 */
export async function isDailyNotificationScheduled(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.some(
      (notification) => notification.identifier === DAILY_NOTIFICATION_ID
    );
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled by user preference
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    // Default to true if not set (opt-out model)
    return enabled !== 'false';
  } catch (error) {
    console.error('Error checking notification preference:', error);
    return true;
  }
}

/**
 * Enable or disable notifications
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());

    if (enabled) {
      // Re-enable notifications - schedule for today
      await scheduleNotificationForToday();
    } else {
      // Disable notifications - cancel all scheduled
      await cancelDailyNotification();
    }

    console.log(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error setting notification preference:', error);
  }
}
