import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { 
  Card, 
  Button, 
  Appbar, 
  Chip, 
  Avatar, 
  Badge,
  Searchbar,
  FAB
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
};

// Mock data
const featuredCampaigns = [
  {
    id: '1',
    title: 'Zimbabwe Tourism Campaign',
    brand: 'Tourism Authority',
    budget: '$500',
    deadline: '5 days left',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    description: 'Showcase the beauty of Zimbabwe through engaging content',
    applicants: 12,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Local Fashion Showcase',
    brand: 'ZimStyle',
    budget: '$300',
    deadline: '3 days left',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    description: 'Promote emerging Zimbabwean fashion designers',
    applicants: 8,
    isFeatured: false,
  },
];

const trendingCreators = [
  {
    id: '1',
    name: 'Tanaka Moyo',
    category: 'Lifestyle',
    followers: '25.5K',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: true,
    growth: '+12%',
  },
  {
    id: '2',
    name: 'Chipo Mukamuri',
    category: 'Fashion',
    followers: '18.2K',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=150',
    isVerified: false,
    growth: '+8%',
  },
  {
    id: '3',
    name: 'Blessing Chitapa',
    category: 'Travel',
    followers: '32.1K',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isVerified: true,
    growth: '+15%',
  },
];

const dailyTips = [
  "Post consistently to maintain audience engagement",
  "Use local hashtags like #ZimbabweCreators to reach your audience",
  "Collaborate with other creators to expand your reach",
  "Always disclose sponsored content transparently",
  "Engage with your followers through comments and DMs",
];

const statsData = [
  { label: 'Active Campaigns', value: '47', icon: 'briefcase', color: colors.primary },
  { label: 'Total Creators', value: '1.2K', icon: 'account-group', color: colors.secondary },
  { label: 'Success Rate', value: '89%', icon: 'chart-line', color: colors.success },
];

