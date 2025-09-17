import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Trend } from '../data/types';
import { colors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/tokens';

interface TrendItemProps {
  trend: Trend;
  saved?: boolean;
  onPress?: () => void;
  onSave?: () => void;
  compact?: boolean;
}

export default function TrendItem({ trend, saved = false, onPress, onSave, compact = false }: TrendItemProps) {
  const formatPostsCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Challenge': return colors.accent;
      case 'Topic': return colors.primary;
      case 'Idea': return colors.secondary;
      default: return colors.muted;
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Challenge': return 'trophy';
      case 'Topic': return 'forum';
      case 'Idea': return 'lightbulb';
      default: return 'tag';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, compact && styles.compactCard]} elevation={2}>
        <View style={styles.cardContent}>
          {/* Left Content */}
          <View style={styles.leftContent}>
            {/* Hashtag and Category */}
            <View style={styles.headerRow}>
              <Text variant="titleMedium" style={styles.hashtag}>
                {trend.hashtag}
              </Text>
              <Chip 
                icon={() => (
                  <MaterialCommunityIcons 
                    name={getCategoryIcon(trend.category)} 
                    size={12} 
                    color={colors.white} 
                  />
                )}
                style={[styles.categoryChip, { backgroundColor: getCategoryColor(trend.category) }]}
                textStyle={styles.chipText}
                compact
              >
                {trend.category}
              </Chip>
            </View>

            {/* Description */}
            <Text 
              variant="bodyMedium" 
              style={styles.description} 
              numberOfLines={compact ? 2 : 3}
            >
              {trend.description}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons 
                  name="post" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text variant="bodySmall" style={styles.statText}>
                  {formatPostsCount(trend.postsCount)} posts
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons 
                  name="trending-up" 
                  size={16} 
                  color={colors.success} 
                />
                <Text variant="bodySmall" style={styles.trendingText}>
                  Trending
                </Text>
              </View>
            </View>

            {/* Related Niches (if available and not compact) */}
            {!compact && trend.relatedNiches && trend.relatedNiches.length > 0 && (
              <View style={styles.nichesRow}>
                <Text variant="bodySmall" style={styles.nichesLabel}>
                  Popular with:
                </Text>
                <View style={styles.nichesList}>
                  {trend.relatedNiches.slice(0, 3).map((niche, index) => (
                    <Text key={index} variant="bodySmall" style={styles.nicheText}>
                      {niche}
                      {index < trend.relatedNiches!.length - 1 && index < 2 ? ', ' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Action */}
          <View style={styles.rightAction}>
            <IconButton
              icon={saved ? 'bookmark' : 'bookmark-outline'}
              iconColor={saved ? colors.secondary : colors.textSecondary}
              size={24}
              onPress={onSave}
              style={styles.saveButton}
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  compactCard: {
    width: 320,
  },
  cardContent: {
    padding: spacing.md,
    flexDirection: 'row',
  },
  leftContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  hashtag: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryChip: {
    height: 24,
  },
  chipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    marginBottom: spacing.xs,
  },
  statText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  trendingText: {
    color: colors.success,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  nichesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nichesLabel: {
    color: colors.textSecondary,
    marginRight: spacing.xs,
    fontSize: 12,
  },
  nichesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nicheText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  rightAction: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  saveButton: {
    margin: 0,
  },
});