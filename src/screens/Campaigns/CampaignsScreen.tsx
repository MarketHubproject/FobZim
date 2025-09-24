import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Chip,
  FAB,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../contexts/AuthContext';
import { CampaignService } from '../../services/CampaignService';
import CampaignCard from '../../components/CampaignCard';
import {
  CampaignListItem,
  CampaignSearchParams,
  CampaignCategory,
  CampaignStatus,
  CAMPAIGN_CATEGORIES_LABELS,
} from '../../types/campaign';
// Define styles and constants inline for now
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  error: '#F44336',
  zimbabwe: '#FFCC02',
  white: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FF9800',
  border: '#E0E0E0',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const radius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const shadow = {
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

const EASING = {
  EASE_OUT: 'easeOut',
  EASE_IN_OUT: 'easeInOut',
};

const createFadeAnimation = (animatedValue: Animated.Value, toValue: number, duration: number) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

// Mock data for development with status and management features
const mockCampaigns = [
  {
    id: '1',
    brand: 'Nike',
    title: 'New Air Jordan Campaign',
    description: 'Looking for fashion influencers to showcase our latest Air Jordan collection.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    budgetUSD: 5000,
    niche: 'Fashion',
    deadlineISO: '2024-02-15T23:59:59Z',
    requirements: ['100k+ followers', 'Fashion niche', 'High engagement rate'],
    status: 'active',
    priority: 'high',
    applicationsCount: 127,
    viewsCount: 2400,
    isUrgent: false,
    featured: true
  },
  {
    id: '2',
    brand: 'Apple',
    title: 'iPhone 15 Pro Launch',
    description: 'Tech reviewers wanted for iPhone 15 Pro unboxing and review content.',
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37',
    budgetUSD: 8000,
    niche: 'Tech',
    deadlineISO: '2024-02-20T23:59:59Z',
    requirements: ['Tech expertise', '50k+ followers', 'Video content'],
    status: 'active',
    priority: 'high',
    applicationsCount: 89,
    viewsCount: 3200,
    isUrgent: true,
    featured: false
  },
  {
    id: '3',
    brand: 'Spotify',
    title: 'Music Discovery Campaign',
    description: 'Partner with music influencers to promote new playlist features.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    budgetUSD: 3000,
    niche: 'Music',
    deadlineISO: '2024-02-10T23:59:59Z',
    requirements: ['Music niche', 'Playlist creation', '25k+ followers'],
    status: 'closing-soon',
    priority: 'medium',
    applicationsCount: 45,
    viewsCount: 890,
    isUrgent: true,
    featured: false
  }
];

type SortOption = 'deadline' | 'budget' | 'alphabetical';
type FilterOption = 'all' | 'Fashion' | 'Tech' | 'Music' | 'Lifestyle' | 'Comedy';
type BudgetRange = 'all' | 'under-1000' | '1000-5000' | '5000-10000' | 'over-10000';
type LocationFilter = 'all' | 'remote' | 'local' | 'international';

interface Campaign {
  id: string;
  brand: string;
  title: string;
  description: string;
  image: string;
  budgetUSD: number;
  niche: string;
  deadlineISO: string;
  requirements?: string[];
  status?: 'active' | 'closing-soon' | 'closed' | 'draft';
  priority?: 'low' | 'medium' | 'high';
  applicationsCount?: number;
  viewsCount?: number;
  isUrgent?: boolean;
  featured?: boolean;
}

// Simple store implementation
const useSimpleStore = () => {
  const [savedCampaignIds, setSavedCampaignIds] = useState<string[]>([]);
  const [appliedCampaignIds, setAppliedCampaignIds] = useState<string[]>([]);
  
  const toggleSaveCampaign = (campaignId: string) => {
    setSavedCampaignIds(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };
  
  const markCampaignApplied = (campaignId: string) => {
    setAppliedCampaignIds(prev => 
      prev.includes(campaignId) ? prev : [...prev, campaignId]
    );
  };
  
  return {
    savedCampaignIds,
    appliedCampaignIds,
    toggleSaveCampaign,
    markCampaignApplied,
  };
};

// Simple skeleton component
const CampaignsListSkeleton = ({ count }: { count: number }) => (
  <View>
    {Array(count).fill(0).map((_, index) => (
      <View key={index} style={{
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 16,
      }} />
    ))}
  </View>
);

// Simple success message component
const AnimatedSuccessMessage = ({ visible, message, onDismiss }: {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);
  
  if (!visible) return null;
  
  return (
    <View style={{
      position: 'absolute',
      top: 50,
      left: 16,
      right: 16,
      backgroundColor: colors.success,
      padding: 12,
      borderRadius: 8,
      zIndex: 1000,
    }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>{message}</Text>
    </View>
  );
};

export default function CampaignsScreen() {
  console.log('✅ CampaignsScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const navigation = useNavigation();
  const { 
    savedCampaignIds, 
    appliedCampaignIds, 
    toggleSaveCampaign, 
    markCampaignApplied 
  } = useSimpleStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalViews: 12547,
    activeApplications: 342,
    newCampaignsToday: 8,
    trending: ['Fashion', 'Tech', 'Lifestyle']
  });
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Header entrance animation
    createFadeAnimation(headerAnim, 1, ANIMATION_DURATION.NORMAL).start();
  }, []);
  
  // Simulate initial data loading
  useEffect(() => {
    const loadCampaigns = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInitialLoading(false);
    };
    
    loadCampaigns();
  }, []);
  
  useEffect(() => {
    // Filters slide animation
    Animated.timing(filtersAnim, {
      toValue: showFilters ? 1 : 0,
      duration: ANIMATION_DURATION.NORMAL,
      easing: EASING.EASE_IN_OUT,
      useNativeDriver: false, // Using height animation
    }).start();
  }, [showFilters]);
  
  // Real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        totalViews: prev.totalViews + Math.floor(Math.random() * 5),
        activeApplications: prev.activeApplications + Math.floor(Math.random() * 2),
      }));
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate new campaign notifications
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      const notifications = [
        '🎆 New luxury brand campaign available!',
        '📱 Tech startup looking for influencers!',
        '🎵 Music label collaboration opportunity!',
        '👗 Fashion week campaign launched!',
      ];
      
      if (Math.random() > 0.7) { // 30% chance every 15 seconds
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        showSuccessToast(randomNotification);
      }
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(notificationInterval);
  }, []);
  
  // Filter and sort campaigns
  const { filteredCampaigns, campaignStats } = useMemo(() => {
    let filtered = mockCampaigns.filter(campaign => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!
          (campaign.brand.toLowerCase().includes(query) ||
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          campaign.niche.toLowerCase().includes(query))
        ) {
          return false;
        }
      }
      
      // Niche filter
      if (filterBy !== 'all' && campaign.niche !== filterBy) {
        return false;
      }
      
      // Budget range filter
      if (budgetRange !== 'all') {
        switch (budgetRange) {
          case 'under-1000':
            if (campaign.budgetUSD >= 1000) return false;
            break;
          case '1000-5000':
            if (campaign.budgetUSD < 1000 || campaign.budgetUSD > 5000) return false;
            break;
          case '5000-10000':
            if (campaign.budgetUSD < 5000 || campaign.budgetUSD > 10000) return false;
            break;
          case 'over-10000':
            if (campaign.budgetUSD <= 10000) return false;
            break;
        }
      }
      
      // Location filter (mock - in real app would check campaign location data)
      if (locationFilter !== 'all') {
        // For demo purposes, randomly assign location types
        const campaignLocation = campaign.id === '1' ? 'local' : 
                                campaign.id === '2' ? 'international' : 'remote';
        if (campaignLocation !== locationFilter) {
          return false;
        }
      }
      
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadlineISO).getTime() - new Date(b.deadlineISO).getTime();
        case 'budget':
          return b.budgetUSD - a.budgetUSD;
        case 'alphabetical':
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });
    
    const stats = {
      total: filtered.length,
      totalBudget: filtered.reduce((sum, campaign) => sum + campaign.budgetUSD, 0),
      applied: filtered.filter(campaign => appliedCampaignIds.includes(campaign.id)).length,
      saved: filtered.filter(campaign => savedCampaignIds.includes(campaign.id)).length
    };
    
    return { filteredCampaigns: filtered, campaignStats: stats };
  }, [searchQuery, sortBy, filterBy, budgetRange, locationFilter, appliedCampaignIds, savedCampaignIds]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast('🔄 Campaigns refreshed!');
    }, 1500);
  };
  
  const handleApply = (campaign: Campaign | CampaignListItem) => {
    markCampaignApplied(campaign.id);
    const brandName = 'brand' in campaign ? campaign.brand : campaign.creator.displayName;
    showSuccessToast(`🚀 Applied to ${brandName}!`);
  };
  
  const handleSave = (campaignId: string) => {
    const wasSaved = savedCampaignIds.includes(campaignId);
    toggleSaveCampaign(campaignId);
    showSuccessToast(wasSaved ? '📌 Campaign removed!' : '📌 Campaign saved!');
  };
  
  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };
  
  const dismissSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };
  
  const handleCreateCampaign = () => {
    // Navigate to campaign creation screen
    navigation.navigate('CreateCampaign' as never);
  };
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'closing-soon': return colors.warning;
      case 'closed': return colors.muted;
      case 'draft': return colors.textSecondary;
      default: return colors.primary;
    }
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };
  
  const handleViewCampaign = (campaign: Campaign) => {
    // Enhanced campaign details with management info
    const statusText = campaign.status?.toUpperCase() || 'ACTIVE';
    const priorityText = campaign.priority?.toUpperCase() || 'MEDIUM';
    const urgentText = campaign.isUrgent ? '⚠️ URGENT' : '';
    const featuredText = campaign.featured ? '⭐ FEATURED' : '';
    
    Alert.alert(
      `${campaign.brand} Campaign ${urgentText}`,
      `${campaign.title} ${featuredText}\n\nStatus: ${statusText}\nPriority: ${priorityText}\nBudget: $${campaign.budgetUSD}\nNiche: ${campaign.niche}\nApplications: ${campaign.applicationsCount || 0}\nViews: ${campaign.viewsCount || 0}\n\n${campaign.description}\n\nRequirements:\n${campaign.requirements?.map(req => `• ${req}`).join('\n') || 'No specific requirements'}`,
      [
        { text: 'Apply Now', onPress: () => handleApply(campaign) },
        { text: 'Save Campaign', onPress: () => handleSave(campaign.id) },
        { text: 'Share', onPress: () => showSuccessToast('📤 Campaign link copied!') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };
  
  const renderCampaign = ({ item, index }: { item: Campaign; index: number }) => {
    // Convert Campaign to CampaignListItem format
    const campaignListItem: CampaignListItem = {
      ...item,
      briefDescription: item.description.substring(0, 100) + '...',
      category: 'collaboration' as CampaignCategory,
      status: 'active' as CampaignStatus,
      rewards: [
        {
          type: 'monetary',
          amount: item.budgetUSD,
          currency: 'USD',
          description: `$${item.budgetUSD} USD payment`
        }
      ],
      targetAudience: item.niche,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: 'brand-creator',
      creator: {
        id: 'brand-creator',
        displayName: item.brand,
        photoURL: null,
        email: null,
        isVerified: true
      }
    };
    
    return (
      <TouchableOpacity onPress={() => handleViewCampaign(item)} activeOpacity={0.9}>
        <CampaignCard
          campaign={campaignListItem}
          isApplied={appliedCampaignIds.includes(item.id)}
          isSaved={savedCampaignIds.includes(item.id)}
          onApply={handleApply}
          onSave={handleSave}
          index={index}
          showSuccessToast={showSuccessToast}
        />
      </TouchableOpacity>
    );
  };
  
  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'deadline', label: 'Deadline' },
    { key: 'budget', label: 'Budget' },
    { key: 'alphabetical', label: 'A-Z' }
  ];
  
  const filterOptions: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'Fashion', label: 'Fashion' },
    { key: 'Tech', label: 'Tech' },
    { key: 'Music', label: 'Music' },
    { key: 'Lifestyle', label: 'Lifestyle' },
    { key: 'Comedy', label: 'Comedy' }
  ];
  
  const budgetOptions: { key: BudgetRange; label: string }[] = [
    { key: 'all', label: 'Any Budget' },
    { key: 'under-1000', label: 'Under $1K' },
    { key: '1000-5000', label: '$1K - $5K' },
    { key: '5000-10000', label: '$5K - $10K' },
    { key: 'over-10000', label: 'Over $10K' }
  ];
  
  const locationOptions: { key: LocationFilter; label: string }[] = [
    { key: 'all', label: 'All Locations' },
    { key: 'remote', label: 'Remote' },
    { key: 'local', label: 'Local' },
    { key: 'international', label: 'International' }
  ];
  
  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Brand Campaigns 💼</Text>
            <Text style={styles.headerSubtitle}>Find paid collaboration opportunities</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>{campaignStats.total} campaigns</Text>
            <Text style={styles.statsText}>${campaignStats.totalBudget.toLocaleString()} total</Text>
            <Text style={styles.statsText}>👁️ {realTimeStats.totalViews.toLocaleString()} views</Text>
            <Text style={styles.statsText}>📝 {realTimeStats.activeApplications} applications</Text>
            <Text style={styles.statsText}>🔥 {mockCampaigns.filter(c => c.featured).length} featured</Text>
            <Text style={styles.statsText}>⚠️ {mockCampaigns.filter(c => c.isUrgent).length} urgent</Text>
          </View>
        </View>
        
        {/* Trending Section */}
        <View style={styles.trendingSection}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.trendingText}>Trending: {realTimeStats.trending.join(', ')}</Text>
        </View>

        {/* Search Bar */}
        <TextInput
          placeholder="Search campaigns, brands, or niches..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
          right={
            <TextInput.Icon 
              icon="tune" 
              onPress={() => setShowFilters(!showFilters)}
            />
          }
        />
      </Animated.View>
      
      {/* Animated Filters */}
      <Animated.View style={[
        styles.filtersContainer,
        {
          maxHeight: filtersAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, showAdvancedFilters ? 280 : 120]
          }),
          opacity: filtersAnim
        }
      ]}>
        <View style={styles.filtersContent}>
          {/* Sort Options */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <View style={styles.filterChips}>
              {sortOptions.map(option => (
                <Chip
                  key={option.key}
                  selected={sortBy === option.key}
                  onPress={() => setSortBy(option.key)}
                  style={styles.filterChip}
                >
                  {option.label}
                </Chip>
              ))}
            </View>
          </View>
          
          {/* Category Filter Options */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category:</Text>
            <View style={styles.filterChips}>
              {filterOptions.map(option => (
                <Chip
                  key={option.key}
                  selected={filterBy === option.key}
                  onPress={() => setFilterBy(option.key)}
                  style={styles.filterChip}
                >
                  {option.label}
                </Chip>
              ))}
            </View>
          </View>
          
          {/* Advanced Filters Toggle */}
          <View style={styles.advancedToggle}>
            <TouchableOpacity 
              style={styles.advancedToggleButton}
              onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </Text>
              <MaterialCommunityIcons 
                name={showAdvancedFilters ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <>
              {/* Budget Range Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Budget Range:</Text>
                <View style={styles.filterChips}>
                  {budgetOptions.map(option => (
                    <Chip
                      key={option.key}
                      selected={budgetRange === option.key}
                      onPress={() => setBudgetRange(option.key)}
                      style={styles.filterChip}
                      mode={budgetRange === option.key ? 'flat' : 'outlined'}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>
              
              {/* Location Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Location:</Text>
                <View style={styles.filterChips}>
                  {locationOptions.map(option => (
                    <Chip
                      key={option.key}
                      selected={locationFilter === option.key}
                      onPress={() => setLocationFilter(option.key)}
                      style={styles.filterChip}
                      mode={locationFilter === option.key ? 'flat' : 'outlined'}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>
              
              {/* Clear All Filters */}
              <View style={styles.clearFiltersContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setFilterBy('all');
                    setBudgetRange('all');
                    setLocationFilter('all');
                    setSortBy('deadline');
                    showSuccessToast('🗑️ All filters cleared!');
                  }}
                  style={styles.clearFiltersButton}
                  icon="filter-off"
                >
                  Clear All Filters
                </Button>
              </View>
            </>
          )}
        </View>
      </Animated.View>
      
      {/* Campaigns List with Skeleton Loading */}
      {initialLoading ? (
        <View style={styles.campaignsContainer}>
          <CampaignsListSkeleton count={3} />
        </View>
      ) : (
        <FlatList
          data={filteredCampaigns}
          renderItem={renderCampaign}
          keyExtractor={(item) => item.id}
          style={styles.campaignsList}
          contentContainerStyle={styles.campaignsContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={3}
        />
      )}
      
      {/* Success Message */}
      <AnimatedSuccessMessage
        visible={showSuccess}
        message={successMessage}
        onDismiss={dismissSuccess}
      />
      
      {/* Floating Action Buttons */}
      <FAB
        style={styles.createFab}
        icon="plus"
        onPress={handleCreateCampaign}
        label="Create Campaign"
        visible={true}
      />
      <FAB
        style={styles.fab}
        icon="filter"
        onPress={() => setShowFilters(!showFilters)}
        label={showFilters ? 'Hide Filters' : 'Show Filters'}
        visible={!showFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: colors.surface,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  filtersContent: {
    padding: spacing.md,
  },
  filterGroup: {
    marginBottom: spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    marginRight: 0,
  },
  campaignsList: {
    flex: 1,
  },
  campaignsContainer: {
    padding: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    backgroundColor: colors.primary,
  },
  createFab: {
    position: 'absolute',
    bottom: spacing.lg + 70, // Above the filter FAB
    right: spacing.md,
    backgroundColor: colors.secondary,
  },
  advancedToggle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  advancedToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  advancedToggleText: {
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  clearFiltersContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  clearFiltersButton: {
    borderColor: colors.muted,
  },
  trendingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: spacing.xs,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.error,
    letterSpacing: 1,
  },
  trendingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
