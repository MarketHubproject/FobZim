import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Share,
  Linking,
} from 'react-native';
import {
  Card,
  Button,
  Appbar,
  Avatar,
  Badge,
  Chip,
  Divider,
  List,
  Switch,
  Portal,
  Modal,
  TextInput,
  IconButton,
  Surface,
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  border: '#E5E7EB',
  success: '#00C853',
  warning: '#FF9800',
  error: '#F44336',
  accent: '#1976D2',
  gold: '#FFD700',
  gradientStart: '#2E7D32',
  gradientEnd: '#4CAF50',
};

// Mock user profile data
const mockProfile = {
  id: 'user_123',
  name: 'Tendai Mukamuri',
  username: '@tendai_creates',
  bio: 'Travel & lifestyle content creator showcasing the beauty of Zimbabwe 🇿🇼 | Brand partnerships & collaborations welcome',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=300',
  coverImage: 'https://images.unsplash.com/photo-1586276393851-8cb65d96ebb2?w=800',
  isVerified: true,
  location: 'Harare, Zimbabwe',
  joinDate: 'March 2023',
  website: 'www.tendaicreates.com',
  email: 'tendai@example.com',
  phone: '+263 77 123 4567',
  followers: 15240,
  following: 892,
  totalCampaigns: 47,
  completedCampaigns: 42,
  rating: 4.8,
  totalEarnings: 12450,
  categories: ['Travel', 'Lifestyle', 'Fashion', 'Food'],
  socialMedia: {
    instagram: '@tendai_creates',
    tiktok: '@tendaicreates',
    youtube: 'Tendai Creates',
    twitter: '@tendai_creates',
  },
  metrics: {
    profileViews: 5420,
    campaignApplications: 67,
    successRate: 89,
    responseTime: '2 hours',
    averageRating: 4.8,
    totalReviews: 38,
  },
  achievements: [
    { id: '1', name: 'Rising Star', description: 'Completed first 5 campaigns', icon: 'star', earned: true },
    { id: '2', name: 'Travel Expert', description: '20+ travel campaigns', icon: 'airplane', earned: true },
    { id: '3', name: 'Brand Favorite', description: '4.8+ average rating', icon: 'heart', earned: true },
    { id: '4', name: 'Social Influencer', description: '10k+ followers', icon: 'account-group', earned: true },
    { id: '5', name: 'Content Master', description: '50+ campaigns completed', icon: 'trophy', earned: false },
    { id: '6', name: 'Community Leader', description: 'Help 10+ new creators', icon: 'account-star', earned: false },
  ],
  recentActivity: [
    { id: '1', type: 'campaign_completed', title: 'Zimbabwe Tourism Campaign', date: '2 days ago', icon: 'check-circle' },
    { id: '2', type: 'collaboration', title: 'Collaborated with @chipo_styles', date: '5 days ago', icon: 'account-group' },
    { id: '3', type: 'achievement', title: 'Earned "Brand Favorite" badge', date: '1 week ago', icon: 'trophy' },
    { id: '4', type: 'review_received', title: 'New 5-star review from EcoStyle', date: '1 week ago', icon: 'star' },
    { id: '5', type: 'campaign_applied', title: 'Applied for Sustainable Fashion showcase', date: '2 weeks ago', icon: 'briefcase' },
  ],
};

