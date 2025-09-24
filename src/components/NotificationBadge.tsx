import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationBadgeProps {
  children: React.ReactNode;
  type?: 'all' | 'campaigns' | 'messages';
  showZero?: boolean;
}

const colors = {
  primary: '#2E7D32',
  error: '#D32F2F',
  white: '#FFFFFF',
};

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  children, 
  type = 'all',
  showZero = false 
}) => {
  const { unreadCount, getUnreadCountByType } = useNotifications();

  const getBadgeCount = () => {
    switch (type) {
      case 'campaigns':
        return getUnreadCountByType('campaign');
      case 'messages':
        return getUnreadCountByType('message');
      default:
        return unreadCount;
    }
  };

  const badgeCount = getBadgeCount();
  const shouldShowBadge = badgeCount > 0 || (showZero && badgeCount === 0);

  return (
    <View style={styles.container}>
      {children}
      {shouldShowBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});

export default NotificationBadge;