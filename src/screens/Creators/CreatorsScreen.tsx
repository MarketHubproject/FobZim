import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, Menu, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';
import { useEnhancedSearch, useSearchSuggestions } from '../../hooks/useEnhancedSearch';
import { mockCreators } from '../../data/mockData';
import { Creator } from '../../data/types';
import CreatorCard from '../../components/CreatorCard';
import SectionHeader from '../../components/SectionHeader';
import CreatorProfileScreen from './CreatorProfileScreen';

export default function CreatorsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  
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
  

  // Search suggestions
  const suggestions = useSearchSuggestions(query);

  const availableNiches = [
    'All', 'Comedy', 'Dance', 'Music', 'Fashion', 'Food', 
    'Lifestyle', 'Fitness', 'Beauty', 'Tech', 'Education'
  ];

  const followerRanges = [
    { label: 'All Followers', min: 0, max: Infinity },
    { label: '1K - 10K', min: 1000, max: 10000 },
    { label: '10K - 50K', min: 10000, max: 50000 },
    { label: '50K - 100K', min: 50000, max: 100000 },
    { label: '100K+', min: 100000, max: Infinity },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleNicheFilter = (niche: string) => {
    updateFilters({ niche: niche === 'All' ? undefined : niche });
  };

  const handleFollowerFilter = (range: typeof followerRanges[0]) => {
    updateFilters({
      minFollowers: range.min === 0 ? undefined : range.min,
      maxFollowers: range.max === Infinity ? undefined : range.max,
    });
  };

  const handleSortChange = (sortBy: 'relevance' | 'followers' | 'alphabetical') => {
    updateFilters({ sortBy });
    setShowSortMenu(false);
  };

  const renderCreator = ({ item }: { item: Creator }) => (
    <CreatorCard 
      creator={item} 
      onPress={() => setSelectedCreator(item)}
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
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Zimbabwe Creators 🇿🇼
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Discover {totalCount} amazing content creators
        </Text>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
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
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
      </View>

      {/* Filter Controls */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Niche Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
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
          </ScrollView>
        </ScrollView>

        {/* Sort and Filter Actions */}
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
            <Menu.Item onPress={() => handleSortChange('relevance')} title="Relevance" />
            <Menu.Item onPress={() => handleSortChange('followers')} title="Followers" />
            <Menu.Item onPress={() => handleSortChange('alphabetical')} title="Name A-Z" />
          </Menu>

          {hasFilters && (
            <Button
              mode="text"
              onPress={clearSearch}
              icon="filter-off"
              style={styles.actionButton}
              compact
            >
              Clear
            </Button>
          )}
        </View>
      </View>

      {/* Results Header */}
      <SectionHeader 
        title={`${creators.length} Creator${creators.length !== 1 ? 's' : ''}`}
        subtitle={query ? `Results for "${query}"` : 'Featured Zimbabwe creators'}
      />

      {/* Creators List */}
      <FlatList
        data={creators}
        renderItem={renderCreator}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
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
          creators.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-search"
              size={64}
              color={colors.textSecondary}
            />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No creators found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
});
