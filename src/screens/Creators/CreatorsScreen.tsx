import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Animated, Dimensions } from 'react-native';
import { Text, Searchbar, Chip, Menu, Button, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';
import { createFadeAnimation, createStaggerAnimation, ANIMATION_DURATION, EASING } from '../../utils/animations';
import { useEnhancedSearch, useSearchSuggestions } from '../../hooks/useEnhancedSearch';
import { mockCreators } from '../../data/mockData';
import { Creator, Niche } from '../../data/types';
import { useAppStore } from '../../store/simpleStore';
import CreatorCard from '../../components/CreatorCard';
import SectionHeader from '../../components/SectionHeader';
import AnimatedSuccessMessage from '../../components/AnimatedSuccessMessage';
import { SearchResultsSkeleton, StatsBarSkeleton } from '../../components/SkeletonLoaders';
import { SwipeableCard, DoubleTapHandler } from '../../components/GestureInteractions';
import CreatorProfileScreen from './CreatorProfileScreen';

const { width: screenWidth } = Dimensions.get('window');

interface AnimatedCreatorCardProps {
  creator: Creator;
  onPress: (creator: Creator) => void;
  index: number;
  showSuccessToast: (message: string) => void;
  compareMode?: boolean;
  isSelectedForComparison?: boolean;
  onToggleComparison?: (creatorId: string) => void;
  showSocialPreviews?: boolean;
  viewMode?: 'list' | 'grid' | 'discover';
}

const AnimatedCreatorCard = ({ 
  creator, 
  onPress, 
  index, 
  showSuccessToast, 
  compareMode = false,
  isSelectedForComparison = false,
  onToggleComparison,
  showSocialPreviews = true,
  viewMode = 'list'
}: AnimatedCreatorCardProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { savedCreatorIds, followedCreatorIds, toggleSaveCreator, toggleFollowCreator } = useAppStore();
  
  const isSaved = savedCreatorIds?.includes(creator.id) || false;
  
  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;
    setTimeout(() => {
      Animated.parallel([
        createFadeAnimation(fadeAnim, 1, ANIMATION_DURATION.NORMAL),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.NORMAL,
          easing: EASING.EASE_OUT,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [index]);
  
  const handleSaveCreator = () => {
    toggleSaveCreator?.(creator.id);
    showSuccessToast(isSaved ? `❤️ Unfavorited ${creator.name}` : `❤️ Favorited ${creator.name}!`);
  };
  
  const handleFollowCreator = () => {
    const isFollowing = followedCreatorIds?.includes(creator.id) || false;
    toggleFollowCreator?.(creator.id);
    showSuccessToast(isFollowing ? `👋 Unfollowed ${creator.name}` : `🚀 Following ${creator.name}!`);
  };
  
  const isFollowing = followedCreatorIds?.includes(creator.id) || false;
  
  return (
    <Animated.View style={[
      styles.animatedCardContainer,
      viewMode === 'grid' && styles.gridCardContainer,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      {/* Comparison Mode Overlay */}
      {compareMode && (
        <View style={styles.compareOverlay}>
          <Button
            mode={isSelectedForComparison ? 'contained' : 'outlined'}
            onPress={() => onToggleComparison?.(creator.id)}
            icon={isSelectedForComparison ? 'check' : 'plus'}
            style={[
              styles.compareButton,
              isSelectedForComparison && styles.selectedCompareButton
            ]}
            compact
          >
            {isSelectedForComparison ? 'Selected' : 'Compare'}
          </Button>
        </View>
      )}
      
      <SwipeableCard
        leftAction={{
          icon: isSaved ? 'heart-off' : 'heart',
          color: colors.error,
          label: isSaved ? 'Unfavorite' : 'Favorite'
        }}
        rightAction={{
          icon: isFollowing ? 'account-minus' : 'account-plus',
          color: isFollowing ? colors.accent : colors.primary,
          label: isFollowing ? 'Unfollow' : 'Follow'
        }}
        onSwipeLeft={handleSaveCreator}
        onSwipeRight={handleFollowCreator}
      >
        <DoubleTapHandler
          onDoubleTap={handleSaveCreator}
          onSingleTap={() => compareMode ? onToggleComparison?.(creator.id) : onPress(creator)}
        >
          <View>
            <CreatorCard 
              creator={creator} 
              compact={viewMode === 'grid'}
              onPress={() => {}} // Handled by DoubleTapHandler
            />
            
            {/* Social Media Previews */}
            {showSocialPreviews && viewMode === 'list' && (
              <View style={styles.socialPreviewContainer}>
                <Text variant="bodySmall" style={styles.socialPreviewLabel}>
                  Recent Activity:
                </Text>
                <View style={styles.socialPreviewRow}>
                  {creator.instagramHandle && (
                    <View style={styles.socialPreviewItem}>
                      <MaterialCommunityIcons name="instagram" size={14} color={colors.accent} />
                      <Text style={styles.socialPreviewText}>2 posts today</Text>
                    </View>
                  )}
                  {creator.tikTokHandle && (
                    <View style={styles.socialPreviewItem}>
                      <MaterialCommunityIcons name="music-note" size={14} color={colors.textSecondary} />
                      <Text style={styles.socialPreviewText}>5 videos this week</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Enhanced Stats for Discover Mode */}
            {viewMode === 'discover' && (
              <View style={styles.discoverStatsContainer}>
                <View style={styles.discoverStat}>
                  <MaterialCommunityIcons name="trending-up" size={16} color={colors.success} />
                  <Text style={styles.discoverStatText}>Trending</Text>
                </View>
                <View style={styles.discoverStat}>
                  <MaterialCommunityIcons name="heart" size={16} color={colors.accent} />
                  <Text style={styles.discoverStatText}>{Math.floor(Math.random() * 100)}% match</Text>
                </View>
              </View>
            )}
          </View>
        </DoubleTapHandler>
      </SwipeableCard>
    </Animated.View>
  );
};

export default function CreatorsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Enhanced state for new features
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'discover'>('list');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedFollowerRange, setSelectedFollowerRange] = useState<string>('');
  const [showSpotlightOnly, setShowSpotlightOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showSocialPreviews, setShowSocialPreviews] = useState(true);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced search hook
  const {
    query,
    filters,
    searchResults,
    isSearching,
    updateQuery,
    updateFilters,
    clearSearch,
  } = useEnhancedSearch<Creator>(
    mockCreators,
    ['name', 'bio', 'niche', 'location'],
    { debounceMs: 300, maxResults: 100 }
  );
  
  // Initialize animations
  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      createFadeAnimation(headerAnim, 1, ANIMATION_DURATION.NORMAL),
      Animated.delay(200),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.NORMAL,
        easing: EASING.EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.delay(100),
      createFadeAnimation(filtersAnim, 1, ANIMATION_DURATION.NORMAL),
    ]).start();
  }, []);
  
  // Simulate initial data loading
  useEffect(() => {
    const loadCreators = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      setInitialLoading(false);
    };
    
    loadCreators();
  }, []);
  

  // Search suggestions
  const suggestions = useSearchSuggestions(query);

  const availableNiches: (Niche | 'All')[] = [
    'All', 'Comedy', 'Music', 'Fashion', 'Lifestyle', 'Tech'
  ];

  const followerRanges = [
    { label: 'All Followers', min: 0, max: Infinity, key: 'all' },
    { label: '1K - 10K', min: 1000, max: 10000, key: '1k-10k' },
    { label: '10K - 50K', min: 10000, max: 50000, key: '10k-50k' },
    { label: '50K - 100K', min: 50000, max: 100000, key: '50k-100k' },
    { label: '100K+', min: 100000, max: Infinity, key: '100k+' },
  ];
  
  const availableLocations = [
    'All Locations',
    'Harare, Zimbabwe',
    'Bulawayo, Zimbabwe', 
    'Gweru, Zimbabwe',
    'Mutare, Zimbabwe',
    'Other Zimbabwe'
  ];
  
  const sortOptions = [
    { label: 'Relevance', value: 'relevance', icon: 'sort' },
    { label: 'Most Followers', value: 'followers', icon: 'account-group' },
    { label: 'Alphabetical', value: 'alphabetical', icon: 'sort-alphabetical-ascending' },
    { label: 'Newest First', value: 'newest', icon: 'clock-plus' },
    { label: 'Trending', value: 'trending', icon: 'trending-up' },
    { label: 'Most Engaged', value: 'engagement', icon: 'heart-multiple' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh with enhanced feedback
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast(`🔄 Found ${searchResults.items.length} creators!`);
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

  const handleNicheFilter = (niche: string) => {
    updateFilters({ niche: niche === 'All' ? undefined : niche });
    const action = niche === 'All' ? 'Filter cleared' : `Filtered by ${niche}`;
    showSuccessToast(`🎨 ${action}`);
  };

  const handleFollowerFilter = (range: typeof followerRanges[0]) => {
    updateFilters({
      minFollowers: range.min === 0 ? undefined : range.min,
      maxFollowers: range.max === Infinity ? undefined : range.max,
    });
    showSuccessToast(`🔢 Filtered by ${range.label}`);
  };

  const handleSortChange = (sortBy: string) => {
    updateFilters({ sortBy });
    setShowSortMenu(false);
    const sortOption = sortOptions.find(option => option.value === sortBy);
    showSuccessToast(`🔄 Sorted by ${sortOption?.label}`);
  };
  
  // Enhanced filter handlers
  const handleLocationFilter = (location: string) => {
    setSelectedLocation(location);
    updateFilters({ location: location === 'All Locations' ? undefined : location });
    showSuccessToast(`📍 ${location === 'All Locations' ? 'Location filter cleared' : `Filtered by ${location}`}`);
  };
  
  const handleFollowerRangeFilter = (range: typeof followerRanges[0]) => {
    setSelectedFollowerRange(range.key);
    updateFilters({
      minFollowers: range.min === 0 ? undefined : range.min,
      maxFollowers: range.max === Infinity ? undefined : range.max,
    });
    showSuccessToast(`📊 Filtered by ${range.label}`);
  };
  
  const toggleSpotlightFilter = () => {
    const newValue = !showSpotlightOnly;
    setShowSpotlightOnly(newValue);
    updateFilters({ spotlight: newValue ? true : undefined });
    showSuccessToast(`⭐ ${newValue ? 'Showing only spotlight creators' : 'Showing all creators'}`);
  };
  
  // View mode handlers
  const handleViewModeChange = (mode: 'list' | 'grid' | 'discover') => {
    setViewMode(mode);
    showSuccessToast(`📱 Switched to ${mode} view`);
  };
  
  // Comparison feature handlers
  const toggleCompareMode = () => {
    const newMode = !compareMode;
    setCompareMode(newMode);
    if (!newMode) {
      setSelectedForComparison([]);
    }
    showSuccessToast(`🔀 ${newMode ? 'Compare mode enabled' : 'Compare mode disabled'}`);
  };
  
  const toggleCreatorComparison = (creatorId: string) => {
    if (selectedForComparison.includes(creatorId)) {
      setSelectedForComparison(prev => prev.filter(id => id !== creatorId));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison(prev => [...prev, creatorId]);
    } else {
      showSuccessToast('⚠️ Maximum 3 creators can be compared');
    }
  };
  
  const showComparison = () => {
    if (selectedForComparison.length >= 2) {
      showSuccessToast(`📊 Comparing ${selectedForComparison.length} creators`);
      // Navigate to comparison screen
    } else {
      showSuccessToast('⚠️ Select at least 2 creators to compare');
    }
  };
  
  // Load more content for infinite scroll
  const loadMoreCreators = () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
      showSuccessToast('🔄 More creators loaded!');
    }, 1000);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    clearSearch();
    setSelectedLocation('');
    setSelectedFollowerRange('');
    setShowSpotlightOnly(false);
    setCurrentPage(1);
    showSuccessToast('🧹 All filters cleared!');
  };

  const renderCreator = ({ item, index }: { item: Creator; index: number }) => (
    <AnimatedCreatorCard
      creator={item}
      onPress={setSelectedCreator}
      index={index}
      showSuccessToast={showSuccessToast}
      compareMode={compareMode}
      isSelectedForComparison={selectedForComparison.includes(item.id)}
      onToggleComparison={toggleCreatorComparison}
      showSocialPreviews={showSocialPreviews}
      viewMode={viewMode}
    />
  );

  const renderSuggestion = ({ item }: { item: { text: string; type: string } }) => (
    <View style={styles.suggestionItem}>
      <MaterialCommunityIcons
        name={item.type === 'history' ? 'history' : 'trending-up'}
        size={16}
        color={colors.textSecondary}
      />
                  <Button
                    mode="text"
                    onPress={() => updateQuery(item.text)}
                    style={styles.suggestionButton}
                    labelStyle={styles.suggestionText}
                  >
                    {item.text}
                  </Button>
    </View>
  );

  const { items: creators, totalCount } = searchResults;
  const hasFilters = filters.niche || filters.minFollowers || filters.sortBy !== 'relevance';

  // Show creator profile if selected
  if (selectedCreator) {
    return (
      <CreatorProfileScreen 
        creator={selectedCreator} 
        onBack={() => setSelectedCreator(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <Text variant="headlineMedium" style={styles.title}>
          Zimbabwe Creators 🇿🇼
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Discover {totalCount} amazing content creators
        </Text>
        
        {/* Animated Quick Stats with Skeleton */}
        {initialLoading ? (
          <StatsBarSkeleton />
        ) : (
          <Animated.View style={[
            styles.quickStats,
            {
              opacity: statsAnim,
              transform: [{
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              }]
            }
          ]}>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={styles.statNumber}>{totalCount}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Creators</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={styles.statNumber}>
              {creators.filter(c => c.spotlight).length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Spotlight</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={styles.statNumber}>
              {query ? creators.length : availableNiches.length - 1}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {query ? 'Results' : 'Categories'}
            </Text>
          </View>
          </Animated.View>
        )}
      </Animated.View>

      {/* Animated Search Bar */}
      <Animated.View style={[styles.searchContainer, { opacity: filtersAnim }]}>
        <Searchbar
          placeholder="Search creators, niches..."
          onChangeText={updateQuery}
          value={query}
          style={styles.searchBar}
          iconColor={colors.primary}
          loading={isSearching}
          right={() => (
            query.length > 0 ? (
              <Button
                mode="text"
                onPress={clearSearch}
                icon="close"
                style={styles.clearButton}
              />
            ) : null
          )}
        />

        {/* Search Suggestions */}
        {query.length > 0 && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions.slice(0, 3)}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => `${item.text}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </Animated.View>

      {/* Enhanced Filter Controls */}
      <Animated.View style={[
        styles.filtersContainer,
        {
          opacity: filtersAnim,
          transform: [{
            translateY: filtersAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }
      ]}>
        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <Text style={styles.filterSectionTitle}>View Mode:</Text>
          <View style={styles.viewModeButtons}>
            {[{mode: 'list', icon: 'view-list'}, {mode: 'grid', icon: 'view-grid'}, {mode: 'discover', icon: 'compass'}].map(({mode, icon}) => (
              <Button
                key={mode}
                mode={viewMode === mode ? 'contained' : 'outlined'}
                onPress={() => handleViewModeChange(mode as 'list' | 'grid' | 'discover')}
                icon={icon}
                style={[
                  styles.viewModeButton,
                  viewMode === mode && styles.selectedViewModeButton
                ]}
                compact
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </View>
        </View>
        
        {/* Niche Filter */}
        <View style={styles.chipContainer}>
          <Text style={styles.filterSectionTitle}>Filter by Category:</Text>
          <View style={styles.chipsWrapper}>
            {availableNiches.map((niche) => (
              <Chip
                key={niche}
                selected={filters.niche === niche || (niche === 'All' && !filters.niche)}
                onPress={() => handleNicheFilter(niche)}
                style={[
                  styles.filterChip,
                  (filters.niche === niche || (niche === 'All' && !filters.niche)) && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  (filters.niche === niche || (niche === 'All' && !filters.niche)) && styles.selectedChipText
                ]}
              >
                {niche}
              </Chip>
            ))}
          </View>
        </View>
        
        {/* Location Filter */}
        <View style={styles.chipContainer}>
          <Text style={styles.filterSectionTitle}>Filter by Location:</Text>
          <View style={styles.chipsWrapper}>
            {availableLocations.map((location) => (
              <Chip
                key={location}
                selected={selectedLocation === location || (location === 'All Locations' && !selectedLocation)}
                onPress={() => handleLocationFilter(location)}
                style={[
                  styles.filterChip,
                  (selectedLocation === location || (location === 'All Locations' && !selectedLocation)) && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  (selectedLocation === location || (location === 'All Locations' && !selectedLocation)) && styles.selectedChipText
                ]}
              >
                {location.replace(', Zimbabwe', '')}
              </Chip>
            ))}
          </View>
        </View>
        
        {/* Follower Range Filter */}
        <View style={styles.chipContainer}>
          <Text style={styles.filterSectionTitle}>Filter by Followers:</Text>
          <View style={styles.chipsWrapper}>
            {followerRanges.map((range) => (
              <Chip
                key={range.key}
                selected={selectedFollowerRange === range.key}
                onPress={() => handleFollowerRangeFilter(range)}
                style={[
                  styles.filterChip,
                  selectedFollowerRange === range.key && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedFollowerRange === range.key && styles.selectedChipText
                ]}
              >
                {range.label}
              </Chip>
            ))}
          </View>
        </View>
        
        {/* Special Filters */}
        <View style={styles.specialFiltersContainer}>
          <Button
            mode={showSpotlightOnly ? 'contained' : 'outlined'}
            onPress={toggleSpotlightFilter}
            icon="star"
            style={[
              styles.specialFilterButton,
              showSpotlightOnly && styles.selectedSpecialFilter
            ]}
            compact
          >
            Spotlight Only
          </Button>
          
          <Button
            mode={showSocialPreviews ? 'contained' : 'outlined'}
            onPress={() => setShowSocialPreviews(!showSocialPreviews)}
            icon="instagram"
            style={[
              styles.specialFilterButton,
              showSocialPreviews && styles.selectedSpecialFilter
            ]}
            compact
          >
            Social Previews
          </Button>
        </View>

        {/* Enhanced Actions Container */}
        <View style={styles.actionsContainer}>
          <Menu
            visible={showSortMenu}
            onDismiss={() => setShowSortMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowSortMenu(true)}
                icon="sort"
                style={styles.actionButton}
                compact
              >
                Sort
              </Button>
            }
          >
            {sortOptions.map((option) => (
              <Menu.Item 
                key={option.value}
                onPress={() => handleSortChange(option.value)} 
                title={option.label}
                leadingIcon={option.icon}
              />
            ))}
          </Menu>
          
          <Button
            mode={compareMode ? 'contained' : 'outlined'}
            onPress={toggleCompareMode}
            icon="compare"
            style={[
              styles.actionButton,
              compareMode && styles.selectedActionButton
            ]}
            compact
          >
            Compare
          </Button>

          {(hasFilters || selectedLocation || selectedFollowerRange || showSpotlightOnly) && (
            <Button
              mode="text"
              onPress={clearAllFilters}
              icon="filter-off"
              style={styles.actionButton}
              compact
            >
              Clear All
            </Button>
          )}
        </View>
        
        {/* Comparison Controls */}
        {compareMode && selectedForComparison.length > 0 && (
          <View style={styles.comparisonControls}>
            <Text style={styles.comparisonText}>
              {selectedForComparison.length} creator{selectedForComparison.length > 1 ? 's' : ''} selected
            </Text>
            <View style={styles.comparisonActions}>
              <Button
                mode="contained"
                onPress={showComparison}
                icon="chart-line"
                disabled={selectedForComparison.length < 2}
                style={styles.compareNowButton}
                compact
              >
                Compare Now
              </Button>
              <Button
                mode="outlined"
                onPress={() => setSelectedForComparison([])}
                icon="close"
                style={styles.clearComparisonButton}
                compact
              >
                Clear
              </Button>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Results Header */}
      <SectionHeader 
        title={`${creators.length} Creator${creators.length !== 1 ? 's' : ''}`}
        subtitle={query ? `Results for "${query}"` : 'Featured Zimbabwe creators'}
      />

      {/* Creators List with Skeleton Loading */}
      {initialLoading ? (
        <View style={styles.creatorsList}>
          <SearchResultsSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          data={creators}
          renderItem={renderCreator}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.creatorsList,
            viewMode === 'grid' && styles.gridList,
            creators.length === 0 && styles.emptyList
          ]}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          onEndReached={loadMoreCreators}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <MaterialCommunityIcons
                  name="loading"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.loadingMoreText}>Loading more creators...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={viewMode === 'discover' ? 'compass-off' : 'account-search'}
                size={64}
                color={colors.textSecondary}
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {viewMode === 'discover' ? 'No recommendations found' : 'No creators found'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {viewMode === 'discover' 
                  ? 'Try adjusting your interests or follow more creators' 
                  : 'Try adjusting your search or filters'
                }
              </Text>
            </View>
          }
        />
      )}
      
      {/* Enhanced Success Message */}
      <AnimatedSuccessMessage
        visible={showSuccess}
        message={successMessage}
        onDismiss={dismissSuccess}
        icon={successMessage.includes('🔄') ? 'reload' :
              successMessage.includes('🎨') ? 'palette' :
              successMessage.includes('🔢') ? 'sort-numeric-variant' :
              'check-circle'}
      />
      
      {/* Floating Action Button for Quick Actions */}
      <FAB
        style={styles.fab}
        icon={showFilters ? 'filter-off' : 'filter'}
        onPress={() => {
          setShowFilters(!showFilters);
          showSuccessToast(showFilters ? '💫 Filters hidden' : '🌊 Filters shown');
        }}
        label={showFilters ? 'Hide Filters' : 'Show Filters'}
        visible={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  animatedCardContainer: {
    marginVertical: spacing.xs,
  },
  gridCardContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    ...shadow.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchBar: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  clearButton: {
    margin: 0,
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
  suggestionsList: {
    paddingHorizontal: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionButton: {
    marginLeft: spacing.xs,
  },
  suggestionText: {
    fontSize: 12,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  chipContainer: {
    marginBottom: spacing.sm,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
  },
  selectedChipText: {
    color: colors.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderColor: colors.border,
  },
  creatorsList: {
    paddingHorizontal: spacing.sm,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    backgroundColor: colors.primary,
  },
  
  // Enhanced styles for new features
  viewModeContainer: {
    marginBottom: spacing.md,
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewModeButton: {
    flex: 1,
    borderColor: colors.border,
  },
  selectedViewModeButton: {
    backgroundColor: colors.primary,
  },
  
  specialFiltersContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  specialFilterButton: {
    flex: 1,
    borderColor: colors.border,
  },
  selectedSpecialFilter: {
    backgroundColor: colors.primary,
  },
  
  selectedActionButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  comparisonControls: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    ...shadow.sm,
  },
  comparisonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  comparisonActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compareNowButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  clearComparisonButton: {
    flex: 1,
    borderColor: colors.accent,
  },
  
  // Grid layout styles
  gridList: {
    paddingHorizontal: spacing.sm,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  
  // Loading and empty states
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  loadingMoreText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  
  // Creator card enhancements
  compareOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
  },
  compareButton: {
    borderColor: colors.primary,
  },
  selectedCompareButton: {
    backgroundColor: colors.primary,
  },
  
  socialPreviewContainer: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  socialPreviewLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  socialPreviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  socialPreviewText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  
  discoverStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  discoverStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  discoverStatText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
