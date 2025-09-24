import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Switch,
  Divider,
  ProgressBar,
  Chip,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';
// Simple mock auth for now
const useAuth = () => ({
  user: { uid: '1', email: 'user@example.com', displayName: 'Test User' },
  logout: () => console.log('Logout clicked')
});

// Simple success message component
const AnimatedSuccessMessage = ({ visible, message, onDismiss, icon }: {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  icon?: string;
}) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);
  
  if (!visible) return null;
  
  return (
    <View style={{
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 1000,
      backgroundColor: colors.success,
      padding: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      <MaterialCommunityIcons name={icon || 'check-circle'} size={20} color={colors.white} style={{ marginRight: 8 }} />
      <Text style={{ color: colors.white, fontWeight: '600' }}>{message}</Text>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get('window');

// Mock user data
const mockUserProfile = {
  id: '1',
  name: 'Tafadzwa Mukamuri',
  username: '@tafa_zw',
  email: 'tafa@zimbuzz.com',
  bio: 'Content creator from Harare, Zimbabwe 🇿🇼\nPassionate about showcasing our beautiful culture',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616c0763e85',
  coverImage: 'https://images.unsplash.com/photo-1609890669528-26b77d8b6acd',
  location: 'Harare, Zimbabwe',
  website: 'https://tafamukamuri.co.zw',
  joinDate: '2023-08-15',
  isVerified: true,
  isPremium: false,
  stats: {
    followers: 25400,
    following: 847,
    posts: 342,
    campaignsCompleted: 12,
    totalEarnings: 2840,
    avgRating: 4.8,
  },
  preferences: {
    notifications: {
      campaigns: true,
      messages: true,
      marketing: false,
      updates: true,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      allowDirectMessages: true,
      publicProfile: true,
    },
  },
  portfolio: [
    {
      id: '1',
      title: 'Tourism Zimbabwe Campaign',
      image: 'https://images.unsplash.com/photo-1609890669528-26b77d8b6acd',
      category: 'Travel',
      completedDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Local Fashion Brand',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      category: 'Fashion',
      completedDate: '2024-01-10',
    },
    {
      id: '3',
      title: 'Food & Culture Series',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
      category: 'Food',
      completedDate: '2023-12-20',
    },
  ],
};

export default function ProfileScreen() {
  console.log('✅ ProfileScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'settings'>('overview');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [preferences, setPreferences] = useState(mockUserProfile.preferences);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const tabsAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(tabsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast('🔄 Profile updated!');
    }, 1500);
  };
  
  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };
  
  const dismissSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            showSuccessToast('👋 Logged out successfully!');
          },
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    showSuccessToast('✏️ Edit profile feature coming soon!');
  };
  
  const toggleNotificationPreference = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type as keyof typeof prev.notifications],
      },
    }));
    showSuccessToast('⚙️ Settings updated!');
  };
  
  const togglePrivacyPreference = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type as keyof typeof prev.privacy],
      },
    }));
    showSuccessToast('🔒 Privacy settings updated!');
  };
  
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
            <Text variant="titleMedium" style={styles.statNumber}>
              {mockUserProfile.stats.followers.toLocaleString()}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Followers</Text>
          </View>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <MaterialCommunityIcons name="briefcase" size={24} color={colors.success} />
            <Text variant="titleMedium" style={styles.statNumber}>
              {mockUserProfile.stats.campaignsCompleted}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Campaigns</Text>
          </View>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <MaterialCommunityIcons name="currency-usd" size={24} color={colors.warning} />
            <Text variant="titleMedium" style={styles.statNumber}>
              ${mockUserProfile.stats.totalEarnings}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Earned</Text>
          </View>
        </Card>
      </View>
      
      {/* Profile Completion */}
      <Card style={styles.completionCard}>
        <View style={styles.completionContent}>
          <Text variant="titleMedium" style={styles.completionTitle}>
            Profile Completion
          </Text>
          <Text variant="bodySmall" style={styles.completionSubtitle}>
            85% Complete - Add portfolio items to reach 100%
          </Text>
          <ProgressBar progress={0.85} color={colors.primary} style={styles.progressBar} />
        </View>
      </Card>
      
      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <List.Item
          title="Edit Profile"
          description="Update your profile information"
          left={props => <List.Icon {...props} icon="account-edit" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleEditProfile}
        />
        <Divider />
        <List.Item
          title="View Analytics"
          description="See your performance metrics"
          left={props => <List.Icon {...props} icon="chart-line" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showSuccessToast('📊 Analytics dashboard available!')}
        />
        <Divider />
        <List.Item
          title="Saved Items"
          description="View your bookmarked campaigns and tips"
          left={props => <List.Icon {...props} icon="bookmark" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showSuccessToast('🔖 Saved items coming soon!')}
        />
      </Card>
    </View>
  );
  
  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Your Portfolio
      </Text>
      <Text variant="bodyMedium" style={styles.sectionSubtitle}>
        Showcase your best campaign work
      </Text>
      
      {mockUserProfile.portfolio.map((item, index) => (
        <Card key={item.id} style={styles.portfolioCard}>
          <View style={styles.portfolioContent}>
            <Image source={{ uri: item.image }} style={styles.portfolioImage} />
            <View style={styles.portfolioInfo}>
              <Text variant="titleMedium" style={styles.portfolioTitle}>
                {item.title}
              </Text>
              <Chip style={styles.categoryChip} compact>
                {item.category}
              </Chip>
              <Text variant="bodySmall" style={styles.portfolioDate}>
                Completed: {new Date(item.completedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>
      ))}
      
      <Button
        mode="outlined"
        onPress={() => showSuccessToast('➕ Add portfolio item coming soon!')}
        icon="plus"
        style={styles.addButton}
      >
        Add Portfolio Item
      </Button>
    </View>
  );
  
  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      {/* Notification Settings */}
      <Card style={styles.settingsCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notifications
        </Text>
        <List.Item
          title="Campaign Updates"
          description="Get notified about new campaigns"
          left={props => <List.Icon {...props} icon="briefcase-outline" />}
          right={() => (
            <Switch
              value={preferences.notifications.campaigns}
              onValueChange={() => toggleNotificationPreference('campaigns')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Messages"
          description="Get notified about new messages"
          left={props => <List.Icon {...props} icon="message-outline" />}
          right={() => (
            <Switch
              value={preferences.notifications.messages}
              onValueChange={() => toggleNotificationPreference('messages')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Marketing Updates"
          description="Receive promotional content"
          left={props => <List.Icon {...props} icon="email-outline" />}
          right={() => (
            <Switch
              value={preferences.notifications.marketing}
              onValueChange={() => toggleNotificationPreference('marketing')}
            />
          )}
        />
      </Card>
      
      {/* Privacy Settings */}
      <Card style={styles.settingsCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Privacy
        </Text>
        <List.Item
          title="Public Profile"
          description="Allow others to find your profile"
          left={props => <List.Icon {...props} icon="account-outline" />}
          right={() => (
            <Switch
              value={preferences.privacy.publicProfile}
              onValueChange={() => togglePrivacyPreference('publicProfile')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Allow Direct Messages"
          description="Let others message you directly"
          left={props => <List.Icon {...props} icon="message-text-outline" />}
          right={() => (
            <Switch
              value={preferences.privacy.allowDirectMessages}
              onValueChange={() => togglePrivacyPreference('allowDirectMessages')}
            />
          )}
        />
      </Card>
      
      {/* Account Actions */}
      <Card style={styles.settingsCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
        <List.Item
          title="Change Password"
          description="Update your account password"
          left={props => <List.Icon {...props} icon="lock-outline" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showSuccessToast('🔑 Change password coming soon!')}
        />
        <Divider />
        <List.Item
          title="Export Data"
          description="Download your account data"
          left={props => <List.Icon {...props} icon="download-outline" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showSuccessToast('💾 Export data coming soon!')}
        />
        <Divider />
        <List.Item
          title="Delete Account"
          description="Permanently delete your account"
          left={props => <List.Icon {...props} icon="delete-outline" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showSuccessToast('⚠️ Account deletion coming soon!')}
          titleStyle={{ color: colors.error }}
        />
      </Card>
      
      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="logout"
        style={[styles.logoutButton, { borderColor: colors.error }]}
        labelStyle={{ color: colors.error }}
      >
        Logout
      </Button>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header with Cover Image */}
        <Animated.View style={[styles.headerContainer, { opacity: headerAnim }]}>
          <Image
            source={{ uri: mockUserProfile.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={100}
                source={{ uri: mockUserProfile.avatar }}
                style={styles.avatar}
              />
              {mockUserProfile.isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={24}
                  color={colors.primary}
                  style={styles.verifiedBadge}
                />
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {mockUserProfile.name}
              </Text>
              <Text variant="titleMedium" style={styles.userHandle}>
                {mockUserProfile.username}
              </Text>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text variant="bodySmall" style={styles.location}>
                  {mockUserProfile.location}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.bio}>
                {mockUserProfile.bio}
              </Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Tab Navigation */}
        <Animated.View style={[styles.tabsContainer, { opacity: tabsAnim }]}>
          {['overview', 'portfolio', 'settings'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab as typeof activeTab)}
            >
              <Text
                variant="labelLarge"
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Floating Edit Button */}
      {activeTab === 'overview' && (
        <FAB
          style={styles.fab}
          icon="pencil"
          onPress={handleEditProfile}
          label="Edit"
        />
      )}
      
      {/* Success Message */}
      <AnimatedSuccessMessage
        visible={showSuccess}
        message={successMessage}
        onDismiss={dismissSuccess}
        icon={successMessage.includes('🔄') ? 'reload' :
              successMessage.includes('⚙️') ? 'cog' :
              successMessage.includes('🔒') ? 'shield-check' :
              'check-circle'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  profileHeader: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    borderWidth: 4,
    borderColor: colors.surface,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  userInfo: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.md,
  },
  userName: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  userHandle: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  location: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  bio: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 60,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xs,
    ...shadow.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  tabContent: {
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  statContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  completionCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  completionContent: {
    padding: spacing.lg,
  },
  completionTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  completionSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  portfolioCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  portfolioContent: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  portfolioImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  portfolioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  portfolioTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  portfolioDate: {
    color: colors.textSecondary,
  },
  addButton: {
    marginTop: spacing.md,
    borderColor: colors.primary,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    backgroundColor: colors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});
