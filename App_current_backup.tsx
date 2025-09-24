import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, Card, Button, Searchbar, Chip, Menu, IconButton, ActivityIndicator } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppStateProvider, useAppState } from './src/store/AppState';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { NotificationProvider, useNotifications } from './src/contexts/NotificationContext';
import { CreatorCard, CampaignCard, TipCard, LoadingPlaceholder, EmptyState } from './src/components/OptimizedComponents';
import AuthScreen from './src/screens/AuthScreen';
import AdminScreen from './src/screens/AdminScreen';
import { useCreators, useCampaigns, useTips, useUserInteractions, useDataRefresh } from './src/services/realTimeDataService';

// Define colors
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
};

// Mock data for creators
const mockCreators = [
  { id: '1', name: 'Tatenda Mukamuri', username: 'tatenda_muke', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', category: 'Lifestyle', followers: 15000, location: 'Harare', isVerified: true, bio: 'Creating content about Zimbabwean culture and lifestyle' },
  { id: '2', name: 'Chipo Mutindi', username: 'chipo_recipes', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', category: 'Food', followers: 8200, location: 'Bulawayo', isVerified: false, bio: 'Traditional Zimbabwean recipes with a modern twist' },
  { id: '3', name: 'Tinotenda Chipere', username: 'tino_tech', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', category: 'Tech', followers: 12000, location: 'Harare', isVerified: true, bio: 'Tech reviews and programming tutorials' },
  { id: '4', name: 'Rudo Makoni', username: 'rudo_style', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', category: 'Fashion', followers: 22000, location: 'Harare', isVerified: true, bio: 'Fashion stylist showcasing African prints and modern wear' },
  { id: '5', name: 'Kudzai Mhere', username: 'kudzai_beats', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'Music', followers: 35000, location: 'Gweru', isVerified: true, bio: 'Musician and content creator promoting Zimbabwean music' },
  { id: '6', name: 'Vimbai Chakanyuka', username: 'vimbai_travels', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', category: 'Travel', followers: 9500, location: 'Victoria Falls', isVerified: false, bio: 'Showcasing the beauty of Zimbabwe through travel content' },
  { id: '7', name: 'Blessed Gara', username: 'blessed_fitness', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', category: 'Fitness', followers: 11000, location: 'Mutare', isVerified: false, bio: 'Fitness coach inspiring healthy living in Zimbabwe' },
  { id: '8', name: 'Nyasha Mukamuri', username: 'nyasha_edu', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', category: 'Education', followers: 18000, location: 'Harare', isVerified: true, bio: 'Educational content creator and university lecturer' }
];

// Mock data for campaigns
const mockCampaigns = [
  { id: '1', brand: 'EcoCash', title: 'Digital Payments Awareness', budget: '$800', category: 'Finance', deadline: '2024-02-15', description: 'Promote digital payment solutions across Zimbabwe', requirements: ['10K+ followers', 'Finance niche', 'Local content'], applicants: 45, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300' },
  { id: '2', brand: 'Delta Corporation', title: 'Beverage Campaign', budget: '$1,200', category: 'Food & Beverage', deadline: '2024-02-28', description: 'Showcase our latest beverage products to urban audiences', requirements: ['5K+ followers', 'Lifestyle content', 'Urban audience'], applicants: 67, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300' },
  { id: '3', brand: 'OK Zimbabwe', title: 'Grocery Shopping Experience', budget: '$600', category: 'Retail', deadline: '2024-03-10', description: 'Highlight convenience and quality of OK stores', requirements: ['3K+ followers', 'Family content', 'Shopping content'], applicants: 32, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
  { id: '4', brand: 'NetOne', title: 'Data Bundles Promotion', budget: '$900', category: 'Telecommunications', deadline: '2024-02-20', description: 'Promote affordable data packages for young professionals', requirements: ['8K+ followers', 'Tech content', 'Young audience'], applicants: 78, image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300' },
  { id: '5', brand: 'CBZ Bank', title: 'Youth Banking Services', budget: '$1,500', category: 'Finance', deadline: '2024-03-05', description: 'Encourage youth to adopt modern banking solutions', requirements: ['15K+ followers', 'Educational content', 'Youth focus'], applicants: 89, image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=300' },
  { id: '6', brand: 'Chicken Inn', title: 'New Menu Launch', budget: '$700', category: 'Food & Beverage', deadline: '2024-02-25', description: 'Showcase new chicken recipes and family meals', requirements: ['5K+ followers', 'Food content', 'Family audience'], applicants: 54, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300' },
  { id: '7', brand: 'TM Pick n Pay', title: 'Fresh Produce Campaign', budget: '$500', category: 'Retail', deadline: '2024-03-15', description: 'Promote fresh, local produce and healthy eating', requirements: ['3K+ followers', 'Health content', 'Local focus'], applicants: 23, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
  { id: '8', brand: 'Zimnat Insurance', title: 'Insurance Awareness', budget: '$1,000', category: 'Insurance', deadline: '2024-03-01', description: 'Educate young adults about importance of insurance coverage', requirements: ['12K+ followers', 'Educational content', 'Professional audience'], applicants: 61, image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300' }
];

// Mock data for tips
const mockTips = [
  { id: '1', title: 'Building Authentic Engagement', content: 'Focus on creating genuine connections with your audience by responding to comments, asking questions, and sharing personal stories that resonate with Zimbabwean culture.', category: 'Engagement', author: 'ZimBuzz Team', likes: 324, date: '2024-01-15' },
  { id: '2', title: 'Content Consistency Tips', content: 'Post regularly and maintain a consistent visual style. Use local themes, colors inspired by our flag, and showcase Zimbabwe\'s natural beauty to stand out.', category: 'Content Strategy', author: 'Tatenda M.', likes: 256, date: '2024-01-20' },
  { id: '3', title: 'Collaborating with Local Brands', content: 'Reach out to Zimbabwean brands that align with your values. Showcase how their products fit into everyday Zimbabwean life for more authentic partnerships.', category: 'Partnerships', author: 'Content Expert', likes: 189, date: '2024-01-18' }
];

// Home Screen Component
function HomeScreen() {
  // Real-time data hooks
  const { tips, loading, error } = useTips();
  const { toggleSaveTip, isTipSaved } = useUserInteractions();
  const { refreshing, refreshData } = useDataRefresh();

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleSaveTip = useCallback(async (tipId: string) => {
    await toggleSaveTip(tipId);
  }, [toggleSaveTip]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to ZimBuzz! 🇿🇼</Text>
        <Text style={styles.welcomeSubtitle}>
          Discover Zimbabwe's rising content creators
        </Text>
      </View>

      {tips && tips.length > 0 && (
        <TipCard
          key={tips[0].id}
          tip={tips[0]}
          isSaved={isTipSaved(tips[0].id)}
          onToggleSave={handleSaveTip}
        />
      )}

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>Featured Creators</Text>
          <Text style={styles.cardContent}>
            Discover talented creators from Zimbabwe making waves in the digital space.
          </Text>
          <Button mode="contained" style={styles.button}>
            Explore Creators
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>Brand Opportunities</Text>
          <Text style={styles.cardContent}>
            Connect with brands looking for authentic voices to represent their products.
          </Text>
          <Button mode="contained" style={styles.button}>
            View Campaigns
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// Creators Screen Component
function CreatorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  
  // Real-time data hooks
  const { creators, loading, error } = useCreators({
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    location: selectedLocation !== 'All' ? selectedLocation : undefined,
    verified: showVerifiedOnly
  });
  const { toggleFollowCreator, isCreatorFollowed } = useUserInteractions();
  const { refreshing, refreshData } = useDataRefresh();

  const categories = ['All', 'Lifestyle', 'Food', 'Tech', 'Fashion', 'Music', 'Travel', 'Fitness', 'Education'];
  const locations = ['All', 'Harare', 'Bulawayo', 'Gweru', 'Victoria Falls', 'Mutare'];
  const sortOptions = [
    { key: 'name', label: 'Name A-Z' },
    { key: 'followers', label: 'Most Followers' },
    { key: 'verified', label: 'Verified First' }
  ];

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleFollow = useCallback(async (creatorId: string) => {
    await toggleFollowCreator(creatorId);
  }, [toggleFollowCreator]);

  // Filter and sort creators
  const filteredCreators = useMemo(() => {
    if (!creators || creators.length === 0) return [];
    
    let filtered = creators.filter(creator => {
      const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           creator.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    // Sort creators
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'followers':
          return b.followers - a.followers;
        case 'verified':
          return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [creators, searchQuery, sortBy]);

  const renderCreator = useCallback(({ item }: { item: any }) => (
    <CreatorCard
      creator={item}
      isFollowed={isCreatorFollowed(item.id)}
      onToggleFollow={handleFollow}
    />
  ), [isCreatorFollowed, handleFollow]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search creators..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filtersContainer}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={[styles.filterChip, selectedCategory === category && styles.selectedChip]}
                  textStyle={selectedCategory === category ? styles.selectedChipText : styles.chipText}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.actionButtons}>
            <IconButton
              icon={showVerifiedOnly ? 'check-decagram' : 'check-decagram-outline'}
              iconColor={showVerifiedOnly ? colors.secondary : colors.muted}
              size={24}
              onPress={() => setShowVerifiedOnly(!showVerifiedOnly)}
            />
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <IconButton
                  icon="sort"
                  iconColor={colors.primary}
                  size={24}
                  onPress={() => setSortMenuVisible(true)}
                />
              }
            >
              {sortOptions.map((option) => (
                <Menu.Item
                  key={option.key}
                  onPress={() => {
                    setSortBy(option.key);
                    setSortMenuVisible(false);
                  }}
                  title={option.label}
                  leadingIcon={sortBy === option.key ? 'check' : undefined}
                />
              ))}
            </Menu>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersContainer}>
            {locations.map((location) => (
              <Chip
                key={location}
                selected={selectedLocation === location}
                onPress={() => setSelectedLocation(location)}
                style={[styles.filterChip, selectedLocation === location && styles.selectedChip]}
                textStyle={selectedLocation === location ? styles.selectedChipText : styles.chipText}
                icon="map-marker"
              >
                {location}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading && filteredCreators.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} color={colors.primary} size="large" />
          <Text style={styles.centerTitle}>Loading creators...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.centerTitle}>Error loading creators</Text>
          <Button mode="contained" onPress={onRefresh} style={styles.button}>
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredCreators}
          renderItem={renderCreator}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="account-search" size={48} color={colors.muted} />
              <Text style={styles.centerTitle}>No creators found</Text>
              <Text style={styles.centerSubtitle}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// Campaigns Screen Component
function CampaignsScreen() {
  // Real-time data hooks
  const { campaigns, loading, error } = useCampaigns();
  const { toggleSaveCampaign, isCampaignSaved, applyCampaign, isCampaignApplied } = useUserInteractions();
  const { refreshing, refreshData } = useDataRefresh();

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleSave = useCallback(async (campaignId: string) => {
    await toggleSaveCampaign(campaignId);
  }, [toggleSaveCampaign]);

  const handleApply = useCallback(async (campaignId: string) => {
    await applyCampaign(campaignId);
  }, [applyCampaign]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.centerTitle}>Loading campaigns...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.centerTitle}>Error loading campaigns</Text>
        <Button mode="contained" onPress={onRefresh} style={styles.button}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand Campaigns</Text>
        <Text style={styles.sectionSubtitle}>
          Opportunities for creators
        </Text>
      </View>

      {campaigns && campaigns.length > 0 ? (
        campaigns.slice(0, 3).map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            isSaved={isCampaignSaved(campaign.id)}
            isApplied={isCampaignApplied(campaign.id)}
            onToggleSave={handleSave}
            onApply={handleApply}
          />
        ))
      ) : (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="briefcase-search" size={48} color={colors.muted} />
          <Text style={styles.centerTitle}>No campaigns available</Text>
          <Text style={styles.centerSubtitle}>Check back later for new opportunities</Text>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// Simple Screen Components for other tabs
function TrendsScreen() {
  return (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="trending-up" size={64} color={colors.primary} />
      <Text style={styles.centerTitle}>Trends Screen</Text>
      <Text style={styles.centerSubtitle}>Coming Soon</Text>
    </View>
  );
}

// Import the actual ProfileScreen
import ProfileScreen from './src/screens/ProfileScreen';
import CreatorOnboardingScreen from './src/screens/CreatorOnboardingScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreatorOnboarding" 
        component={CreatorOnboardingScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Main App component that handles authentication state
function MainApp() {
  const { user, userProfile, loading } = useAuth();

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Show loading screen while user profile is being fetched
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="loading" size={48} color={colors.primary} />
        <Text style={styles.centerTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <NotificationProvider>
      <AppStateProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

                switch (route.name) {
                  case 'Home':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'Creators':
                    iconName = focused ? 'account-star' : 'account-star-outline';
                    break;
                  case 'Campaigns':
                    iconName = focused ? 'briefcase' : 'briefcase-outline';
                    break;
                  case 'Trends':
                    iconName = focused ? 'trending-up' : 'trending-up';
                    break;
                  case 'Admin':
                    iconName = focused ? 'shield-crown' : 'shield-crown-outline';
                    break;
                  case 'Profile':
                    iconName = focused ? 'account-circle' : 'account-circle-outline';
                    break;
                  case 'Notifications':
                    iconName = focused ? 'bell' : 'bell-outline';
                    break;
                  default:
                    iconName = 'help-circle-outline';
                }

                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.muted,
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.muted,
                paddingTop: 5,
                paddingBottom: 5,
                height: 60,
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ZimBuzz' }} />
            <Tab.Screen name="Creators" component={CreatorsScreen} />
            <Tab.Screen name="Campaigns" component={CampaignsScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
            <Tab.Screen name="Admin" component={AdminScreen} />
          </Tab.Navigator>
          <StatusBar style="light" backgroundColor={colors.primary} />
        </NavigationContainer>
      </AppStateProvider>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  centerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  welcomeSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
  },
  tipButton: {
    borderColor: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  creatorBio: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    marginLeft: 4,
  },
  spacer: {
    height: 20,
  },
  appliedButton: {
    borderColor: colors.secondary,
    backgroundColor: 'transparent',
  },
  // New styles for enhanced functionality
  searchContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterScroll: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.background,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedChipText: {
    fontSize: 12,
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorIconContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    height: 24,
    backgroundColor: colors.secondary + '20',
  },
  flatListContent: {
    paddingBottom: 20,
  },
});
