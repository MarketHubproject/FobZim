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

// Enhanced Mock Data - Zimbabwe-focused
const featuredCampaigns = [
  {
    id: '1',
    title: 'Visit Zimbabwe - Victoria Falls Experience',
    brand: 'Zimbabwe Tourism Authority',
    budget: '$1,200',
    deadline: '5 days left',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    description: 'Showcase Victoria Falls as the adventure capital of Africa',
    applicants: 24,
    isFeatured: true,
    category: 'Travel',
    location: 'Victoria Falls',
    requirements: ['Travel Content', '10K+ Followers', 'English/Shona'],
    duration: '5 days',
    deliverables: '15 posts, 5 stories, 2 reels',
    applicationStatus: null,
  },
  {
    id: '2',
    title: 'Zimbabwean Fashion Heritage',
    brand: 'House of Zhama',
    budget: '$800',
    deadline: '3 days left',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    description: 'Promote traditional Zimbabwean fashion with modern twists',
    applicants: 18,
    isFeatured: false,
    category: 'Fashion',
    location: 'Harare',
    requirements: ['Fashion Content', '5K+ Followers', 'Zimbabwe-based'],
    duration: '3 days',
    deliverables: '10 posts, 8 stories',
    applicationStatus: 'pending',
  },
  {
    id: '3',
    title: 'Taste of Zimbabwe Food Festival',
    brand: 'ZimCuisine Co.',
    budget: '$600',
    deadline: '7 days left',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    description: 'Feature authentic Zimbabwean dishes and cooking traditions',
    applicants: 15,
    isFeatured: true,
    category: 'Food',
    location: 'Bulawayo',
    requirements: ['Food Content', '3K+ Followers', 'Cooking Skills'],
    duration: '2 days',
    deliverables: '8 posts, 10 stories, 3 reels',
    applicationStatus: 'applied',
  },
  {
    id: '4',
    title: 'Zimbabwe Tech Innovation Summit',
    brand: 'TechZW',
    budget: '$450',
    deadline: '10 days left',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
    description: 'Highlight Zimbabwe\'s growing tech ecosystem and startups',
    applicants: 9,
    isFeatured: false,
    category: 'Technology',
    location: 'Harare',
    requirements: ['Tech Content', '2K+ Followers', 'Tech Background'],
    duration: '1 day',
    deliverables: '5 posts, 15 stories',
    applicationStatus: null,
  },
  {
    id: '5',
    title: 'Great Zimbabwe Ruins Heritage',
    brand: 'Zimbabwe Heritage Foundation',
    budget: '$900',
    deadline: '12 days left',
    image: 'https://images.unsplash.com/photo-1517650862521-d580d5348145?w=400',
    description: 'Showcase Zimbabwe\'s rich historical heritage and cultural sites',
    applicants: 21,
    isFeatured: true,
    category: 'Culture',
    location: 'Masvingo',
    requirements: ['Cultural Content', '8K+ Followers', 'History Interest'],
    duration: '4 days',
    deliverables: '12 posts, 6 stories, 1 video',
    applicationStatus: 'shortlisted',
  },
];