export default function EnhancedHomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);

  const categories = ['All', 'Fashion', 'Lifestyle', 'Travel', 'Food', 'Tech'];
  const todaysTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  const handleSaveCampaign = (campaignId: string) => {
    if (savedCampaigns.includes(campaignId)) {
      setSavedCampaigns(prev => prev.filter(id => id !== campaignId));
      Alert.alert('Success', 'Campaign removed from saved items');
    } else {
      setSavedCampaigns(prev => [...prev, campaignId]);
      Alert.alert('Success', 'Campaign saved successfully!');
    }
  };

  const handleFollowCreator = (creatorId: string) => {
    if (followedCreators.includes(creatorId)) {
      setFollowedCreators(prev => prev.filter(id => id !== creatorId));
    } else {
      setFollowedCreators(prev => [...prev, creatorId]);
      Alert.alert('Success', 'Now following creator!');
    }
  };

  const handleApplyToCampaign = (campaign: any) => {
    Alert.alert(
      'Apply to Campaign',
      `Would you like to apply to "${campaign.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: () => Alert.alert('Success', 'Application submitted successfully!') 
        },
      ]
    );
  };

  const renderCampaignCard = ({ item }: { item: any }) => (
    <Card style={[styles.campaignCard, item.isFeatured && styles.featuredCard]}>
      <Image source={{ uri: item.image }} style={styles.campaignImage} />
      {item.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>FEATURED</Text>
        </View>
      )}
      
      <Card.Content style={styles.campaignContent}>
        <Text style={styles.campaignTitle}>{item.title}</Text>
        <Text style={styles.brandName}>{item.brand}</Text>
        <Text style={styles.campaignDescription}>{item.description}</Text>
        
        <View style={styles.campaignMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="currency-usd" size={16} color={colors.success} />
            <Text style={styles.budgetText}>{item.budget}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.warning} />
            <Text style={styles.deadlineText}>{item.deadline}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.muted} />
            <Text style={styles.applicantsText}>{item.applicants} applied</Text>
          </View>
        </View>

        <View style={styles.campaignActions}>
          <Button 
            mode="contained" 
            onPress={() => handleApplyToCampaign(item)}
            style={styles.applyButton}
            buttonColor={colors.primary}
            labelStyle={styles.buttonLabel}
          >
            Apply Now
          </Button>
          <TouchableOpacity 
            onPress={() => handleSaveCampaign(item.id)}
            style={styles.saveButton}
          >
            <MaterialCommunityIcons 
              name={savedCampaigns.includes(item.id) ? "bookmark" : "bookmark-outline"}
              size={24} 
              color={savedCampaigns.includes(item.id) ? colors.primary : colors.muted} 
            />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCreatorCard = ({ item }: { item: any }) => (
    <Card style={styles.creatorCard}>
      <TouchableOpacity style={styles.creatorContent}>
        <Avatar.Image 
          source={{ uri: item.avatar }} 
          size={60}
          style={styles.creatorAvatar}
        />
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>{item.name}</Text>
          <Text style={styles.creatorCategory}>{item.category}</Text>
          <View style={styles.creatorStats}>
            <Text style={styles.followersText}>{item.followers} followers</Text>
            <Text style={styles.growthText}>{item.growth} this month</Text>
          </View>
        </View>
        
        <Button 
          mode={followedCreators.includes(item.id) ? "outlined" : "contained"}
          onPress={() => handleFollowCreator(item.id)}
          style={styles.followButton}
          buttonColor={followedCreators.includes(item.id) ? 'transparent' : colors.primary}
          textColor={followedCreators.includes(item.id) ? colors.primary : colors.white}
          labelStyle={styles.followButtonLabel}
        >
          {followedCreators.includes(item.id) ? 'Following' : 'Follow'}
        </Button>
      </TouchableOpacity>
    </Card>
  );

  const renderStatsCard = ({ item }: { item: any }) => (
    <Card style={styles.statsCard}>
      <Card.Content style={styles.statsContent}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
        <Text style={styles.statsValue}>{item.value}</Text>
        <Text style={styles.statsLabel}>{item.label}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content 
          title="FobZim" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon="bell-outline" 
          iconColor={colors.white}
          onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')} 
        />
        <Appbar.Action 
          icon="account-circle-outline" 
          iconColor={colors.white}
          onPress={() => Alert.alert('Profile', 'Navigate to profile')} 
        />
      </Appbar.Header>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome back! 🇿🇼</Text>
          <Text style={styles.subtitle}>Discover new opportunities and connect with brands</Text>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search campaigns, creators..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />

        {/* Stats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Stats</Text>
        </View>
        <FlatList
          data={statsData}
          renderItem={renderStatsCard}
          keyExtractor={item => item.label}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        />

        {/* Daily Tip */}
        <Card style={styles.tipCard}>
          <Card.Content>
            <View style={styles.tipHeader}>
              <MaterialCommunityIcons name="lightbulb" size={24} color={colors.secondary} />
              <Text style={styles.tipTitle}>Creator Tip of the Day</Text>
            </View>
            <Text style={styles.tipText}>{todaysTip}</Text>
          </Card.Content>
        </Card>

        {/* Featured Campaigns */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Campaigns</Text>
          <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to all campaigns')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredCampaigns}
          renderItem={renderCampaignCard}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Creators */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Creators</Text>
          <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to all creators')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={trendingCreators}
          renderItem={renderCreatorCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />

        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => Alert.alert('Create', 'Create new campaign or content')}
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
  contentContainer: {
    paddingBottom: 100,
  },
  welcomeSection: {
    padding: 16,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsCard: {
    marginRight: 12,
    minWidth: 100,
    elevation: 2,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  tipCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  campaignCard: {
    width: width * 0.85,
    marginRight: 16,
    elevation: 3,
    backgroundColor: colors.surface,
  },
  featuredCard: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  campaignImage: {
    height: 160,
    width: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  campaignContent: {
    padding: 16,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
  },
  applicantsText: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 4,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    marginRight: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  creatorCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  creatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  creatorAvatar: {
    marginRight: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    left: 52,
    top: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 2,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  creatorCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  creatorStats: {
    marginTop: 4,
  },
  followersText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  growthText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  followButton: {
    marginLeft: 12,
  },
  followButtonLabel: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  spacer: {
    height: 20,
  },
});