const settingsOptions = [
  {
    section: 'Account',
    items: [
      { id: 'edit_profile', title: 'Edit Profile', subtitle: 'Update your information', icon: 'account-edit', hasSwitch: false },
      { id: 'privacy', title: 'Privacy Settings', subtitle: 'Control who can see your profile', icon: 'shield-account', hasSwitch: false },
      { id: 'notifications', title: 'Notifications', subtitle: 'Manage notification preferences', icon: 'bell', hasSwitch: false },
      { id: 'social_media', title: 'Social Media Links', subtitle: 'Connect your social accounts', icon: 'link', hasSwitch: false },
    ]
  },
  {
    section: 'Creator Tools',
    items: [
      { id: 'portfolio', title: 'Portfolio Manager', subtitle: 'Manage your content showcase', icon: 'folder-image', hasSwitch: false },
      { id: 'analytics', title: 'Analytics Dashboard', subtitle: 'View detailed performance metrics', icon: 'chart-line', hasSwitch: false },
      { id: 'earnings', title: 'Earnings & Payments', subtitle: 'Track income and payouts', icon: 'cash', hasSwitch: false },
      { id: 'availability', title: 'Availability Calendar', subtitle: 'Manage your schedule', icon: 'calendar', hasSwitch: false },
    ]
  },
  {
    section: 'Preferences',
    items: [
      { id: 'push_notifications', title: 'Push Notifications', subtitle: 'New campaigns and messages', icon: 'bell-ring', hasSwitch: true, value: true },
      { id: 'email_notifications', title: 'Email Updates', subtitle: 'Weekly newsletter and updates', icon: 'email', hasSwitch: true, value: true },
      { id: 'profile_visibility', title: 'Public Profile', subtitle: 'Show profile in creator directory', icon: 'eye', hasSwitch: true, value: true },
      { id: 'collaboration_requests', title: 'Collaboration Requests', subtitle: 'Allow other creators to contact you', icon: 'handshake', hasSwitch: true, value: true },
    ]
  },
  {
    section: 'Support',
    items: [
      { id: 'help_center', title: 'Help Center', subtitle: 'FAQs and tutorials', icon: 'help-circle', hasSwitch: false },
      { id: 'contact_support', title: 'Contact Support', subtitle: 'Get help from our team', icon: 'message-text', hasSwitch: false },
      { id: 'feedback', title: 'Send Feedback', subtitle: 'Help us improve ZimBuzz', icon: 'message-star', hasSwitch: false },
      { id: 'rate_app', title: 'Rate ZimBuzz', subtitle: 'Share your experience', icon: 'star', hasSwitch: false },
    ]
  },
  {
    section: 'Legal',
    items: [
      { id: 'terms', title: 'Terms of Service', subtitle: 'Read our terms and conditions', icon: 'file-document', hasSwitch: false },
      { id: 'privacy_policy', title: 'Privacy Policy', subtitle: 'How we handle your data', icon: 'shield-check', hasSwitch: false },
      { id: 'data_export', title: 'Export Data', subtitle: 'Download your account data', icon: 'download', hasSwitch: false },
      { id: 'delete_account', title: 'Delete Account', subtitle: 'Permanently delete your account', icon: 'delete', hasSwitch: false },
    ]
  },
];

interface ProfileSection {
  section: string;
  items: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    hasSwitch: boolean;
    value?: boolean;
  }[];
}