const trendingCreators = [
  {
    id: '1',
    name: 'Tanaka Moyo',
    username: '@tanaka_zw',
    category: 'Lifestyle & Travel',
    followers: '25.5K',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: true,
    growth: '+12%',
    location: 'Harare, Zimbabwe',
    bio: 'Showcasing the beauty of Zimbabwe 🇿🇼 | Brand partnerships welcome',
    completedCampaigns: 8,
    rating: 4.9,
    lastActive: '2 hours ago',
    specialties: ['Travel', 'Culture', 'Photography'],
    recentCampaign: 'Zimbabwe Tourism - Victoria Falls',
  },
  {
    id: '2',
    name: 'Chipo Mukamuri',
    username: '@chipo_styles',
    category: 'Fashion & Beauty',
    followers: '18.2K',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=150',
    isVerified: false,
    growth: '+8%',
    location: 'Bulawayo, Zimbabwe',
    bio: 'Fashion designer & content creator | Promoting Zimbabwean fashion ✨',
    completedCampaigns: 5,
    rating: 4.7,
    lastActive: '1 hour ago',
    specialties: ['Fashion', 'Design', 'Beauty'],
    recentCampaign: 'House of Zhama - Fashion Week',
  },
  {
    id: '3',
    name: 'Blessing Chitapa',
    username: '@blessing_adventures',
    category: 'Adventure & Travel',
    followers: '32.1K',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isVerified: true,
    growth: '+15%',
    location: 'Victoria Falls, Zimbabwe',
    bio: 'Adventure photographer | Capturing Zimbabwe\'s wild side 📸🦁',
    completedCampaigns: 12,
    rating: 4.8,
    lastActive: '30 minutes ago',
    specialties: ['Adventure', 'Wildlife', 'Photography'],
    recentCampaign: 'Zimbabwe Parks - Wildlife Conservation',
  },
  {
    id: '4',
    name: 'Nomsa Dube',
    username: '@nomsa_food',
    category: 'Food & Culture',
    followers: '14.8K',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    isVerified: false,
    growth: '+22%',
    location: 'Mutare, Zimbabwe',
    bio: 'Traditional Zimbabwean cuisine expert | Food blogger 🍽️',
    completedCampaigns: 6,
    rating: 4.6,
    lastActive: '4 hours ago',
    specialties: ['Food', 'Cooking', 'Culture'],
    recentCampaign: 'ZimCuisine - Traditional Recipes',
  },
  {
    id: '5',
    name: 'Tapiwa Makoni',
    username: '@tapiwa_tech',
    category: 'Technology & Innovation',
    followers: '21.3K',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isVerified: true,
    growth: '+18%',
    location: 'Harare, Zimbabwe',
    bio: 'Tech entrepreneur | Showcasing Zimbabwe\'s tech innovations 💻🚀',
    completedCampaigns: 7,
    rating: 4.9,
    lastActive: '1 hour ago',
    specialties: ['Technology', 'Innovation', 'Startups'],
    recentCampaign: 'TechZW - Innovation Summit',
  },
];

const dailyTips = [
  "Post consistently to maintain audience engagement",
  "Use local hashtags like #ZimbabweCreators to reach your audience",
  "Collaborate with other creators to expand your reach",
  "Always disclose sponsored content transparently",
  "Engage with your followers through comments and DMs",
];

// User Performance & Activity Data
const userPerformance = {
  totalApplications: 12,
  acceptedApplications: 8,
  completedCampaigns: 6,
  totalEarnings: 3420,
  currentMonth: {
    earnings: 1250,
    campaigns: 3,
    growth: '+18%',
  },
  rating: 4.7,
  responseTime: '2.5 hours',
  profileViews: 1240,
};

const recentActivity = [
  {
    id: '1',
    type: 'campaign_completed',
    title: 'Completed "Zimbabwe Tourism - Victoria Falls"',
    subtitle: 'Earned $600 | 5.0 rating received',
    timestamp: '2 hours ago',
    icon: 'check-circle',
    iconColor: colors.success,
    amount: '+$600',
  },
  {
    id: '2',
    type: 'application_accepted',
    title: 'Application Accepted',
    subtitle: 'House of Zhama Fashion Campaign',
    timestamp: '1 day ago',
    icon: 'thumb-up',
    iconColor: colors.primary,
    amount: null,
  },
  {
    id: '3',
    type: 'payment_received',
    title: 'Payment Received',
    subtitle: 'ZimCuisine Food Festival Campaign',
    timestamp: '3 days ago',
    icon: 'cash',
    iconColor: colors.success,
    amount: '+$450',
  },
  {
    id: '4',
    type: 'new_follower',
    title: 'Gained 150 New Followers',
    subtitle: 'From your recent Victoria Falls content',
    timestamp: '5 days ago',
    icon: 'account-plus',
    iconColor: colors.secondary,
    amount: '+150',
  },
  {
    id: '5',
    type: 'application_shortlisted',
    title: 'Application Shortlisted',
    subtitle: 'Great Zimbabwe Heritage Campaign',
    timestamp: '1 week ago',
    icon: 'star',
    iconColor: colors.warning,
    amount: null,
  },
];

