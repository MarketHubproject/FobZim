import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Animated } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';

import CreatorCard from '../../components/CreatorCard';
import PostPreview from '../../components/PostPreview';
import SectionHeader from '../../components/SectionHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import AnimatedSuccessMessage from '../../components/AnimatedSuccessMessage';
import { 
  HorizontalCreatorListSkeleton, 
  StatsBarSkeleton, 
  HomeScreenSkeleton 
} from '../../components/SkeletonLoaders';

import { mockCreators, mockPosts, mockCampaigns, dailyTips, mockTrends } from '../../data/mockData';
import { Creator, Post, Campaign, Trend, Niche } from '../../data/types';
import { useAppStore } from '../../store/simpleStore';
import TrendItem from '../../components/TrendItem';

export default function HomeScreen() {
  console.log('🏠 HomeScreen rendering...');
  
  const { 
    savedTips,
    savedCampaignIds, 
    appliedCampaignIds,
    savedCreatorIds,
    followedCreatorIds,
    saveTip, 
    removeSavedTip, 
    toggleSaveCampaign, 
    markCampaignApplied,
    toggleSaveCreator,
    toggleFollowCreator,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    enableAutoSave,
    disableAutoSave,
    autoSaveEnabled
  } = useAppStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Enhanced state for new features
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<Niche[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  
  // Animation values
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  
  // Enhanced initial loading with animations
  useEffect(() => {
    const loadInitialData = async () => {
      // Start entrance animations
      Animated.sequence([
        Animated.timing(searchBarAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInitialLoading(false);
    };
    
    loadInitialData();
  }, []);
  
  // Available niches for filtering
  const availableNiches: Niche[] = ['Comedy', 'Music', 'Fashion', 'Lifestyle', 'Tech'];
  
  // Enhanced data processing with filtering and search
  const { spotlightCreators, recentPosts, topCampaigns, trendingTopics, todaysTip, homeData, filteredData } = useMemo(() => {
    // Show skeleton data while loading
    if (initialLoading) {
      return {
        spotlightCreators: [],
        recentPosts: [],
        topCampaigns: [],
        trendingTopics: [],
        todaysTip: '',
        homeData: [{ id: 'skeleton', type: 'skeleton' }],
        filteredData: { creators: [], posts: [], campaigns: [] }
      };
    }
    
    // Apply filters
    let filteredCreators = mockCreators;
    let filteredPosts = mockPosts;
    let filteredCampaigns = mockCampaigns;
    
    // Filter by selected niches
    if (selectedNiches.length > 0) {
      filteredCreators = filteredCreators.filter(creator => 
        selectedNiches.includes(creator.niche)
      );
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        selectedNiches.includes(campaign.niche)
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredCreators = filteredCreators.filter(creator => 
        creator.name.toLowerCase().includes(query) ||
        creator.niche.toLowerCase().includes(query) ||
        creator.bio?.toLowerCase().includes(query)
      );
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.brand.toLowerCase().includes(query) ||
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
      );
    }
    
    // Get base data
    const spotlight = mockCreators.filter(creator => creator.spotlight).slice(0, 5);
    const recent = mockPosts.slice(0, currentPage * 10);
    const campaigns = mockCampaigns.slice(0, 3);
    const trends = mockTrends.slice(0, 3);
    const tip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    
    // Create sections for FlatList
    let sections = [];
    
    // If searching or filtering, show filtered results
    if (searchQuery.trim() || selectedNiches.length > 0) {
      sections = [
        { id: 'search-results', type: 'search-results' },
        ...(filteredCreators.length > 0 ? [
          { id: 'filtered-creators-header', type: 'section-header', title: 'Creators', subtitle: `${filteredCreators.length} results` },
          ...filteredCreators.map(creator => ({ id: `creator-${creator.id}`, type: 'creator-card', data: creator }))
        ] : []),
        ...(filteredCampaigns.length > 0 ? [
          { id: 'filtered-campaigns-header', type: 'section-header', title: 'Campaigns', subtitle: `${filteredCampaigns.length} results` },
          ...filteredCampaigns.map(campaign => ({ id: campaign.id, type: 'campaign', data: campaign }))
        ] : []),
        { id: 'spacer', type: 'spacer' }
      ];
    } else {
      // Default home feed
      sections = [
        { id: 'welcome', type: 'welcome' },
        { id: 'tip', type: 'tip', data: tip },
        { id: 'creators-header', type: 'section-header', title: 'Spotlight Creators', subtitle: 'Rising stars from Zimbabwe' },
        { id: 'creators', type: 'horizontal-creators', data: spotlight },
        { id: 'trends-header', type: 'section-header', title: 'Trending Now', subtitle: 'What\'s hot in Zimbabwe' },
        { id: 'trends', type: 'horizontal-trends', data: trends },
        { id: 'posts-header', type: 'section-header', title: 'Latest Content', subtitle: 'Fresh posts from creators' },
        { id: 'posts', type: 'vertical-posts', data: recent },
        { id: 'campaigns-header', type: 'section-header', title: 'Brand Opportunities', subtitle: 'Featured campaigns for creators' },
        ...campaigns.map(campaign => ({ id: campaign.id, type: 'campaign', data: campaign })),
        { id: 'spacer', type: 'spacer' }
      ];
    }
    
    return {
      spotlightCreators: spotlight,
      recentPosts: recent,
      topCampaigns: campaigns,
      trendingTopics: trends,
      todaysTip: tip,
      homeData: sections,
      filteredData: {
        creators: filteredCreators,
        posts: filteredPosts,
        campaigns: filteredCampaigns
      }
    };
  }, [savedTips, savedCampaignIds, appliedCampaignIds, showSuccess, initialLoading, searchQuery, selectedNiches, currentPage]);

  // Enhanced refresh with real-time updates
  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    
    // Animate search bar hide during refresh
    Animated.timing(searchBarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Simulate API call with better UX
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast('🔄 Fresh content loaded!');
      
      // Restore search bar
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 1500);
  };
  
  // Load more content (infinite scroll)
  const loadMoreContent = () => {
    if (loadingMore || searchQuery.trim() || selectedNiches.length > 0) return;
    
    setLoadingMore(true);
    
    // Animate FAB during loading
    Animated.timing(fabAnim, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
      
      // Restore FAB
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };
  
  // Enhanced search functionality
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  
  // Filter functionality
  const toggleNicheFilter = (niche: Niche) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSelectedNiches([]);
    setSearchQuery('');
    setCurrentPage(1);
    showSuccessToast('🧹 Filters cleared!');
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    const newValue = !showFilters;
    setShowFilters(newValue);
    
    Animated.timing(filtersAnim, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Enhanced like functionality
  const handleLikePost = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    const wasLiked = likedPosts.has(postId);
    
    if (wasLiked) {
      newLikedPosts.delete(postId);
      showSuccessToast('💔 Post unliked');
    } else {
      newLikedPosts.add(postId);
      showSuccessToast('❤️ Post liked!');
    }
    
    setLikedPosts(newLikedPosts);
  };
  
  // Share functionality
  const handleSharePost = (post: Post) => {
    showSuccessToast(`📤 Shared ${post.caption.substring(0, 20)}...`);
  };

  const handleSaveTip = (tip: string) => {
    if (savedTips.includes(tip)) {
      removeSavedTip(tip);
      showSuccessToast('💡 Tip removed from saved!');
    } else {
      saveTip(tip);
      showSuccessToast('💡 Tip saved to your collection!');
    }
  };

  const handleApplyToCampaign = (campaign: Campaign) => {
    markCampaignApplied(campaign.id);
    showSuccessToast(`🚀 Applied to ${campaign.brand} campaign!`);
  };

  const handleSaveCampaign = (campaignId: string) => {
    const wasSaved = savedCampaignIds.includes(campaignId);
    toggleSaveCampaign(campaignId);
    showSuccessToast(wasSaved ? '📌 Campaign removed!' : '📌 Campaign saved!');
  };

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const dismissSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };

  const renderCreator = ({ item }: { item: Creator }) => (
    <CreatorCard 
      creator={item} 
      compact
      onPress={() => showSuccessToast(`👤 Viewing ${item.name}'s profile`)}
    />
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostPreview 
      post={item} 
      compact
      onPress={() => showSuccessToast(`📱 Viewing ${item.caption.substring(0, 30)}...`)}
    />
  );
  
  const renderFullPost = ({ item }: { item: Post }) => (
    <View style={styles.fullPostContainer}>
      <PostPreview 
        post={item}
        onPress={() => showSuccessToast(`📱 Viewing ${item.caption.substring(0, 30)}...`)}
      />
      <View style={styles.postActions}>
        <Button
          mode="text"
          icon={likedPosts.has(item.id) ? 'heart' : 'heart-outline'}
          onPress={() => handleLikePost(item.id)}
          style={styles.actionButton}
          labelStyle={[styles.actionLabel, likedPosts.has(item.id) && styles.likedLabel]}
        >
          Like
        </Button>
        <Button
          mode="text"
          icon="share-variant"
          onPress={() => handleSharePost(item)}
          style={styles.actionButton}
          labelStyle={styles.actionLabel}
        >
          Share
        </Button>
      </View>
    </View>
  );
  
  const renderTrend = ({ item }: { item: Trend }) => (
    <TrendItem 
      trend={item} 
      compact
      onPress={() => showSuccessToast(`🗒 Exploring ${item.hashtag} trend`)}
    />
  );

  // Main render item function for optimized FlatList
  const renderHomeItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'welcome':
        return (
          <View style={styles.welcomeSection}>
            <Text variant="headlineMedium" style={styles.greeting}>
              Welcome to FobZim! 🇿🇼
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Discover Zimbabwe's rising content creators
            </Text>
          </View>
        );
        
      case 'tip':
        return (
          <Card style={styles.tipCard} elevation={2}>
            <View style={styles.tipContent}>
              <View style={styles.tipHeader}>
                <MaterialCommunityIcons 
                  name="lightbulb" 
                  size={24} 
                  color={colors.secondary} 
                />
                <Text variant="titleMedium" style={styles.tipTitle}>
                  Creator Tip of the Day
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.tipText}>
                {item.data}
              </Text>
              <View style={styles.tipActions}>
                <Button
                  mode={savedTips.includes(item.data) ? 'contained' : 'outlined'}
                  onPress={() => handleSaveTip(item.data)}
                  style={styles.saveTipButton}
                  icon={savedTips.includes(item.data) ? 'bookmark' : 'bookmark-outline'}
                  labelStyle={styles.saveTipLabel}
                >
                  {savedTips.includes(item.data) ? 'Saved ✓' : 'Save Tip'}
                </Button>
              </View>
            </View>
          </Card>
        );
        
      case 'section-header':
        return (
          <SectionHeader 
            title={item.title} 
            subtitle={item.subtitle}
            actionText="See All"
            onActionPress={() => {}}
          />
        );
        
      case 'horizontal-creators':
        return (
          <FlatList
            data={item.data}
            renderItem={renderCreator}
            keyExtractor={(creator) => creator.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        );
        
      case 'horizontal-posts':
        return (
          <FlatList
            data={item.data}
            renderItem={renderPost}
            keyExtractor={(post) => post.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        );
        
      case 'vertical-posts':
        return (
          <View style={styles.verticalPostsContainer}>
            {item.data.slice(0, 5).map((post: Post) => (
              <View key={post.id}>
                {renderFullPost({ item: post })}
              </View>
            ))}
            {item.data.length > 5 && (
              <Button 
                mode="outlined" 
                onPress={loadMoreContent}
                style={styles.loadMoreButton}
                loading={loadingMore}
                icon="chevron-down"
              >
                {loadingMore ? 'Loading...' : `Load ${Math.min(5, item.data.length - 5)} more posts`}
              </Button>
            )}
          </View>
        );
        
      case 'horizontal-trends':
        return (
          <FlatList
            data={item.data}
            renderItem={renderTrend}
            keyExtractor={(trend) => trend.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        );
        
      case 'creator-card':
        return (
          <CreatorCard 
            creator={item.data} 
            onPress={() => showSuccessToast(`👤 Viewing ${item.data.name}'s profile`)}
          />
        );
        
      case 'search-results':
        const totalResults = filteredData.creators.length + filteredData.campaigns.length;
        return (
          <View style={styles.searchResultsHeader}>
            <Text variant="titleMedium" style={styles.searchResultsTitle}>
              {totalResults === 0 ? 'No results found' : `${totalResults} results found`}
            </Text>
            {totalResults === 0 && (
              <Text variant="bodyMedium" style={styles.searchResultsSubtitle}>
                Try adjusting your search or filters
              </Text>
            )}
            {(searchQuery.trim() || selectedNiches.length > 0) && (
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.clearFiltersButton}
                icon="close"
              >
                Clear Filters
              </Button>
            )}
          </View>
        );
        
      case 'campaign':
        const campaign = item.data;
        const isApplied = appliedCampaignIds.includes(campaign.id);
        const isSaved = savedCampaignIds.includes(campaign.id);
        
        return (
          <Card key={campaign.id} style={styles.campaignCard} elevation={2}>
            <View style={styles.campaignContent}>
              <View style={styles.campaignInfo}>
                <View style={styles.campaignHeader}>
                  <Text variant="titleMedium" style={styles.campaignTitle}>
                    {campaign.brand}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => handleSaveCampaign(campaign.id)}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonLabel}
                    icon={isSaved ? 'bookmark' : 'bookmark-outline'}
                  >
                    {isSaved ? 'Saved ✓' : 'Save'}
                  </Button>
                </View>
                <Text variant="bodyMedium" style={styles.campaignDescription}>
                  {campaign.title}
                </Text>
                <View style={styles.campaignMeta}>
                  <View style={styles.budgetContainer}>
                    <MaterialCommunityIcons 
                      name="currency-usd" 
                      size={16} 
                      color={colors.success} 
                    />
                    <Text variant="bodySmall" style={styles.budgetText}>
                      ${campaign.budgetUSD}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.deadlineText}>
                    Deadline: {new Date(campaign.deadlineISO).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.campaignActions}>
                <Button 
                  mode={isApplied ? "outlined" : "contained"}
                  style={[styles.applyButton, isApplied && styles.appliedButton]}
                  labelStyle={[styles.applyButtonText, isApplied && styles.appliedButtonText]}
                  onPress={() => handleApplyToCampaign(campaign)}
                  disabled={isApplied}
                  icon={isApplied ? 'check' : 'send'}
                >
                  {isApplied ? 'Applied ✓' : 'Apply Now'}
                </Button>
              </View>
            </View>
          </Card>
        );
        
      case 'spacer':
        return <View style={styles.bottomSpacing} />;
        
      case 'skeleton':
        return <HomeScreenSkeleton />;
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Search Bar */}
      <Animated.View style={[styles.searchContainer, {
        opacity: searchBarAnim,
        transform: [{
          translateY: searchBarAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-60, 0]
          })
        }]
      }]}>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search creators, campaigns..."
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={colors.primary}
            placeholderTextColor={colors.textSecondary}
            inputStyle={styles.searchInput}
          />
          <Button
            mode={showFilters ? 'contained' : 'outlined'}
            onPress={toggleFilters}
            style={styles.filterToggle}
            icon="filter-variant"
            compact
          >
            Filters
          </Button>
        </View>
        
        {/* Animated Filters */}
        <Animated.View style={[styles.filtersContainer, {
          opacity: filtersAnim,
          maxHeight: filtersAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 120]
          })
        }]}>
          <Text variant="bodySmall" style={styles.filtersLabel}>Filter by niche:</Text>
          <View style={styles.nichesRow}>
            {availableNiches.map(niche => (
              <Chip
                key={niche}
                selected={selectedNiches.includes(niche)}
                onPress={() => toggleNicheFilter(niche)}
                style={[
                  styles.nicheChip,
                  selectedNiches.includes(niche) && styles.selectedNicheChip
                ]}
                textStyle={[
                  styles.nicheChipText,
                  selectedNiches.includes(niche) && styles.selectedNicheChipText
                ]}
              >
                {niche}
              </Chip>
            ))}
          </View>
          {selectedNiches.length > 0 && (
            <Button
              mode="text"
              onPress={clearFilters}
              style={styles.clearFiltersSmall}
              icon="close"
              compact
            >
              Clear
            </Button>
          )}
        </Animated.View>
      </Animated.View>
      
      {/* Enhanced FlatList */}
      <FlatList
        data={homeData}
        renderItem={renderHomeItem}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        onEndReached={loadMoreContent}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Enhanced Floating Action Button */}
      <Animated.View style={[styles.fabContainer, {
        transform: [{ scale: fabAnim }]
      }]}>
        <FAB
          icon={searchQuery.trim() || selectedNiches.length > 0 ? 'home' : 'refresh'}
          onPress={searchQuery.trim() || selectedNiches.length > 0 ? clearFilters : onRefresh}
          style={styles.fab}
          color={colors.white}
        />
      </Animated.View>
      
      {/* Enhanced Animated Success Message */}
      <AnimatedSuccessMessage
        visible={showSuccess}
        message={successMessage}
        onDismiss={dismissSuccess}
        icon={successMessage.includes('💡') ? 'lightbulb' : 
              successMessage.includes('🚀') ? 'rocket-launch' :
              successMessage.includes('📌') ? 'bookmark' :
              successMessage.includes('❤️') ? 'heart' :
              successMessage.includes('🔄') ? 'refresh' :
              'check-circle'}
      />
      
      <LoadingOverlay 
        visible={loading} 
        message="Loading Zimbabwe's best creators..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Enhanced search and filter styles
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  searchInput: {
    color: colors.textPrimary,
  },
  filterToggle: {
    borderColor: colors.primary,
  },
  filtersContainer: {
    overflow: 'hidden',
    paddingTop: spacing.sm,
  },
  filtersLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nichesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  nicheChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedNicheChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  nicheChipText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  selectedNicheChipText: {
    color: colors.white,
  },
  clearFiltersSmall: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  
  // Enhanced content styles
  flatList: {
    flex: 1,
  },
  fullPostContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    minWidth: 80,
  },
  actionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  likedLabel: {
    color: colors.accent,
  },
  verticalPostsContainer: {
    marginBottom: spacing.md,
  },
  loadMoreButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderColor: colors.primary,
  },
  
  // Search results styles
  searchResultsHeader: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  searchResultsTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  searchResultsSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  clearFiltersButton: {
    borderColor: colors.accent,
    alignSelf: 'flex-start',
  },
  
  // FAB styles
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  fab: {
    backgroundColor: colors.primary,
  },
  welcomeSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  greeting: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  tipContent: {
    padding: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  tipText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  horizontalList: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
  },
  campaignCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  campaignContent: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  campaignTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  campaignDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    color: colors.success,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  deadlineText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  tipActions: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  saveTipButton: {
    borderColor: colors.primary,
  },
  saveTipLabel: {
    fontSize: 14,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginRight: -spacing.sm,
  },
  saveButtonLabel: {
    fontSize: 12,
  },
  campaignActions: {
    justifyContent: 'center',
  },
  appliedButton: {
    borderColor: colors.success,
    backgroundColor: 'transparent',
  },
  appliedButtonText: {
    color: colors.success,
  },
});