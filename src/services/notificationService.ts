import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { collection, doc, setDoc, getDoc, query, where, orderBy, limit, onSnapshot, updateDoc, arrayUnion, Timestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification types
export type NotificationType = 
  | 'campaign_application'
  | 'campaign_approval'
  | 'campaign_rejection'
  | 'new_follower'
  | 'campaign_deadline'
  | 'payment_received'
  | 'message_received'
  | 'tip_received'
  | 'campaign_launched'
  | 'verification_approved'
  | 'verification_rejected'
  | 'system_update';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date | Timestamp;
  imageUrl?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

export interface PushToken {
  userId: string;
  token: string;
  deviceId: string;
  platform: string;
  appVersion: string;
  createdAt: Date;
  lastUsed: Date;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private isInitialized = false;

  /**
   * Initialize the notification service
   */
  async initialize(userId?: string): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Configure notification handling
      await this.configureNotificationHandling();

      // Request permissions and get push token
      const hasPermission = await this.requestPermissions();
      if (hasPermission && userId) {
        await this.registerForPushNotifications(userId);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  }

  /**
   * Configure how notifications are handled when received
   */
  private async configureNotificationHandling(): Promise<void> {
    // Set notification handler for when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const priority = notification.request.content.data?.priority || 'medium';
        
        return {
          shouldShowAlert: true,
          shouldPlaySound: priority === 'high',
          shouldSetBadge: true,
          priority: priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH : Notifications.AndroidNotificationPriority.DEFAULT,
        };
      },
    });

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'ZimBuzz Notifications',
        description: 'Notifications for campaigns, messages, and updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('high-priority', {
        name: 'Important Notifications',
        description: 'High priority notifications for urgent updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D32F2F',
        sound: 'default',
      });
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'You won\'t receive important updates about campaigns and messages. You can enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      if (!Device.isDevice) return null;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your Expo project ID
      });

      this.expoPushToken = token.data;

      // Save token to Firebase for sending notifications
      await this.savePushToken(userId, token.data);

      console.log('📱 Push token registered:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Save push token to Firestore
   */
  private async savePushToken(userId: string, token: string): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      const pushTokenData: PushToken = {
        userId,
        token,
        deviceId,
        platform: Platform.OS,
        appVersion: '1.0.0', // You can get this from app.json or package.json
        createdAt: new Date(),
        lastUsed: new Date(),
      };

      const tokenRef = doc(db, 'pushTokens', `${userId}_${deviceId}`);
      await setDoc(tokenRef, pushTokenData, { merge: true });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Get unique device identifier
   */
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return Math.random().toString(36).substring(2, 15);
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationTapped(response);
    });
  }

  /**
   * Handle notification received while app is running
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    // Update badge count
    this.updateBadgeCount();
    
    // You can emit events here for real-time UI updates
    // EventEmitter.emit('notificationReceived', notification);
  }

  /**
   * Handle when user taps on notification
   */
  private handleNotificationTapped(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    if (data?.actionUrl) {
      // Navigate to specific screen based on notification data
      this.handleDeepLink(data.actionUrl);
    }
  }

  /**
   * Handle deep linking from notifications
   */
  private handleDeepLink(url: string): void {
    // This would integrate with your navigation system
    console.log('🔗 Deep link:', url);
    
    // Example deep link handling:
    // if (url.includes('/campaign/')) {
    //   navigation.navigate('Campaign', { id: extractIdFromUrl(url) });
    // } else if (url.includes('/messages/')) {
    //   navigation.navigate('Messages', { conversationId: extractIdFromUrl(url) });
    // }
  }

  /**
   * Send local notification (for testing or local events)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delay: number = 0
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  /**
   * Save notification to Firestore
   */
  async saveNotification(notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const notificationData: AppNotification = {
        ...notification,
        id: '', // Will be set by Firestore
        createdAt: new Date(),
      };

      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        ...notificationData,
        id: notificationRef.id,
      });

      return notificationRef.id;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with real-time updates
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: AppNotification[]) => void,
    limitCount: number = 50
  ): () => void {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications: AppNotification[] = [];
        snapshot.forEach((doc) => {
          notifications.push(doc.data() as AppNotification);
        });
        callback(notifications);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return () => {};
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      // In a production app, you'd use a batch update or cloud function
      // For now, we'll just update them individually
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Update app badge count
   */
  async updateBadgeCount(count?: number): Promise<void> {
    try {
      if (count !== undefined) {
        await Notifications.setBadgeCountAsync(count);
      } else {
        // Get current badge count from notifications
        // This would need user ID context
        await Notifications.setBadgeCountAsync(0);
      }
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Send push notification via server (mock implementation)
   */
  async sendPushNotification(
    targetUserId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // In production, this would be handled by your backend
      // For demo purposes, we'll save the notification to Firestore
      
      await this.saveNotification({
        userId: targetUserId,
        type: (data?.type as NotificationType) || 'system_update',
        title,
        body,
        data,
        read: false,
        priority: (data?.priority as 'low' | 'medium' | 'high') || 'medium',
      });

      // Mock server notification sending
      console.log('📤 Push notification sent to user:', targetUserId);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Create notification templates for different types
   */
  static getNotificationTemplate(
    type: NotificationType,
    data: Record<string, any>
  ): { title: string; body: string; priority: 'low' | 'medium' | 'high' } {
    switch (type) {
      case 'campaign_application':
        return {
          title: 'New Campaign Application! 🎯',
          body: `You have a new application for your ${data.campaignName} campaign.`,
          priority: 'high'
        };
      
      case 'campaign_approval':
        return {
          title: 'Campaign Approved! 🎉',
          body: `Congratulations! Your application for ${data.campaignName} has been approved.`,
          priority: 'high'
        };
      
      case 'campaign_rejection':
        return {
          title: 'Campaign Application Update',
          body: `Your application for ${data.campaignName} was not selected this time.`,
          priority: 'medium'
        };
      
      case 'new_follower':
        return {
          title: 'New Follower! 👥',
          body: `${data.followerName} started following you.`,
          priority: 'low'
        };
      
      case 'campaign_deadline':
        return {
          title: 'Campaign Deadline Reminder ⏰',
          body: `Your ${data.campaignName} campaign deadline is approaching in ${data.daysLeft} days.`,
          priority: 'high'
        };
      
      case 'payment_received':
        return {
          title: 'Payment Received! 💰',
          body: `You received $${data.amount} for ${data.campaignName}.`,
          priority: 'high'
        };
      
      case 'message_received':
        return {
          title: `Message from ${data.senderName} 💬`,
          body: data.preview || 'You have a new message.',
          priority: 'medium'
        };
      
      case 'tip_received':
        return {
          title: 'You received a tip! 🎁',
          body: `Someone tipped you $${data.amount}. Keep up the great content!`,
          priority: 'medium'
        };
      
      case 'verification_approved':
        return {
          title: 'Creator Verification Approved! ✅',
          body: 'Congratulations! Your creator account has been verified.',
          priority: 'high'
        };
      
      default:
        return {
          title: 'ZimBuzz Update',
          body: data.message || 'You have a new update.',
          priority: 'medium'
        };
    }
  }

  /**
   * Cleanup listeners when service is destroyed
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;