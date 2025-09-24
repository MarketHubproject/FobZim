import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';
import { createPulseAnimation, ANIMATION_DURATION } from '../utils/animations';

const { width: screenWidth } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Basic animated skeleton component
const SkeletonItem = ({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    createPulseAnimation(pulseAnim).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7]
          })
        },
        style
      ]}
    />
  );
};

// Skeleton for Creator Cards
export const CreatorCardSkeleton = () => {
  return (
    <Card style={styles.creatorCardSkeleton} elevation={3}>
      <View style={styles.creatorSkeletonContent}>
        {/* Avatar */}
        <View style={styles.creatorAvatarContainer}>
          <SkeletonItem width={60} height={60} borderRadius={30} />
          {/* Spotlight badge placeholder */}
          <SkeletonItem 
            width={20} 
            height={20} 
            borderRadius={10} 
            style={styles.spotlightBadgeSkeleton}
          />
        </View>
        
        {/* Creator Info */}
        <View style={styles.creatorInfoSkeleton}>
          {/* Name */}
          <SkeletonItem width="60%" height={18} style={{ marginBottom: spacing.xs }} />
          
          {/* Location */}
          <SkeletonItem width="45%" height={14} style={{ marginBottom: spacing.sm }} />
          
          {/* Stats */}
          <SkeletonItem width="35%" height={14} style={{ marginBottom: spacing.sm }} />
          
          {/* Niche Chip */}
          <SkeletonItem width={80} height={28} borderRadius={14} style={{ marginBottom: spacing.sm }} />
          
          {/* Bio lines */}
          <SkeletonItem width="90%" height={14} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="70%" height={14} />
        </View>
      </View>
    </Card>
  );
};

// Skeleton for Campaign Cards
export const CampaignCardSkeleton = () => {
  return (
    <Card style={styles.campaignCardSkeleton} elevation={4}>
      {/* Image placeholder */}
      <SkeletonItem width="100%" height={120} borderRadius={0} />
      
      {/* Content */}
      <View style={styles.campaignContentSkeleton}>
        {/* Header with brand name and save button */}
        <View style={styles.campaignHeaderSkeleton}>
          <SkeletonItem width="50%" height={16} />
          <SkeletonItem width={60} height={32} borderRadius={16} />
        </View>
        
        {/* Title */}
        <SkeletonItem width="85%" height={15} style={{ marginBottom: spacing.sm }} />
        
        {/* Description lines */}
        <SkeletonItem width="100%" height={14} style={{ marginBottom: spacing.xs }} />
        <SkeletonItem width="90%" height={14} style={{ marginBottom: spacing.xs }} />
        <SkeletonItem width="75%" height={14} style={{ marginBottom: spacing.md }} />
        
        {/* Meta info (niche + deadline) */}
        <View style={styles.campaignMetaSkeleton}>
          <SkeletonItem width={70} height={24} borderRadius={12} />
          <SkeletonItem width={80} height={14} />
        </View>
        
        {/* Requirements */}
        <View style={styles.requirementsSkeleton}>
          <SkeletonItem width="40%" height={13} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="80%" height={12} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="70%" height={12} />
        </View>
        
        {/* Apply button */}
        <SkeletonItem width="100%" height={40} borderRadius={20} style={{ marginTop: spacing.md }} />
      </View>
    </Card>
  );
};