const personalizedRecommendations = [
  {
    id: 'rec_1',
    type: 'campaign_match',
    title: 'Perfect Match for You!',
    subtitle: 'Zimbabwe Wildlife Conservation matches your travel content style',
    campaignId: '6',
    matchScore: 95,
    reason: 'Based on your travel & wildlife content',
  },
  {
    id: 'rec_2',
    type: 'collaboration',
    title: 'Collaboration Opportunity',
    subtitle: 'Connect with @nomsa_food for a culture & travel collab',
    creatorId: '4',
    matchScore: 88,
    reason: 'Complementary content styles',
  },
  {
    id: 'rec_3',
    type: 'skill_development',
    title: 'Improve Your Profile',
    subtitle: 'Add video content to increase campaign matches by 40%',
    actionType: 'skill_tip',
    matchScore: null,
    reason: 'Based on trending campaign requirements',
  },
];

const statsData = [
  { label: 'Applications', value: userPerformance.totalApplications.toString(), icon: 'send', color: colors.primary, trend: '+2 this week' },
  { label: 'Success Rate', value: `${Math.round((userPerformance.acceptedApplications / userPerformance.totalApplications) * 100)}%`, icon: 'chart-line', color: colors.success, trend: '+5% this month' },
  { label: 'This Month', value: `$${userPerformance.currentMonth.earnings}`, icon: 'cash', color: colors.secondary, trend: userPerformance.currentMonth.growth },
  { label: 'Profile Views', value: userPerformance.profileViews > 1000 ? `${(userPerformance.profileViews / 1000).toFixed(1)}K` : userPerformance.profileViews.toString(), icon: 'eye', color: colors.primary, trend: '+12% this week' },
];

