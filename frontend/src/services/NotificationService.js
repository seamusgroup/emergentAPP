import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('attendance', {
          name: 'Attendance Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleAttendanceReminder(title, body, time) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const trigger = new Date(time);
      const now = new Date();
      
      if (trigger <= now) {
        console.warn('Cannot schedule notification for past time');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'attendance_reminder' },
          sound: true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleClockInReminder(reminderTime = '09:00') {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    return await this.scheduleAttendanceReminder(
      'Time to Clock In',
      "Don't forget to clock in for work!",
      reminderDate
    );
  }

  async scheduleClockOutReminder(reminderTime = '17:00') {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    return await this.scheduleAttendanceReminder(
      'Time to Clock Out',
      "Don't forget to clock out from work!",
      reminderDate
    );
  }

  async sendLocalNotification(title, body, data = {}) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      await Notifications.presentNotificationAsync({
        title,
        body,
        data,
        sound: true,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async notifyOfflineDataPending(count) {
    await this.sendLocalNotification(
      'Sync Required',
      `You have ${count} attendance record${count > 1 ? 's' : ''} pending sync.`,
      { type: 'sync_required', count }
    );
  }

  async notifyGeofenceViolation() {
    await this.sendLocalNotification(
      'Location Alert',
      'You are outside the allowed work area. Please move to the designated location to clock in.',
      { type: 'geofence_violation' }
    );
  }

  async notifySuccessfulSync() {
    await this.sendLocalNotification(
      'Sync Complete',
      'Your attendance data has been synchronized successfully.',
      { type: 'sync_complete' }
    );
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Listen for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listen for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }
}

export default new NotificationService();