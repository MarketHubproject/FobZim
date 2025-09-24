import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  Avatar,
  IconButton,
  Badge,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CampaignListItem, CAMPAIGN_CATEGORIES_LABELS, getCampaignStatusColor, formatCampaignBudget } from '../types/campaign';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32; // 16px margin on each side

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  zimbabwe: '#FFCC02', // Zimbabwe flag yellow
  white: '#FFFFFF'
};

interface CampaignCardProps {
  campaign: CampaignListItem;
  onPress?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
  showActions?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
  onBookmark,
  onShare,
  isBookmarked = false,
  showActions = true
}) => {
  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRewardSummary = () => {
    if (!campaign.rewards || campaign.rewards.length === 0) {
      return 'Reward TBD';
    }
    
    const firstReward = campaign.rewards[0];
    if (firstReward.type === 'monetary' && firstReward.value) {
      return `$${firstReward.value.toLocaleString()}`;
    }
    return firstReward.description;
  };

  const deadlineColor = () => {
    const now = new Date();
    const diffTime = campaign.applicationDeadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return colors.error;
    if (diffDays <= 3) return colors.warning;
    return colors.success;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Card style={[styles.card, campaign.isFeatured && styles.featuredCard]} mode="elevated">
        {/* Featured Badge */}
        {campaign.isFeatured && (
          <View style={styles.featuredBadge}>
            <MaterialCommunityIcons name="star" size={12} color={colors.white} />
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}

        {/* Campaign Image */}
        <View style={styles.imageContainer}>
          {campaign.images && campaign.images.length > 0 ? (
            <Image
              source={{ uri: campaign.images[0] }}
              style={styles.campaignImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons
                name="image-outline"
                size={48}
                color={colors.muted}
              />
            </View>
          )}
          
          {/* Status Chip */}
          <View style={styles.statusContainer}>
            <Chip
              mode="flat"
              textStyle={[styles.statusText, { color: getCampaignStatusColor(campaign.status) }]}
              style={[styles.statusChip, { backgroundColor: `${getCampaignStatusColor(campaign.status)}20` }]}
            >
              {campaign.status.toUpperCase()}
            </Chip>
          </View>

          {/* Action Buttons */}
          {showActions && (
            <View style={styles.actionButtons}>
              <IconButton
                icon={isBookmarked ? "bookmark" : "bookmark-outline"}
                iconColor={isBookmarked ? colors.zimbabwe : colors.white}
                containerColor={`${colors.textPrimary}80`}
                size={20}
                onPress={onBookmark}
                style={styles.actionButton}
              />
              <IconButton
                icon="share-variant"
                iconColor={colors.white}
                containerColor={`${colors.textPrimary}80`}
                size={20}
                onPress={onShare}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>

        {/* Card Content */}
        <Card.Content style={styles.content}>
          {/* Category & Location */}
          <View style={styles.metaRow}>
            <Chip
              mode="outlined"
              textStyle={styles.categoryText}
              style={styles.categoryChip}
              icon={() => (
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={14}
                  color={colors.primary}
                />
              )}
            >
              {CAMPAIGN_CATEGORIES_LABELS[campaign.category]}
            </Chip>
            
            {campaign.location && (
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons
                  name={campaign.location.isRemote ? "earth" : "map-marker"}
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.locationText}>
                  {campaign.location.isRemote ? "Remote" : campaign.location.city || campaign.location.country}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {campaign.title}
          </Text>

          {/* Brief Description */}
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {campaign.briefDescription}
          </Text>

          {/* Creator Info */}
          {campaign.creator && (
            <View style={styles.creatorRow}>
              <Avatar.Image
                size={32}
                source={{ uri: campaign.creator.photoURL || 'https://via.placeholder.com/32' }}
                style={styles.creatorAvatar}
              />
              <View style={styles.creatorInfo}>
                <View style={styles.creatorNameRow}>
                  <Text variant="bodyMedium" style={styles.creatorName}>
                    {campaign.creator.displayName}
                  </Text>
                  {campaign.creator.isVerified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color={colors.primary}
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>
                <Text variant="bodySmall" style={styles.creatorRole}>
                  Campaign Creator
                </Text>
              </View>
            </View>
          )}

          {/* Reward & Stats */}
          <View style={styles.bottomRow}>
            <View style={styles.rewardContainer}>
              <MaterialCommunityIcons
                name="gift-outline"
                size={16}
                color={colors.success}
              />
              <Text style={styles.rewardText}>{getRewardSummary()}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.statText}>{formatNumber(campaign.metrics.views)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.statText}>{campaign.metrics.applications}</Text>
              </View>
            </View>
          </View>

          {/* Deadline */}
          <View style={styles.deadlineContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={deadlineColor()}
            />
            <Text style={[styles.deadlineText, { color: deadlineColor() }]}>
              {formatDeadline(campaign.applicationDeadline)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    width: cardWidth,
    backgroundColor: colors.surface,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: colors.zimbabwe,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.zimbabwe,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    elevation: 5,
  },
  featuredText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  campaignImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    margin: 0,
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    height: 28,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 11,
    color: colors.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  creatorRole: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardText: {
    color: colors.success,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default CampaignCard;