export default function EnhancedHomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activeTab, setActiveTab] = useState('featured'); // featured, recommendations, activity

  const categories = ['All', 'Fashion', 'Lifestyle', 'Travel', 'Food', 'Tech'];
  const todaysTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
  
  // Filter campaigns based on application status for personalized experience
  const getFilteredCampaigns = () => {
    return featuredCampaigns.filter(campaign => {
      if (selectedCategory === 'All') return true;
      return campaign.category === selectedCategory;
    });
  };
  
  // Get campaigns with application status
  const getCampaignsWithStatus = () => {
    return featuredCampaigns.map(campaign => ({
      ...campaign,
      statusColor: 
        campaign.applicationStatus === 'applied' ? colors.warning :
        campaign.applicationStatus === 'pending' ? colors.secondary :
        campaign.applicationStatus === 'shortlisted' ? colors.success :
        null
    }));
  };

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
      
      {/* Status and Featured Badges */}
      <View style={styles.campaignBadges}>
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}
        {item.applicationStatus && (
          <View style={[styles.statusBadge, { backgroundColor: item.statusColor || colors.muted }]}>
            <Text style={styles.statusText}>
              {item.applicationStatus === 'applied' ? 'APPLIED' :
               item.applicationStatus === 'pending' ? 'PENDING' :
               item.applicationStatus === 'shortlisted' ? 'SHORTLISTED' :
               item.applicationStatus.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <Card.Content style={styles.campaignContent}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignTitleSection}>
            <Text style={styles.campaignTitle}>{item.title}</Text>
            <Text style={styles.brandName}>{item.brand}</Text>
          </View>
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        
        <Text style={styles.campaignDescription}>{item.description}</Text>
        
        {/* Enhanced Campaign Details */}
        <View style={styles.campaignDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>Duration: {item.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="file-document" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{item.deliverables}</Text>
          </View>
        </View>
        
        {/* Requirements Tags */}
        <View style={styles.requirementsContainer}>
          {item.requirements.slice(0, 2).map((req: string, index: number) => (
            <Chip key={index} style={styles.requirementChip} textStyle={styles.requirementChipText}>
              {req}
            </Chip>
          ))}
          {item.requirements.length > 2 && (
            <Text style={styles.moreRequirements}>+{item.requirements.length - 2} more</Text>
          )}
        </View>
        
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
            mode={item.applicationStatus ? "outlined" : "contained"}
            onPress={() => handleApplyToCampaign(item)}
            style={styles.applyButton}
            buttonColor={item.applicationStatus ? 'transparent' : colors.primary}
            textColor={item.applicationStatus ? colors.primary : colors.white}
            labelStyle={styles.buttonLabel}
            disabled={item.applicationStatus === 'applied' || item.applicationStatus === 'pending'}
          >
            {item.applicationStatus === 'applied' ? 'Applied' :
             item.applicationStatus === 'pending' ? 'Under Review' :
             item.applicationStatus === 'shortlisted' ? 'Shortlisted' :
             'Apply Now'}
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

  const renderUserPerformanceSummary = () => (
    <Card style={styles.performanceCard}>
      <Card.Content>
        <View style={styles.performanceHeader}>
          <MaterialCommunityIcons name="account-star" size={24} color={colors.primary} />
          <Text style={styles.performanceTitle}>Your Performance</Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingText}>{userPerformance.rating}</Text>
          </View>
        </View>
        
        <View style={styles.performanceStats}>
          <View style={styles.performanceStat}>
            <Text style={styles.performanceStatValue}>${userPerformance.totalEarnings.toLocaleString()}</Text>
            <Text style={styles.performanceStatLabel}>Total Earned</Text>
          </View>
          <View style={styles.performanceStat}>
            <Text style={styles.performanceStatValue}>{userPerformance.completedCampaigns}</Text>
            <Text style={styles.performanceStatLabel}>Campaigns Done</Text>
          </View>
          <View style={styles.performanceStat}>
            <Text style={styles.performanceStatValue}>{userPerformance.responseTime}</Text>
            <Text style={styles.performanceStatLabel}>Avg Response</Text>
          </View>
        </View>
        
        <Text style={styles.monthlyHighlight}>
          This month: <Text style={styles.monthlyAmount}>${userPerformance.currentMonth.earnings}</Text>
          <Text style={styles.monthlyGrowth}> ({userPerformance.currentMonth.growth})</Text>
        </Text>
      </Card.Content>
    </Card>
  );

  const renderRecentActivityItem = ({ item }: { item: any }) => (
    <Card style={styles.activityCard}>
      <Card.Content style={styles.activityContent}>
        <View style={styles.activityIcon}>
          <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
          <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
        </View>
        {item.amount && (
          <View style={styles.activityAmount}>
            <Text style={[styles.activityAmountText, { 
              color: item.amount.startsWith('+$') ? colors.success : colors.secondary 
            }]}>
              {item.amount}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderRecommendationItem = ({ item }: { item: any }) => (
    <Card style={styles.recommendationCard}>
      <Card.Content>
        <View style={styles.recommendationHeader}>
          <MaterialCommunityIcons 
            name={item.type === 'campaign_match' ? 'target' : 
                  item.type === 'collaboration' ? 'handshake' : 'lightbulb'} 
            size={20} 
            color={colors.primary} 
          />
          {item.matchScore && (
            <View style={styles.matchScore}>
              <Text style={styles.matchScoreText}>{item.matchScore}% match</Text>
            </View>
          )}
        </View>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationSubtitle}>{item.subtitle}</Text>
        <Text style={styles.recommendationReason}>{item.reason}</Text>
        <Button 
          mode="outlined" 
          onPress={() => Alert.alert('Recommendation', `Acting on: ${item.title}`)}
          style={styles.recommendationButton}
          labelStyle={styles.recommendationButtonLabel}
        >
          {item.type === 'campaign_match' ? 'View Campaign' : 
           item.type === 'collaboration' ? 'Connect' : 'Learn More'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderStatsCard = ({ item }: { item: any }) => (
    <Card style={styles.statsCard}>
      <Card.Content style={styles.statsContent}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
        <Text style={styles.statsValue}>{item.value}</Text>
        <Text style={styles.statsLabel}>{item.label}</Text>
        {item.trend && <Text style={styles.statsTrend}>{item.trend}</Text>}
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
          <Text style={styles.greeting}>Welcome back, Tendai! 🇿🇼</Text>
          <Text style={styles.subtitle}>Ready to discover new opportunities in Zimbabwe?</Text>
        </View>

        {/* User Performance Summary */}
        {renderUserPerformanceSummary()}

        {/* Search Bar */}
        <Searchbar
          placeholder="Search campaigns, creators..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />

        {/* Personal Stats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <TouchableOpacity onPress={() => Alert.alert('Analytics', 'View detailed analytics')}>
            <Text style={styles.viewAllText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={statsData}
          renderItem={renderStatsCard}
          keyExtractor={item => item.label}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        />

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          {['featured', 'recommendations', 'activity'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'featured' ? 'Featured' : 
                 tab === 'recommendations' ? 'For You' : 'Activity'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tabbed Content */}
        {activeTab === 'featured' && (
          <>
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
              <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to campaigns screen')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={getCampaignsWithStatus()}
              renderItem={renderCampaignCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />

            {/* Trending Creators */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Zimbabwe Creators</Text>
              <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to creators screen')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={trendingCreators.slice(0, 3)}
              renderItem={renderCreatorCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </>
        )}
        
        {activeTab === 'recommendations' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personalized for You</Text>
              <Text style={styles.sectionSubtitle}>Based on your content style and interests</Text>
            </View>
            
            <FlatList
              data={personalizedRecommendations}
              renderItem={renderRecommendationItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </>
        )}
        
        {activeTab === 'activity' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setShowAllActivity(!showAllActivity)}>
                <Text style={styles.viewAllText}>
                  {showAllActivity ? 'Show Less' : 'Show All'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={showAllActivity ? recentActivity : recentActivity.slice(0, 3)}
              renderItem={renderRecentActivityItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </>
        )}

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
  statsTrend: {
    fontSize: 10,
    color: colors.success,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
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
  // Performance Summary Styles
  performanceCard: {
    margin: 16,
    elevation: 3,
    backgroundColor: colors.surface,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 4,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  performanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  performanceStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  performanceStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  monthlyHighlight: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  monthlyAmount: {
    fontWeight: 'bold',
    color: colors.success,
  },
  monthlyGrowth: {
    color: colors.success,
    fontWeight: '600',
  },

  // Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    margin: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Enhanced Campaign Styles
  campaignBadges: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    zIndex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignTitleSection: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  campaignDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  requirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  requirementChip: {
    backgroundColor: colors.primary,
    height: 24,
  },
  requirementChipText: {
    fontSize: 10,
    color: colors.white,
  },
  moreRequirements: {
    fontSize: 10,
    color: colors.textSecondary,
    alignSelf: 'center',
    fontStyle: 'italic',
  },

  // Activity Styles
  activityCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 11,
    color: colors.muted,
  },
  activityAmount: {
    alignItems: 'flex-end',
  },
  activityAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Recommendations Styles
  recommendationCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchScore: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  matchScoreText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  recommendationReason: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  recommendationButton: {
    alignSelf: 'flex-start',
  },
  recommendationButtonLabel: {
    fontSize: 12,
  },

  spacer: {
    height: 20,
  },
});