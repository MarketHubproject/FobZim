import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { notificationService, AppNotification } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refreshNotifications: () => void;
  getUnreadCountByType: (type: string) => number;
  isInitialized: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notification service when user is available
  useEffect(() => {
    if (user?.uid && !isInitialized) {
      initializeNotifications();
    }
  }, [user?.uid, isInitialized]);

  const initializeNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Initialize the notification service
      await notificationService.initialize(user?.uid);
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToNotifications(
        user!.uid,
        (newNotifications) => {
          setNotifications(newNotifications);
          
          // Calculate unread count
          const unreadCount = newNotifications.filter(n => !n.read).length;
          setUnreadCount(unreadCount);
          
          // Update app badge
          notificationService.updateBadgeCount(unreadCount);
          
          setLoading(false);
        }
      );

      setIsInitialized(true);
      
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setLoading(false);
    }
  }, [user?.uid]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await notificationService.markAllAsRead(user.uid);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      // Update app badge
      await notificationService.updateBadgeCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.uid]);

  const sendTestNotification = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Create a test notification template
      const testTypes = [
        'campaign_approval',
        'new_follower', 
        'payment_received',
        'tip_received',
        'campaign_deadline'
      ];
      
      const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];
      const template = notificationService.constructor.getNotificationTemplate(randomType as any, {
        campaignName: 'EcoCash Digital Campaign',
        followerName: 'Jane Mukamuri',
        amount: '25',
        daysLeft: '3'
      });

      // Send local notification
      await notificationService.sendLocalNotification(
        template.title,
        template.body,
        { 
          type: randomType,
          priority: template.priority,
          actionUrl: `/campaign/demo-campaign-123`
        },
        1 // 1 second delay
      );

      // Also save to Firestore for persistence
      await notificationService.saveNotification({
        userId: user.uid,
        type: randomType as any,
        title: template.title,
        body: template.body,
        data: { 
          type: randomType,
          actionUrl: `/campaign/demo-campaign-123`
        },
        read: false,
        priority: template.priority
      });

    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, [user?.uid]);

  const refreshNotifications = useCallback(() => {
    // The real-time subscription will automatically update
    // This is mainly for UI refresh triggers
    if (user?.uid) {
      notificationService.subscribeToNotifications(
        user.uid,
        (newNotifications) => {
          setNotifications(newNotifications);
          const unreadCount = newNotifications.filter(n => !n.read).length;
          setUnreadCount(unreadCount);
        }
      );
    }
  }, [user?.uid]);

  const getUnreadCountByType = useCallback((type: string) => {
    return notifications.filter(n => !n.read && n.type.includes(type)).length;
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
    refreshNotifications,
    getUnreadCountByType,
    isInitialized
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;