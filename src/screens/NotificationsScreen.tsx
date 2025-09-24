import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Chip,
  FAB,
  Menu,
  Divider,
  Button,
  Avatar,
  Badge,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Mock auth and notification types for now
const useAuth = () => ({ 
  user: { uid: 'user1' } 
});

type NotificationType = 
  | 'campaign_application'
  | 'campaign_approval'
  | 'campaign_rejection'
  | 'new_follower'
  | 'campaign_deadline'
  | 'payment_received'
  | 'message_received'
  | 'tip_received'
  | 'verification_approved'
  | 'verification_rejected'
  | 'system_update';

interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  imageUrl?: string;
}

// Mock notifications data
const mockNotifications: AppNotification[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'campaign_approval',
    title: 'Campaign Application Approved! 🎉',
    body: 'Congratulations! Your application for the Nike Air Jordan campaign has been approved.',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
  },
  {
    id: '2',
    userId: 'user1',
    type: 'new_follower',
    title: 'New Follower',
    body: 'Tafadzwa Mukamuri started following you.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616c0763e85'
  },
  {
    id: '3',
    userId: 'user1',
    type: 'payment_received',
    title: 'Payment Received 💰',
    body: 'You received $500 for completing the Tourism Zimbabwe campaign.',
    read: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: '4',
    userId: 'user1',
    type: 'message_received',
    title: 'New Message',
    body: 'Chipo Musarurwa sent you a message about a collaboration opportunity.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
  },
  {
    id: '5',
    userId: 'user1',
    type: 'campaign_deadline',
    title: 'Campaign Deadline Reminder ⏰',
    body: 'The deadline for the Spotify Music Discovery campaign is in 2 days.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  }
];

// Mock notification service
const notificationService = {
  subscribeToNotifications: (userId: string, callback: (notifications: AppNotification[]) => void) => {
    // Simulate real-time updates
    callback(mockNotifications);
    return () => {}; // Unsubscribe function
  },
  markAsRead: async (notificationId: string) => {
    console.log('Mark as read:', notificationId);
  },
  markAllAsRead: async (userId: string) => {
    console.log('Mark all as read for user:', userId);
  },
  clearAllNotifications: async () => {
    console.log('Clear all notifications');
  },
  sendLocalNotification: async (title: string, body: string, data: any, delay?: number) => {
    console.log('Send local notification:', title, body);
  }
};

const { width } = Dimensions.get('window');

// Colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  unread: '#E3F2FD'
};

interface NotificationsScreenProps {
  navigation?: any;
}

