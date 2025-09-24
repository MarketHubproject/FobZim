import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushToken {
  token: string;
  userId: string;
  deviceType: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  categoryIdentifier?: string;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Date | number; // Date for specific time, number for seconds from now
  userId: string;
  type: 'campaign_reminder' | 'message' | 'update' | 'milestone' | 'deadline';
}

class PushNotificationService {
  private db = getFirestore();
  private auth = getAuth();
  private currentToken: string | null = null;

  /**
   * Initialize push notifications for the app
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return false;
      }

      // Get push token
      const token = await this.getPushToken();
      if (token) {
        await this.registerToken(token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Get the device's push notification token
   */
  private async getPushToken(): Promise<string | null> {
    try {
      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('campaigns', {
          name: 'Campaign Updates',
          importance: Notifications.AndroidImportance.HIGH,
          description: 'Notifications about campaign updates and milestones',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.MAX,
          description: 'New message notifications',
          sound: 'default',
        });
      }

      // Get the push token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      })).data;

      this.currentToken = token;
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Register push token with Firebase
   */
  private async registerToken(token: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const deviceId = Device.deviceName || Device.modelName || 'unknown';
      const tokenData: PushToken = {
        token,
        userId: user.uid,
        deviceType: Platform.OS,
        deviceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      // Store token in Firestore
      const tokenRef = doc(this.db, 'pushTokens', `${user.uid}_${deviceId}`);
      await setDoc(tokenRef, {
        ...tokenData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  /**
   * Unregister current device's push token
   */
  async unregisterToken(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const deviceId = Device.deviceName || Device.modelName || 'unknown';
      const tokenRef = doc(this.db, 'pushTokens', `${user.uid}_${deviceId}`);
      await deleteDoc(tokenRef);
      
      this.currentToken = null;
      console.log('Push token unregistered');
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }

  /**
   * Send immediate notification to specific users
   */
  async sendNotificationToUsers(
    userIds: string[], 
    notification: NotificationPayload
  ): Promise<void> {
    try {
      // Get tokens for target users
      const tokens: string[] = [];
      
      for (const userId of userIds) {
        const userTokens = await this.getUserTokens(userId);
        tokens.push(...userTokens);
      }

      if (tokens.length === 0) {
        console.warn('No valid tokens found for users');
        return;
      }

      // Send via Expo's push service
      const messages = tokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || 'default',
        badge: notification.badge,
        categoryIdentifier: notification.categoryIdentifier,
        channelId: this.getChannelId(notification),
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Push notification failed: ${JSON.stringify(result)}`);
      }

      console.log('Push notifications sent successfully:', result);
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  /**
   * Get push tokens for a specific user
   */
  private async getUserTokens(userId: string): Promise<string[]> {
    try {
      const tokensQuery = query(
        collection(this.db, 'pushTokens'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const tokensSnapshot = await getDocs(tokensQuery);
      return tokensSnapshot.docs.map(doc => doc.data().token);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  /**
   * Get appropriate notification channel ID based on notification type
   */
  private getChannelId(notification: NotificationPayload): string {
    if (notification.categoryIdentifier) {
      switch (notification.categoryIdentifier) {
        case 'campaign_update':
        case 'campaign_milestone':
        case 'campaign_deadline':
          return 'campaigns';
        case 'new_message':
        case 'message_reply':
          return 'messages';
        default:
          return 'default';
      }
    }
    return 'default';
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    scheduledNotification: ScheduledNotification
  ): Promise<string> {
    try {
      const trigger = typeof scheduledNotification.trigger === 'number' 
        ? { seconds: scheduledNotification.trigger }
        : { date: scheduledNotification.trigger };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: scheduledNotification.title,
          body: scheduledNotification.body,
          data: scheduledNotification.data || {},
          categoryIdentifier: scheduledNotification.type,
        },
        trigger,
      });

      // Store scheduled notification in Firestore for management
      await setDoc(doc(this.db, 'scheduledNotifications', notificationId), {
        ...scheduledNotification,
        notificationId,
        createdAt: serverTimestamp(),
        status: 'scheduled',
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // Update status in Firestore
      const notifRef = doc(this.db, 'scheduledNotifications', notificationId);
      const notifDoc = await getDoc(notifRef);
      
      if (notifDoc.exists()) {
        await setDoc(notifRef, {
          ...notifDoc.data(),
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
        });
      }

      console.log('Scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
    }
  }

  /**
   * Handle notification received while app is in foreground
   */
  setupNotificationListeners(): {
    removeReceivedListener: () => void;
    removeResponseListener: () => void;
  } {
    // Listener for notifications received while app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        // Handle the notification (show custom UI, update state, etc.)
        this.handleForegroundNotification(notification);
      }
    );

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );

    return {
      removeReceivedListener: () => receivedListener.remove(),
      removeResponseListener: () => responseListener.remove(),
    };
  }

  /**
   * Handle notification received in foreground
   */
  private handleForegroundNotification(
    notification: Notifications.Notification
  ): void {
    // You can implement custom UI or state updates here
    // For example, show a banner, update badge count, etc.
    const { title, body, data } = notification.request.content;
    
    console.log('Foreground notification:', { title, body, data });
    
    // Example: Update app state based on notification type
    if (data?.type === 'new_message') {
      // Handle new message notification
      this.handleNewMessageNotification(data);
    } else if (data?.type === 'campaign_update') {
      // Handle campaign update notification
      this.handleCampaignUpdateNotification(data);
    }
  }

  /**
   * Handle user tapping on notification
   */
  private handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): void {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification type
    if (data?.type === 'new_message' && data?.conversationId) {
      // Navigate to specific conversation
      // navigationRef.current?.navigate('Chat', { conversationId: data.conversationId });
    } else if (data?.type === 'campaign_update' && data?.campaignId) {
      // Navigate to specific campaign
      // navigationRef.current?.navigate('CampaignDetails', { campaignId: data.campaignId });
    }
  }

  /**
   * Handle new message notification
   */
  private handleNewMessageNotification(data: any): void {
    // Update message count, refresh conversation list, etc.
    console.log('Handling new message notification:', data);
  }

  /**
   * Handle campaign update notification
   */
  private handleCampaignUpdateNotification(data: any): void {
    // Refresh campaign data, show update indicator, etc.
    console.log('Handling campaign update notification:', data);
  }

  /**
   * Send campaign-related notifications
   */
  async sendCampaignNotification(
    campaignId: string,
    type: 'update' | 'milestone' | 'deadline' | 'contribution',
    title: string,
    body: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      // Get campaign supporters/contributors
      const contributorsQuery = query(
        collection(this.db, 'contributions'),
        where('campaignId', '==', campaignId),
        where('status', '==', 'confirmed')
      );
      
      const contributorsSnapshot = await getDocs(contributorsQuery);
      const userIds = Array.from(new Set(
        contributorsSnapshot.docs.map(doc => doc.data().contributorId)
      ));

      if (userIds.length === 0) {
        console.warn('No contributors found for campaign notification');
        return;
      }

      await this.sendNotificationToUsers(userIds, {
        title,
        body,
        data: {
          type: `campaign_${type}`,
          campaignId,
          ...additionalData,
        },
        categoryIdentifier: `campaign_${type}`,
      });
    } catch (error) {
      console.error('Error sending campaign notification:', error);
      throw error;
    }
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    conversationId: string,
    senderId: string,
    senderName: string,
    messageText: string,
    recipientIds: string[]
  ): Promise<void> {
    try {
      // Filter out the sender from recipients
      const targetUserIds = recipientIds.filter(id => id !== senderId);
      
      if (targetUserIds.length === 0) {
        return;
      }

      await this.sendNotificationToUsers(targetUserIds, {
        title: `New message from ${senderName}`,
        body: messageText,
        data: {
          type: 'new_message',
          conversationId,
          senderId,
        },
        categoryIdentifier: 'new_message',
      });
    } catch (error) {
      console.error('Error sending message notification:', error);
      throw error;
    }
  }

  /**
   * Clean up inactive tokens
   */
  async cleanupInactiveTokens(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const userTokensQuery = query(
        collection(this.db, 'pushTokens'),
        where('userId', '==', user.uid)
      );
      
      const userTokensSnapshot = await getDocs(userTokensQuery);
      const currentDeviceId = Device.deviceName || Device.modelName || 'unknown';
      
      // Mark other device tokens as inactive for this user
      for (const tokenDoc of userTokensSnapshot.docs) {
        const tokenData = tokenDoc.data();
        if (tokenData.deviceId !== currentDeviceId) {
          await setDoc(tokenDoc.ref, {
            ...tokenData,
            isActive: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error cleaning up inactive tokens:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Convenience functions for common notification types
export const sendCampaignUpdateNotification = (
  campaignId: string,
  title: string,
  body: string
) => pushNotificationService.sendCampaignNotification(
  campaignId, 'update', title, body
);

export const sendCampaignMilestoneNotification = (
  campaignId: string,
  milestone: string,
  amount: string
) => pushNotificationService.sendCampaignNotification(
  campaignId, 
  'milestone', 
  'Milestone Reached!',
  `"${milestone}" campaign has reached ${amount}!`
);

export const sendCampaignDeadlineNotification = (
  campaignId: string,
  daysLeft: number
) => pushNotificationService.sendCampaignNotification(
  campaignId,
  'deadline',
  'Campaign Deadline Approaching',
  `Only ${daysLeft} days left to contribute!`
);

export default pushNotificationService;