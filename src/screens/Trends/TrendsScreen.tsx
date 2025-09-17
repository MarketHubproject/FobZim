import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Chip, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';
import TrendItem from '../../components/TrendItem';
import SectionHeader from '../../components/SectionHeader';
import { mockTrends } from '../../data/mockData';
import { useAppStore } from '../../store/useAppStore';

export default function TrendsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { searchQuery, setSearchQuery, addToSearchHistory } = useAppStore();

  const categories = ['All', 'Challenge', 'Topic', 'Idea'];
  
  const filteredTrends = mockTrends.filter(trend => {
    const matchesCategory = selectedCategory === 'All' || trend.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      trend.hashtag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      addToSearchHistory(query);
    }
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
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
        />
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
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedChip
              ]}
              textStyle={[
                styles.chipText,
                selectedCategory === category && styles.selectedChipText
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Trends List */}
      <SectionHeader 
        title={`${filteredTrends.length} Trending ${selectedCategory === 'All' ? 'Topics' : selectedCategory + 's'}`}
        subtitle="Tap bookmark to save for later"
      />
      
      {filteredTrends.length > 0 ? (
        filteredTrends.map((trend) => (
          <TrendItem
            key={trend.id}
            trend={trend}
            onPress={() => console.log('Trend pressed:', trend.hashtag)}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={48} 
            color={colors.textSecondary} 
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No trends found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Try adjusting your search or category filter
          </Text>
        </View>
      )}

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
});
