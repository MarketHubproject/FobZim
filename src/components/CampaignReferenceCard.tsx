import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  accent: '#FF5722'
};

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  location: string;
  participantCount: number;
  status: 'active' | 'completed' | 'cancelled';
  endDate: Date;
}

interface CampaignReferenceCardProps {
  campaign: Campaign;
  onPress?: (campaign: Campaign) => void;
  onJoinPress?: (campaign: Campaign) => void;
  compact?: boolean;
  showActions?: boolean;
}

const CampaignReferenceCard: React.FC<CampaignReferenceCardProps> = ({
  campaign,
  onPress,
  onJoinPress,
  compact = false,
  showActions = true
}) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const formatProgress = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    return `${percentage.toFixed(0)}%`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return colors.success;
      case 'completed': return colors.primary;
      case 'cancelled': return colors.error;
      default: return colors.muted;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'active': return 'play-circle';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help-circle';
    }
  };

  const isExpired = new Date() > campaign.endDate;
  const daysRemaining = Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <TouchableOpacity onPress={() => onPress?.(campaign)} activeOpacity={0.7}>
      <Card style={[styles.card, compact && styles.compactCard]}>
        {/* Campaign Header */}
        <View style={styles.header}>
          <View style={styles.campaignInfo}>
            {campaign.imageUrl ? (
              <Avatar.Image size={compact ? 50 : 60} source={{ uri: campaign.imageUrl }} />
            ) : (
              <Avatar.Icon 
                size={compact ? 50 : 60} 
                icon="briefcase" 
                style={{ backgroundColor: colors.primary }}
              />
            )}
            
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={compact ? 1 : 2}>
                  {campaign.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) + '20' }]}>
                  <MaterialCommunityIcons 
                    name={getStatusIcon(campaign.status)} 
                    size={12} 
                    color={getStatusColor(campaign.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                    {campaign.status}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.location} numberOfLines={1}>
                📍 {campaign.location}
              </Text>
              
              <View style={styles.metaRow}>
                <Chip
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                  compact
                >
                  {campaign.category}
                </Chip>
                <Text style={styles.participantCount}>
                  👥 {campaign.participantCount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        {!compact && (
          <>
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressAmount}>
                  {formatCurrency(campaign.currentAmount)} raised
                </Text>
                <Text style={styles.progressPercentage}>
                  {formatProgress(campaign.currentAmount, campaign.targetAmount)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%`,
                      backgroundColor: getStatusColor(campaign.status)
                    }
                  ]} 
                />
              </View>
              <View style={styles.targetInfo}>
                <Text style={styles.targetAmount}>
                  Goal: {formatCurrency(campaign.targetAmount)}
                </Text>
                {!isExpired && (
                  <Text style={styles.timeRemaining}>
                    {daysRemaining === 0 ? 'Last day!' : `${daysRemaining} days left`}
                  </Text>
                )}
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {campaign.description}
            </Text>
          </>
        )}

        {/* Actions */}
        {showActions && campaign.status === 'active' && !isExpired && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => onJoinPress?.(campaign)}
              style={styles.joinButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="hand-heart"
            >
              Join Campaign
            </Button>
            <Button
              mode="outlined"
              onPress={() => onPress?.(campaign)}
              style={styles.viewButton}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, styles.viewButtonLabel]}
              icon="eye"
            >
              View Details
            </Button>
          </View>
        )}

        {/* Campaign Link Indicator */}
        <View style={styles.linkIndicator}>
          <MaterialCommunityIcons name="link" size={16} color={colors.primary} />
          <Text style={styles.linkText}>Campaign Link</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 2,
    maxWidth: width - 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  compactCard: {
    paddingVertical: 12,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  campaignInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    backgroundColor: colors.primary + '15',
    height: 24,
  },
  categoryChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  participantCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressAmount: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetAmount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeRemaining: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  joinButton: {
    flex: 2,
  },
  viewButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  buttonContent: {
    height: 36,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewButtonLabel: {
    color: colors.primary,
  },
  linkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary + '10',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  linkText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CampaignReferenceCard;