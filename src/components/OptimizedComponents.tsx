import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Card, Button, Chip, Badge } from 'react-native-paper';
import { Creator, Campaign, Tip } from '../store/AppState';

const { width: screenWidth } = Dimensions.get('window');

// Optimized Creator Card Component
interface CreatorCardProps {
  creator: Creator;
  isFollowed: boolean;
  onToggleFollow: (creatorId: string) => void;
}

export const CreatorCard = memo(({ creator, isFollowed, onToggleFollow }: CreatorCardProps) => {
  const handleToggleFollow = useCallback(() => {
    onToggleFollow(creator.id);
  }, [creator.id, onToggleFollow]);

  const followerText = useMemo(() => {
    if (creator.followers >= 1000000) {
      return `${(creator.followers / 1000000).toFixed(1)}M followers`;
    } else if (creator.followers >= 1000) {
      return `${(creator.followers / 1000).toFixed(1)}K followers`;
    } else {
      return `${creator.followers} followers`;
    }
  }, [creator.followers]);

  return (
    <Card style={styles.creatorCard}>
      <Card.Content>
        <View style={styles.creatorHeader}>
          <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
          <View style={styles.creatorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.creatorName}>{creator.name}</Text>
              {creator.isVerified && (
                <Badge size={16} style={styles.verifiedBadge}>✓</Badge>
              )}
            </View>
            <Text style={styles.creatorUsername}>@{creator.username}</Text>
            <Text style={styles.followerCount}>{followerText}</Text>
          </View>
          <Button
            mode={isFollowed ? 'outlined' : 'contained'}
            onPress={handleToggleFollow}
            style={styles.followButton}
            compact
          >
            {isFollowed ? 'Following' : 'Follow'}
          </Button>
        </View>
        <Text style={styles.creatorBio} numberOfLines={2}>
          {creator.bio}
        </Text>
        <View style={styles.creatorTags}>
          <Chip style={styles.categoryChip} textStyle={styles.chipText}>
            {creator.category}
          </Chip>
          <Chip style={styles.locationChip} textStyle={styles.chipText}>
            📍 {creator.location}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
});

CreatorCard.displayName = 'CreatorCard';

// Optimized Campaign Card Component
interface CampaignCardProps {
  campaign: Campaign;
  isSaved: boolean;
  isApplied: boolean;
  onToggleSave: (campaignId: string) => void;
  onApply: (campaignId: string) => void;
}

export const CampaignCard = memo(({ 
  campaign, 
  isSaved, 
  isApplied, 
  onToggleSave, 
  onApply 
}: CampaignCardProps) => {
  const handleToggleSave = useCallback(() => {
    onToggleSave(campaign.id);
  }, [campaign.id, onToggleSave]);

  const handleApply = useCallback(() => {
    onApply(campaign.id);
  }, [campaign.id, onApply]);

  const daysLeft = useMemo(() => {
    const deadline = new Date(campaign.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [campaign.deadline]);

  return (
    <Card style={styles.campaignCard}>
      <Card.Content>
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {campaign.title}
          </Text>
          <Button
            mode="text"
            icon={isSaved ? 'bookmark' : 'bookmark-outline'}
            onPress={handleToggleSave}
            style={styles.saveButton}
            compact
          />
        </View>
        
        <Text style={styles.brandName}>{campaign.brand}</Text>
        <Text style={styles.campaignDescription} numberOfLines={3}>
          {campaign.description}
        </Text>
        
        <View style={styles.campaignMeta}>
          <Text style={styles.budget}>💰 {campaign.budget}</Text>
          <Text style={styles.deadline}>
            ⏰ {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
          </Text>
        </View>

        <View style={styles.campaignFooter}>
          <View style={styles.campaignTags}>
            <Chip style={styles.categoryChip} textStyle={styles.chipText}>
              {campaign.category}
            </Chip>
            <Text style={styles.applicantCount}>
              {campaign.applicants} applicants
            </Text>
          </View>
          
          <Button
            mode="contained"
            onPress={handleApply}
            disabled={isApplied}
            style={[
              styles.applyButton,
              isApplied && styles.appliedButton
            ]}
            compact
          >
            {isApplied ? 'Applied' : 'Apply'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
});

CampaignCard.displayName = 'CampaignCard';

// Optimized Tip Card Component
interface TipCardProps {
  tip: Tip;
  isSaved: boolean;
  onToggleSave: (tipId: string) => void;
}

export const TipCard = memo(({ tip, isSaved, onToggleSave }: TipCardProps) => {
  const handleToggleSave = useCallback(() => {
    onToggleSave(tip.id);
  }, [tip.id, onToggleSave]);

  const formattedDate = useMemo(() => {
    return new Date(tip.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }, [tip.date]);

  return (
    <Card style={styles.tipCard}>
      <Card.Content>
        <View style={styles.tipHeader}>
          <Text style={styles.tipTitle} numberOfLines={2}>
            {tip.title}
          </Text>
          <Button
            mode="text"
            icon={isSaved ? 'heart' : 'heart-outline'}
            onPress={handleToggleSave}
            style={styles.saveButton}
            compact
          />
        </View>
        
        <Text style={styles.tipContent} numberOfLines={4}>
          {tip.content}
        </Text>
        
        <View style={styles.tipFooter}>
          <Chip style={styles.categoryChip} textStyle={styles.chipText}>
            {tip.category}
          </Chip>
          <View style={styles.tipMeta}>
            <Text style={styles.tipAuthor}>By {tip.author}</Text>
            <Text style={styles.tipDate}>{formattedDate}</Text>
            <Text style={styles.tipLikes}>❤️ {tip.likes}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
});

TipCard.displayName = 'TipCard';

// Optimized Loading Placeholder Component
export const LoadingPlaceholder = memo(() => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingCard}>
      <View style={styles.loadingHeader} />
      <View style={styles.loadingContent} />
      <View style={styles.loadingFooter} />
    </View>
  </View>
));

LoadingPlaceholder.displayName = 'LoadingPlaceholder';

// Optimized Empty State Component
interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon: string;
}

export const EmptyState = memo(({ title, subtitle, icon }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
));

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  // Creator Card Styles
  creatorCard: {
    margin: 8,
    elevation: 2,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  verifiedBadge: {
    backgroundColor: '#1DA1F2',
    color: 'white',
  },
  creatorUsername: {
    fontSize: 14,
    color: '#666',
  },
  followerCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  followButton: {
    minWidth: 80,
  },
  creatorBio: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  creatorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Campaign Card Styles
  campaignCard: {
    margin: 8,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    minWidth: 40,
  },
  brandName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  deadline: {
    fontSize: 14,
    color: '#666',
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicantCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  applyButton: {
    minWidth: 80,
  },
  appliedButton: {
    opacity: 0.6,
  },

  // Tip Card Styles
  tipCard: {
    margin: 8,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  tipContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipAuthor: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  tipDate: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  tipLikes: {
    fontSize: 12,
    color: '#E91E63',
  },

  // Shared Styles
  categoryChip: {
    height: 24,
    marginRight: 8,
  },
  locationChip: {
    height: 24,
  },
  chipText: {
    fontSize: 12,
  },

  // Loading Placeholder Styles
  loadingContainer: {
    margin: 8,
  },
  loadingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  loadingHeader: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    width: '60%',
  },
  loadingContent: {
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingFooter: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '40%',
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
});