// Skeleton for Home Screen sections
export const HomeScreenSkeleton = () => {
  return (
    <View style={styles.homeSkeletonContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSkeleton}>
        <SkeletonItem width="80%" height={28} style={{ marginBottom: spacing.sm }} />
        <SkeletonItem width="60%" height={16} />
      </View>
      
      {/* Stats Card */}
      <Card style={styles.statsCardSkeleton} elevation={2}>
        <View style={styles.statsContentSkeleton}>
          <SkeletonItem width="70%" height={14} style={{ marginBottom: spacing.md }} />
          <View style={styles.statsButtonsSkeleton}>
            <SkeletonItem width="30%" height={32} borderRadius={4} />
            <SkeletonItem width="30%" height={32} borderRadius={4} />
            <SkeletonItem width="30%" height={32} borderRadius={4} />
          </View>
        </View>
      </Card>
      
      {/* Daily Tip */}
      <Card style={styles.tipCardSkeleton} elevation={2}>
        <View style={styles.tipContentSkeleton}>
          <View style={styles.tipHeaderSkeleton}>
            <SkeletonItem width={24} height={24} borderRadius={12} />
            <SkeletonItem width="50%" height={16} />
          </View>
          <SkeletonItem width="100%" height={14} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="85%" height={14} style={{ marginBottom: spacing.md }} />
          <SkeletonItem width="30%" height={36} borderRadius={18} />
        </View>
      </Card>
      
      {/* Section Headers and Lists */}
      <View style={styles.sectionSkeleton}>
        <SkeletonItem width="50%" height={20} style={{ marginBottom: spacing.xs }} />
        <SkeletonItem width="35%" height={14} style={{ marginBottom: spacing.md }} />
      </View>
    </View>
  );
};

// Skeleton for Search Results
export const SearchResultsSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <CreatorCardSkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );
};

// Skeleton for Campaigns List
export const CampaignsListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View key={`campaign-skeleton-${index}`} style={styles.campaignSkeletonWrapper}>
          <CampaignCardSkeleton />
        </View>
      ))}
    </View>
  );
};

// Skeleton for Stats Bar
export const StatsBarSkeleton = () => {
  return (
    <Card style={styles.statsBarSkeleton} elevation={2}>
      <View style={styles.statsBarContent}>
        <View style={styles.statItemSkeleton}>
          <SkeletonItem width={30} height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="80%" height={12} />
        </View>
        <View style={styles.statDividerSkeleton} />
        <View style={styles.statItemSkeleton}>
          <SkeletonItem width={25} height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="70%" height={12} />
        </View>
        <View style={styles.statDividerSkeleton} />
        <View style={styles.statItemSkeleton}>
          <SkeletonItem width={20} height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonItem width="60%" height={12} />
        </View>
      </View>
    </Card>
  );
};

// Skeleton for Horizontal Creator List
export const HorizontalCreatorListSkeleton = () => {
  return (
    <View style={styles.horizontalListSkeleton}>
      {Array.from({ length: 3 }, (_, index) => (
        <View key={`horizontal-${index}`} style={styles.horizontalCreatorSkeleton}>
          <SkeletonItem width={280} height={140} borderRadius={radius.md} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonItem: {
    backgroundColor: colors.border,
  },
  
  // Creator Card Skeleton
  creatorCardSkeleton: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
  },
  creatorSkeletonContent: {
    padding: spacing.md,
    flexDirection: 'row',
  },
  creatorAvatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  spotlightBadgeSkeleton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  creatorInfoSkeleton: {
    flex: 1,
  },
  
  // Campaign Card Skeleton
  campaignCardSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  campaignContentSkeleton: {
    padding: spacing.md,
  },
  campaignHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  campaignMetaSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requirementsSkeleton: {
    marginBottom: spacing.md,
  },
  campaignSkeletonWrapper: {
    marginBottom: spacing.md,
  },
  
  // Home Screen Skeleton
  homeSkeletonContainer: {
    padding: spacing.md,
  },
  welcomeSkeleton: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsCardSkeleton: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
  },
  statsContentSkeleton: {
    padding: spacing.md,
  },
  statsButtonsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipCardSkeleton: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
  },
  tipContentSkeleton: {
    padding: spacing.md,
  },
  tipHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionSkeleton: {
    marginBottom: spacing.md,
  },
  
  // Stats Bar Skeleton
  statsBarSkeleton: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  statsBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statItemSkeleton: {
    alignItems: 'center',
    flex: 1,
  },
  statDividerSkeleton: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  
  // Horizontal List Skeleton
  horizontalListSkeleton: {
    flexDirection: 'row',
    paddingLeft: spacing.sm,
  },
  horizontalCreatorSkeleton: {
    marginRight: spacing.sm,
  },
});