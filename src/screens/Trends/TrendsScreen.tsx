import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Chip, Searchbar, Button, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';
import TrendItem from '../../components/TrendItem';
import SectionHeader from '../../components/SectionHeader';
import { mockTrends } from '../../data/mockData';
import { useAppStore } from '../../store/simpleStore';
import { useEnhancedSearch, useSearchSuggestions } from '../../hooks/useEnhancedSearch';
import { Trend } from '../../data/types';

export default function TrendsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Enhanced search hook
  const {
    query,
    filters,
    searchResults,
    isSearching,
    updateQuery,
    updateFilters,
    clearSearch,
  } = useEnhancedSearch<Trend>(
    mockTrends,
    ['hashtag', 'description', 'category', 'relatedNiches'],
    { debounceMs: 250, maxResults: 100 }
  );
  

  // Search suggestions
  const suggestions = useSearchSuggestions(query);

  const categories = ['All', 'Challenge', 'Topic', 'Idea'];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleCategoryFilter = (category: string) => {
    updateFilters({ category: category === 'All' ? undefined : category });
  };

  const handleSortChange = (sortBy: 'relevance' | 'recent' | 'alphabetical') => {
    updateFilters({ sortBy });
    setShowSortMenu(false);
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Trending in Zimbabwe 🇿🇼
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Discover what's buzzing in Zimbabwe's creative community
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search trends, hashtags..."
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
              renderItem={({ item }) => (
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
              )}
              keyExtractor={(item, index) => `${item.text}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        <Text variant="titleSmall" style={styles.filtersTitle}>
          Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {categories.map((category) => (
            <Chip
              key={category}
              selected={filters.category === category || (category === 'All' && !filters.category)}
              onPress={() => handleCategoryFilter(category)}
              style={[
                styles.categoryChip,
                (filters.category === category || (category === 'All' && !filters.category)) && styles.selectedChip
              ]}
              textStyle={[
                styles.chipText,
                (filters.category === category || (category === 'All' && !filters.category)) && styles.selectedChipText
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        {/* Sort Menu */}
        <View style={styles.sortContainer}>
          <Menu
            visible={showSortMenu}
            onDismiss={() => setShowSortMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowSortMenu(true)}
                icon="sort"
                style={styles.sortButton}
                compact
              >
                Sort
              </Button>
            }
          >
            <Menu.Item onPress={() => handleSortChange('relevance')} title="Relevance" />
            <Menu.Item onPress={() => handleSortChange('recent')} title="Most Recent" />
            <Menu.Item onPress={() => handleSortChange('alphabetical')} title="A-Z" />
          </Menu>
        </View>
      </View>

      {/* Trends List */}
      <SectionHeader 
        title={`${searchResults.items.length} Trending ${filters.category || 'Topics'}`}
        subtitle={query ? `Results for "${query}"` : 'Tap bookmark to save for later'}
      />
      
      <FlatList
        data={searchResults.items}
        renderItem={({ item }) => (
          <TrendItem
            key={item.id}
            trend={item}
            onPress={() => {}}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.trendsList,
          searchResults.items.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="magnify" 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No trends found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Try adjusting your search or category filter
            </Text>
          </View>
        }
      />

      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchBar: {
    backgroundColor: colors.surface,
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filtersTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  filtersScroll: {
    paddingLeft: spacing.md,
  },
  categoryChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
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
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
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
  bottomSpacing: {
    height: spacing.xl,
  },
  clearButton: {
    margin: 0,
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
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
  sortContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  sortButton: {
    borderColor: colors.border,
  },
  trendsList: {
    paddingBottom: spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
});