type FilterType = 'all' | 'unread' | 'campaigns' | 'messages' | 'payments' | 'follows';

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  console.log('✅ NotificationsScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'bell' },
    { key: 'unread', label: 'Unread', icon: 'bell-badge' },
    { key: 'campaigns', label: 'Campaigns', icon: 'briefcase' },
    { key: 'messages', label: 'Messages', icon: 'message' },
    { key: 'payments', label: 'Payments', icon: 'currency-usd' },
    { key: 'follows', label: 'Follows', icon: 'account-plus' }
  ];

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
        
        // Count unread notifications
        const unreadCount = newNotifications.filter(n => !n.read).length;
        setUnreadCount(unreadCount);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Filter notifications based on selected filter
  useEffect(() => {
    let filtered = notifications;

    switch (selectedFilter) {
      case 'unread':
        filtered = notifications.filter(n => !n.read);
        break;
      case 'campaigns':
        filtered = notifications.filter(n => 
          n.type.includes('campaign') || n.type === 'verification_approved' || n.type === 'verification_rejected'
        );
        break;
      case 'messages':
        filtered = notifications.filter(n => n.type === 'message_received');
        break;
      case 'payments':
        filtered = notifications.filter(n => 
          n.type === 'payment_received' || n.type === 'tip_received'
        );
        break;
      case 'follows':
        filtered = notifications.filter(n => n.type === 'new_follower');
        break;
      default:
        filtered = notifications;
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter]);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // The real-time listener will automatically update
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast('🔄 Notifications refreshed!');
    }, 1000);
  }, []);

  const handleNotificationPress = useCallback(async (notification: AppNotification) => {
    // Mark as read if unread
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }

    // Handle navigation based on notification type and data
    if (notification.actionUrl) {
      // Navigate to specific screen
      console.log('Navigate to:', notification.actionUrl);
    } else {
      // Default actions based on type
      switch (notification.type) {
        case 'campaign_application':
        case 'campaign_approval':
        case 'campaign_rejection':
          // Navigate to campaigns screen or specific campaign
          break;
        case 'message_received':
          // Navigate to messages
          break;
        case 'new_follower':
          // Navigate to profile or followers list
          break;
        default:
          break;
      }
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await notificationService.markAllAsRead(user.uid);
      // Update local state
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      showSuccessToast('✓ All notifications marked as read!');
    } catch (error) {
      showSuccessToast('⚠️ Failed to mark notifications as read');
    }
  }, [user?.uid, notifications]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAllNotifications();
              setNotifications([]);
              showSuccessToast('🗑️ All notifications cleared!');
            } catch (error) {
              showSuccessToast('⚠️ Failed to clear notifications');
            }
          }
        }
      ]
    );
  }, []);

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'campaign_application':
        return 'briefcase-plus';
      case 'campaign_approval':
        return 'check-circle';
      case 'campaign_rejection':
        return 'close-circle';
      case 'new_follower':
        return 'account-plus';
      case 'campaign_deadline':
        return 'clock-alert';
      case 'payment_received':
        return 'currency-usd';
      case 'message_received':
        return 'message';
      case 'tip_received':
        return 'gift';
      case 'verification_approved':
        return 'check-decagram';
      case 'verification_rejected':
        return 'close-octagon';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'campaign_approval':
      case 'payment_received':
      case 'verification_approved':
        return colors.success;
      case 'campaign_rejection':
      case 'verification_rejected':
        return colors.error;
      case 'campaign_deadline':
        return colors.warning;
      case 'tip_received':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const formatTimeAgo = (date: Date | any): string => {
    const now = new Date();
    const notificationDate = date instanceof Date ? date : date.toDate();
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  const sendTestNotification = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await notificationService.sendLocalNotification(
        'Test Notification 🧪',
        'This is a test notification from ZimBuzz!',
        { type: 'system_update' },
        2 // 2 second delay
      );
      
      Alert.alert('Test Sent', 'A test notification will appear in 2 seconds');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  }, [user?.uid]);

  const renderNotificationItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <Card 
        style={[
          styles.notificationCard,
          !item.read && styles.unreadCard
        ]} 
        elevation={item.read ? 1 : 2}
      >
        <Card.Content style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getNotificationIcon(item.type) as any}
                size={24}
                color={getNotificationColor(item.type)}
              />
              {!item.read && <Badge style={styles.unreadBadge} size={8} />}
            </View>
            
            <View style={styles.notificationBody}>
              <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
                {item.title}
              </Text>
              <Text style={styles.notificationText} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.timeText}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>

            {item.imageUrl && (
              <Avatar.Image
                size={40}
                source={{ uri: item.imageUrl }}
                style={styles.notificationImage}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="bell-sleep" 
        size={64} 
        color={colors.muted} 
      />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === 'unread' 
          ? "You're all caught up!" 
          : "You'll see campaign updates, messages, and other activity here"}
      </Text>
      
      {selectedFilter === 'all' && (
        <Button 
          mode="outlined" 
          onPress={sendTestNotification}
          style={styles.testButton}
          icon="flask"
        >
          Send Test Notification
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with filter chips */}
      <View style={styles.headerContainer}>
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={filterOptions}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                key={item.key}
                selected={selectedFilter === item.key}
                onPress={() => setSelectedFilter(item.key as FilterType)}
                icon={item.icon}
                style={[
                  styles.filterChip,
                  selectedFilter === item.key && styles.selectedChip
                ]}
                textStyle={selectedFilter === item.key ? styles.selectedChipText : styles.chipText}
              >
                {item.label}
                {item.key === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
              </Chip>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {notifications.length > 0 && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
                iconColor={colors.primary}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleMarkAllAsRead();
              }}
              title="Mark all as read"
              leadingIcon="check-all"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleClearAll();
              }}
              title="Clear all"
              leadingIcon="delete"
              titleStyle={{ color: colors.error }}
            />
          </Menu>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Success Message */}
      {showSuccess && (
        <View style={styles.successMessage}>
          <MaterialCommunityIcons name="check-circle" size={20} color={colors.white} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      {/* FAB for test notifications (development only) */}
      {__DEV__ && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={sendTestNotification}
          label="Test"
          small
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.background,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
  },
  selectedChipText: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  unreadCard: {
    backgroundColor: colors.unread,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    paddingVertical: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    marginTop: 2,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.muted,
  },
  notificationImage: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  testButton: {
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  successMessage: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },
  successText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
});

export default NotificationsScreen;