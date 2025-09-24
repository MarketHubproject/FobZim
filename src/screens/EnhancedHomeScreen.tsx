import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  Image,
  Alert,
  RefreshControl,
  Animated,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { 
  Card, 
  Button, 
  Appbar, 
  Chip, 
  Avatar, 
  Badge,
  Searchbar,
  FAB,
  Surface,
  Skeleton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F8FAF9',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  border: '#E5E7EB',
  success: '#00C853',
  warning: '#FF9800',
  error: '#F44336',
  gradient: {
    primary: ['#2E7D32', '#4CAF50'],
    secondary: ['#4CAF50', '#81C784'],
    hero: ['#1B5E20', '#2E7D32', '#4CAF50'],
    card: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)'],
  },
  shadow: {
    light: 'rgba(0,0,0,0.1)',
    medium: 'rgba(0,0,0,0.15)',
    dark: 'rgba(0,0,0,0.25)',
  }
};

// Mock data
const heroBanners = [
  {
    id: '1',
    title: 'Zimbabwe Tourism Expo 2024',
    subtitle: 'Showcase the beauty of Zimbabwe',
    description: 'Join our biggest tourism campaign and earn up to $2,000',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    cta: 'Apply Now',
    deadline: 'Ends in 3 days',
    participants: '24 creators',
    budget: '$2,000',
  },
  {
    id: '2',
    title: 'Sustainable Fashion Week',
    subtitle: 'Eco-friendly fashion showcase',
    description: 'Promote sustainable fashion brands across Zimbabwe',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    cta: 'Learn More',
    deadline: 'Ends in 5 days',
    participants: '18 creators',
    budget: '$1,500',
  },
  {
    id: '3',
    title: 'Local Food Festival',
    subtitle: 'Celebrate Zimbabwean cuisine',
    description: 'Feature traditional and modern Zimbabwean dishes',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
    cta: 'Join Now',
    deadline: 'Ends in 7 days',
    participants: '31 creators',
    budget: '$1,200',
  },
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bannerFadeAnim = useRef(new Animated.Value(1)).current;

  const categories = ['All', 'Fashion', 'Lifestyle', 'Travel', 'Food', 'Tech'];
  const todaysTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  // Initialize animations and data loading
  useEffect(() => {
    loadInitialData();
    startAnimations();
    startBannerRotation();
  }, []);

  const loadInitialData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startBannerRotation = () => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % heroBanners.length;
        
        // Fade animation for banner transition
        Animated.sequence([
          Animated.timing(bannerFadeAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bannerFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    Alert.alert('Refreshed', 'Content updated successfully!');
  };

  const handleSaveCampaign = (campaignId: string) => {
    // Add haptic feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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

  const renderHeroBanner = () => {
    const currentBanner = heroBanners[currentBannerIndex];
    
    return (
      <Animated.View style={[styles.heroContainer, { opacity: bannerFadeAnim }]}>
        <LinearGradient
          colors={colors.gradient.hero}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: currentBanner.image }} style={styles.heroBackgroundImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{currentBanner.title}</Text>
              <Text style={styles.heroSubtitle}>{currentBanner.subtitle}</Text>
              <Text style={styles.heroDescription}>{currentBanner.description}</Text>
              
              <View style={styles.heroMeta}>
                <View style={styles.heroMetaItem}>
                  <MaterialCommunityIcons name="currency-usd" size={16} color={colors.white} />
                  <Text style={styles.heroMetaText}>{currentBanner.budget}</Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.white} />
                  <Text style={styles.heroMetaText}>{currentBanner.deadline}</Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.white} />
                  <Text style={styles.heroMetaText}>{currentBanner.participants}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.heroCTA}>
                <LinearGradient
                  colors={colors.gradient.secondary}
                  style={styles.heroCTAGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.heroCTAText}>{currentBanner.cta}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          {/* Banner Indicators */}
          <View style={styles.bannerIndicators}>
            {heroBanners.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.bannerDot,
                  index === currentBannerIndex && styles.activeBannerDot
                ]}
                onPress={() => setCurrentBannerIndex(index)}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSkeletonCard = () => (
    <Card style={styles.campaignCard}>
      <Skeleton height={160} style={styles.skeletonImage} />
      <Card.Content style={styles.campaignContent}>
        <Skeleton height={20} width="80%" style={styles.skeletonLine} />
        <Skeleton height={16} width="60%" style={styles.skeletonLine} />
        <Skeleton height={14} width="100%" style={styles.skeletonLine} />
        <View style={styles.campaignMeta}>
          <Skeleton height={12} width="25%" />
          <Skeleton height={12} width="25%" />
          <Skeleton height={12} width="25%" />
        </View>
        <View style={styles.campaignActions}>
          <Skeleton height={36} width="70%" />
          <Skeleton height={24} width={24} style={styles.skeletonIcon} />
        </View>
      </Card.Content>
    </Card>
  );

  const renderSkeletonCreator = () => (
    <Card style={styles.creatorCard}>
      <View style={styles.creatorContent}>
        <Skeleton height={60} width={60} style={styles.skeletonAvatar} />
        <View style={styles.creatorInfo}>
          <Skeleton height={16} width="70%" style={styles.skeletonLine} />
          <Skeleton height={14} width="50%" style={styles.skeletonLine} />
          <Skeleton height={12} width="60%" style={styles.skeletonLine} />
        </View>
        <Skeleton height={32} width={80} style={styles.skeletonButton} />
      </View>
    </Card>
  );

  const renderStatsCard = ({ item }: { item: any }) => (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Card style={[styles.statsCard, styles.enhancedShadow]}>
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.statsGradient}
        >
          <Card.Content style={styles.statsContent}>
            <View style={styles.statsIconContainer}>
              <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
            </View>
            <Text style={styles.statsValue}>{item.value}</Text>
            <Text style={styles.statsLabel}>{item.label}</Text>
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="ZimBuzz" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Loading Hero Banner */}
          <Card style={styles.heroContainer}>
            <Skeleton height={240} style={styles.skeletonHero} />
          </Card>
          
          {/* Loading Welcome Section */}
          <View style={styles.welcomeSection}>
            <Skeleton height={32} width="60%" style={[styles.skeletonLine, { alignSelf: 'center' }]} />
            <Skeleton height={20} width="80%" style={[styles.skeletonLine, { alignSelf: 'center' }]} />
          </View>
          
          {/* Loading Stats */}
          <FlatList
            data={[1, 2, 3]}
            renderItem={() => (
              <Card style={styles.statsCard}>
                <Skeleton height={100} style={styles.skeletonStats} />
              </Card>
            )}
            horizontal
            contentContainerStyle={styles.statsContainer}
            showsHorizontalScrollIndicator={false}
          />
          
          {/* Loading Campaigns */}
          <FlatList
            data={[1, 2]}
            renderItem={renderSkeletonCard}
            horizontal
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={false}
          />
          
          {/* Loading Creators */}
          <FlatList
            data={[1, 2, 3]}
            renderItem={renderSkeletonCreator}
            scrollEnabled={false}
          />
        </ScrollView>
        
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading amazing content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Appbar.Header style={[styles.header, styles.enhancedShadow]}>
        <Appbar.Content 
          title="ZimBuzz" 
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary, colors.secondary]}
            progressBackgroundColor={colors.white}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Banner */}
        {renderHeroBanner()}
        
        {/* Welcome Section with Animation */}
        <Animated.View 
          style={[
            styles.welcomeSection, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.greeting}>Welcome back! 🇿🇼</Text>
          <Text style={styles.subtitle}>Discover new opportunities and connect with brands</Text>
        </Animated.View>

        {/* Search Bar with Animation */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Searchbar
            placeholder="Search campaigns, creators..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchBar, styles.enhancedShadow]}
            inputStyle={styles.searchInput}
          />
        </Animated.View>

        {/* Stats Section with Animation */}
        <Animated.View style={{ opacity: fadeAnim }}>
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
        </Animated.View>

        {/* Daily Tip with Enhanced Design */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <Card style={[styles.tipCard, styles.enhancedShadow]}>
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              style={styles.tipGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Card.Content>
                <View style={styles.tipHeader}>
                  <MaterialCommunityIcons name="lightbulb" size={24} color={colors.white} />
                  <Text style={styles.tipTitle}>Creator Tip of the Day</Text>
                </View>
                <Text style={styles.tipText}>{todaysTip}</Text>
              </Card.Content>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Featured Campaigns */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Campaigns</Text>
            <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to all campaigns')}>
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.viewAllGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={colors.white} />
              </LinearGradient>
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
        </Animated.View>

        {/* Trending Creators */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Creators</Text>
            <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to all creators')}>
              <LinearGradient
                colors={colors.gradient.secondary}
                style={styles.viewAllGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <FlatList
            data={trendingCreators}
            renderItem={renderCreatorCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Enhanced Floating Action Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.fabContainer}
          onPress={() => Alert.alert('Create', 'Create new campaign or content')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
    elevation: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  enhancedShadow: {
    elevation: 8,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  // Hero Banner Styles
  heroContainer: {
    height: 280,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  heroGradient: {
    flex: 1,
    position: 'relative',
  },
  heroBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textShadowColor: colors.shadow.dark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetaText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  heroCTA: {
    alignSelf: 'flex-start',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  heroCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  heroCTAText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  bannerIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    right: 24,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginLeft: 8,
  },
  activeBannerDot: {
    backgroundColor: colors.white,
    width: 20,
  },

  // Loading Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,249,0.9)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  skeletonHero: {
    borderRadius: 20,
  },
  skeletonImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  skeletonLine: {
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonIcon: {
    borderRadius: 12,
  },
  skeletonAvatar: {
    borderRadius: 30,
    marginRight: 12,
  },
  skeletonButton: {
    borderRadius: 16,
  },
  skeletonStats: {
    borderRadius: 12,
  },

  welcomeSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: colors.shadow.light,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchBar: {
    margin: 16,
    elevation: 6,
    borderRadius: 25,
    backgroundColor: colors.white,
  },
  searchInput: {
    fontSize: 16,
    paddingLeft: 8,
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
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  viewAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsCard: {
    marginRight: 16,
    minWidth: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    flex: 1,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statsIconContainer: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  tipCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipGradient: {
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
    opacity: 0.9,
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
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  spacer: {
    height: 20,
  },
});