export default function EnhancedProfileScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState(mockProfile);
  const [settings, setSettings] = useState<{[key: string]: boolean}>({
    push_notifications: true,
    email_notifications: true,
    profile_visibility: true,
    collaboration_requests: true,
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-line' },
    { id: 'activity', label: 'Activity', icon: 'history' },
    { id: 'settings', label: 'Settings', icon: 'cog' },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${mockProfile.name}'s creator profile on ZimBuzz! ${mockProfile.username}`,
        url: `https://zimbuzz.com/creator/${mockProfile.username}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share profile');
    }
  };

  const handleSocialMediaOpen = (platform: string, handle: string) => {
    const urls = {
      instagram: `https://instagram.com/${handle.replace('@', '')}`,
      tiktok: `https://tiktok.com/@${handle.replace('@', '')}`,
      youtube: `https://youtube.com/c/${handle.replace('@', '')}`,
      twitter: `https://twitter.com/${handle.replace('@', '')}`,
    };
    
    const url = urls[platform as keyof typeof urls];
    if (url) {
      Linking.openURL(url).catch(() => 
        Alert.alert('Error', 'Unable to open social media app')
      );
    }
  };

  const handleSettingToggle = (settingId: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));
  };

  const handleSettingPress = (itemId: string) => {
    const actions: {[key: string]: () => void} = {
      edit_profile: () => setEditModalVisible(true),
      privacy: () => Alert.alert('Privacy Settings', 'Privacy settings will be available in the next update'),
      notifications: () => Alert.alert('Notification Settings', 'Detailed notification preferences coming soon'),
      social_media: () => Alert.alert('Social Media', 'Link management feature coming soon'),
      portfolio: () => Alert.alert('Portfolio Manager', 'Portfolio management tools coming soon'),
      analytics: () => setActiveTab('analytics'),
      earnings: () => Alert.alert('Earnings Dashboard', 'Detailed earnings tracking coming soon'),
      availability: () => Alert.alert('Availability Calendar', 'Schedule management coming soon'),
      help_center: () => Alert.alert('Help Center', 'Visit our website for FAQs and tutorials'),
      contact_support: () => Alert.alert('Contact Support', 'Email: support@zimbuzz.com\nPhone: +263 4 123 4567'),
      feedback: () => Alert.alert('Send Feedback', 'Your feedback helps us improve ZimBuzz!'),
      rate_app: () => Alert.alert('Rate ZimBuzz', 'Please rate us on the app store!'),
      terms: () => Alert.alert('Terms of Service', 'Terms and conditions will open in browser'),
      privacy_policy: () => Alert.alert('Privacy Policy', 'Privacy policy will open in browser'),
      data_export: () => Alert.alert('Export Data', 'Data export feature coming soon'),
      delete_account: () => Alert.alert('Delete Account', 'This action cannot be undone. Contact support for assistance.'),
    };

    const action = actions[itemId];
    if (action) {
      action();
    }
  };

  const renderProfileHeader = () => (
    <View style={styles.headerContainer}>
      {/* Cover Image */}
      <View style={styles.coverImageContainer}>
        <Image source={{ uri: mockProfile.coverImage }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.coverGradient}
        />
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.avatarContainer}>
          <Avatar.Image source={{ uri: mockProfile.avatar }} size={100} />
          {mockProfile.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={24} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{mockProfile.name}</Text>
          <Text style={styles.profileUsername}>{mockProfile.username}</Text>
          <Text style={styles.profileBio}>{mockProfile.bio}</Text>
          
          <View style={styles.profileMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{mockProfile.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>Joined {mockProfile.joinDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star" size={16} color={colors.gold} />
              <Text style={styles.metaText}>{mockProfile.rating} rating</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => setEditModalVisible(true)}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            contentStyle={styles.actionButtonContent}
          >
            Edit Profile
          </Button>
          <Button
            mode="outlined"
            onPress={handleShare}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Share
          </Button>
        </View>
      </View>
    </View>
  );

  const renderStatsRow = () => (
    <Surface style={styles.statsContainer}>
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{mockProfile.followers.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      <Divider style={styles.statDivider} />
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{mockProfile.following.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
      <Divider style={styles.statDivider} />
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{mockProfile.completedCampaigns}</Text>
        <Text style={styles.statLabel}>Campaigns</Text>
      </TouchableOpacity>
      <Divider style={styles.statDivider} />
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>${mockProfile.totalEarnings.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Earned</Text>
      </TouchableOpacity>
    </Surface>
  );

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Categories */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="tag" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <View style={styles.categoriesContainer}>
            {mockProfile.categories.map((category) => (
              <Chip key={category} style={styles.categoryChip} textStyle={styles.categoryChipText}>
                {category}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Social Media */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="share-variant" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Social Media</Text>
          </View>
          <View style={styles.socialMediaContainer}>
            {Object.entries(mockProfile.socialMedia).map(([platform, handle]) => (
              <TouchableOpacity
                key={platform}
                style={styles.socialMediaItem}
                onPress={() => handleSocialMediaOpen(platform, handle)}
              >
                <MaterialCommunityIcons
                  name={platform as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.socialMediaHandle}>{handle}</Text>
                <MaterialCommunityIcons name="open-in-new" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Achievements */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="trophy" size={24} color={colors.gold} />
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => setAchievementsModalVisible(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsPreview}>
            {mockProfile.achievements.slice(0, 4).map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { opacity: achievement.earned ? 1 : 0.3 }]}>
                  <MaterialCommunityIcons
                    name={achievement.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={24}
                    color={achievement.earned ? colors.gold : colors.muted}
                  />
                </View>
                <Text style={[styles.achievementName, { opacity: achievement.earned ? 1 : 0.5 }]}>
                  {achievement.name}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Performance Overview */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Performance Overview</Text>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockProfile.metrics.profileViews.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Profile Views</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockProfile.metrics.campaignApplications}</Text>
              <Text style={styles.metricLabel}>Applications</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockProfile.metrics.successRate}%</Text>
              <Text style={styles.metricLabel}>Success Rate</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockProfile.metrics.responseTime}</Text>
              <Text style={styles.metricLabel}>Response Time</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Campaign Completion Rate</Text>
            <ProgressBar
              progress={mockProfile.completedCampaigns / mockProfile.totalCampaigns}
              color={colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {mockProfile.completedCampaigns} of {mockProfile.totalCampaigns} campaigns completed
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Reviews Summary */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star" size={24} color={colors.gold} />
            <Text style={styles.sectionTitle}>Reviews & Rating</Text>
          </View>
          
          <View style={styles.ratingOverview}>
            <View style={styles.ratingLeft}>
              <Text style={styles.ratingNumber}>{mockProfile.metrics.averageRating}</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name="star"
                    size={20}
                    color={star <= Math.floor(mockProfile.metrics.averageRating) ? colors.gold : colors.muted}
                  />
                ))}
              </View>
              <Text style={styles.reviewsCount}>{mockProfile.metrics.totalReviews} reviews</Text>
            </View>
            <View style={styles.ratingRight}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = rating === 5 ? 75 : rating === 4 ? 20 : rating === 3 ? 3 : rating === 2 ? 1 : 1;
                return (
                  <View key={rating} style={styles.ratingRow}>
                    <Text style={styles.ratingRowLabel}>{rating}</Text>
                    <ProgressBar
                      progress={percentage / 100}
                      color={colors.gold}
                      style={styles.ratingProgressBar}
                    />
                    <Text style={styles.ratingRowPercentage}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderActivityTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          
          {mockProfile.recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons
                  name={activity.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {settingsOptions.map((section) => (
        <Card key={section.section} style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.settingsSectionTitle}>{section.section}</Text>
            {section.items.map((item) => (
              <List.Item
                key={item.id}
                title={item.title}
                description={item.subtitle}
                left={(props) => (
                  <MaterialCommunityIcons
                    name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={24}
                    color={colors.primary}
                    style={{ marginRight: 16, marginTop: 8 }}
                  />
                )}
                right={(props) =>
                  item.hasSwitch ? (
                    <Switch
                      value={settings[item.id] || false}
                      onValueChange={(value) => handleSettingToggle(item.id, value)}
                      color={colors.primary}
                    />
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
                  )
                }
                onPress={() => !item.hasSwitch && handleSettingPress(item.id)}
                style={styles.settingsItem}
              />
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <IconButton
            icon="close"
            onPress={() => setEditModalVisible(false)}
          />
        </View>
        
        <ScrollView style={styles.modalBody}>
          <TextInput
            label="Name"
            value={editedProfile.name}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <TextInput
            label="Bio"
            value={editedProfile.bio}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
            style={styles.modalInput}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            label="Location"
            value={editedProfile.location}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, location: text }))}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <TextInput
            label="Website"
            value={editedProfile.website}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, website: text }))}
            style={styles.modalInput}
            mode="outlined"
          />
        </ScrollView>
        
        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setEditModalVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              Alert.alert('Success', 'Profile updated successfully!');
              setEditModalVisible(false);
            }}
            style={styles.modalButton}
            buttonColor={colors.primary}
          >
            Save Changes
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderAchievementsModal = () => (
    <Portal>
      <Modal
        visible={achievementsModalVisible}
        onDismiss={() => setAchievementsModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Achievements</Text>
          <IconButton
            icon="close"
            onPress={() => setAchievementsModalVisible(false)}
          />
        </View>
        
        <ScrollView style={styles.modalBody}>
          {mockProfile.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementModalItem}>
              <View style={[styles.achievementModalIcon, { opacity: achievement.earned ? 1 : 0.3 }]}>
                <MaterialCommunityIcons
                  name={achievement.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={32}
                  color={achievement.earned ? colors.gold : colors.muted}
                />
              </View>
              <View style={styles.achievementModalContent}>
                <Text style={[styles.achievementModalName, { opacity: achievement.earned ? 1 : 0.5 }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementModalDescription, { opacity: achievement.earned ? 1 : 0.5 }]}>
                  {achievement.description}
                </Text>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <MaterialCommunityIcons name="check" size={16} color={colors.white} />
                    <Text style={styles.earnedText}>Earned</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon="share-variant"
          iconColor={colors.white}
          onPress={handleShare}
        />
        <Appbar.Action
          icon="dots-vertical"
          iconColor={colors.white}
          onPress={() => Alert.alert('More Options', 'Additional profile options coming soon!')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Stats Row */}
        {renderStatsRow()}

        {/* Tab Navigation */}
        <Surface style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <MaterialCommunityIcons
                  name={tab.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                  color={activeTab === tab.id ? colors.primary : colors.muted}
                />
                <Text style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? colors.primary : colors.muted }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </View>
      </ScrollView>

      {/* Modals */}
      {renderEditModal()}
      {renderAchievementsModal()}

      {/* Floating Action Button */}
      <FAB
        icon="qrcode"
        style={styles.fab}
        onPress={() => Alert.alert('QR Code', 'Show profile QR code for easy sharing')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  coverImageContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  profileInfoContainer: {
    padding: 20,
    paddingTop: 0,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  profileDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  profileMeta: {
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    height: 48,
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },

  // Tab Styles
  tabContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 120,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Section Styles
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // Categories Styles
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.white,
    fontSize: 12,
  },

  // Social Media Styles
  socialMediaContainer: {
    gap: 12,
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  socialMediaHandle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },

  // Achievements Styles
  achievementsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  achievementItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Analytics Styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  metricItem: {
    width: (width - 80) / 2,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Rating Styles
  ratingOverview: {
    flexDirection: 'row',
    gap: 20,
  },
  ratingLeft: {
    alignItems: 'center',
    flex: 1,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingRight: {
    flex: 2,
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingRowLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    width: 12,
  },
  ratingProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  ratingRowPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },

  // Activity Styles
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Settings Styles
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  settingsItem: {
    paddingVertical: 8,
  },

  // Modal Styles
  modalContent: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 12,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalBody: {
    paddingHorizontal: 20,
    maxHeight: height * 0.5,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },

  // Achievement Modal Styles
  achievementModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  achievementModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementModalContent: {
    flex: 1,
  },
  achievementModalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  achievementModalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  earnedText: {
    fontSize: 12,
    color: colors.white,
    marginLeft: 4,
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});