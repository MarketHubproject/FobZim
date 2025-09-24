import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Button,
  Chip,
  IconButton,
  Surface,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CampaignApplication } from '../../types/campaign';

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  error: '#F44336',
  zimbabwe: '#FFCC02',
  white: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FF9800',
};

interface ApplicationCardProps {
  application: CampaignApplication;
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onContact?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onAccept,
  onReject,
  onContact,
  showActions = true,
  compact = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.success;
      case 'rejected': return colors.error;
      case 'withdrawn': return colors.muted;
      default: return colors.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'accepted': return 'check-circle';
      case 'rejected': return 'close-circle';
      case 'withdrawn': return 'account-cancel';
      default: return 'help-circle';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleSocialLink = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="outlined">
        <Card.Content style={[styles.content, compact && styles.compactContent]}>
          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.applicantInfo}>
              <Avatar.Image
                size={compact ? 40 : 48}
                source={{ 
                  uri: application.creatorPhoto || 'https://via.placeholder.com/48' 
                }}
                style={styles.avatar}
              />
              <View style={styles.applicantDetails}>
                <Text variant="titleMedium" style={styles.applicantName}>
                  {application.creatorName}
                </Text>
                <Text variant="bodySmall" style={styles.applicantEmail}>
                  {application.creatorEmail}
                </Text>
                {application.createdAt && (
                  <Text variant="bodySmall" style={styles.timeAgo}>
                    Applied {formatTimeAgo(application.createdAt)}
                  </Text>
                )}
              </View>
            </View>

            {/* Status Chip */}
            <Chip
              mode="flat"
              textStyle={[styles.statusText, { color: getStatusColor(application.status) }]}
              style={[
                styles.statusChip,
                { backgroundColor: `${getStatusColor(application.status)}20` }
              ]}
              icon={() => (
                <MaterialCommunityIcons
                  name={getStatusIcon(application.status) as any}
                  size={12}
                  color={getStatusColor(application.status)}
                />
              )}
            >
              {application.status.toUpperCase()}
            </Chip>
          </View>

          {!compact && (
            <>
              {/* Message Preview */}
              <View style={styles.messageSection}>
                <Text variant="bodyMedium" style={styles.messagePreview} numberOfLines={3}>
                  {application.message}
                </Text>
              </View>

              {/* Key Information */}
              <View style={styles.keyInfo}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text variant="bodySmall" style={styles.infoText}>
                    Available: {application.availability}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text variant="bodySmall" style={styles.infoText}>
                    Delivery: {application.expectedDelivery}
                  </Text>
                </View>
              </View>

              {/* Experience & Skills */}
              {application.experience && (
                <View style={styles.experienceSection}>
                  <Text variant="titleSmall" style={styles.experienceTitle}>
                    Experience
                  </Text>
                  <Text variant="bodySmall" style={styles.experienceText} numberOfLines={2}>
                    {application.experience}
                  </Text>
                </View>
              )}

              {/* Portfolio Count */}
              {application.portfolio && application.portfolio.length > 0 && (
                <View style={styles.portfolioInfo}>
                  <MaterialCommunityIcons
                    name="folder-image"
                    size={16}
                    color={colors.primary}
                  />
                  <Text variant="bodySmall" style={styles.portfolioText}>
                    {application.portfolio.length} portfolio item{application.portfolio.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Social Links */}
              {application.socialLinks && Object.keys(application.socialLinks).length > 0 && (
                <View style={styles.socialLinks}>
                  <Text variant="bodySmall" style={styles.socialTitle}>
                    Social Links:
                  </Text>
                  <View style={styles.socialIcons}>
                    {application.socialLinks.instagram && (
                      <IconButton
                        icon="instagram"
                        size={16}
                        onPress={() => handleSocialLink(application.socialLinks?.instagram)}
                        style={styles.socialIcon}
                      />
                    )}
                    {application.socialLinks.tiktok && (
                      <IconButton
                        icon="music-note"
                        size={16}
                        onPress={() => handleSocialLink(application.socialLinks?.tiktok)}
                        style={styles.socialIcon}
                      />
                    )}
                    {application.socialLinks.youtube && (
                      <IconButton
                        icon="youtube"
                        size={16}
                        onPress={() => handleSocialLink(application.socialLinks?.youtube)}
                        style={styles.socialIcon}
                      />
                    )}
                    {application.socialLinks.website && (
                      <IconButton
                        icon="web"
                        size={16}
                        onPress={() => handleSocialLink(application.socialLinks?.website)}
                        style={styles.socialIcon}
                      />
                    )}
                  </View>
                </View>
              )}

              <Divider style={styles.divider} />
            </>
          )}

          {/* Action Buttons */}
          {showActions && (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={onContact}
                icon="message-outline"
                style={styles.contactButton}
                compact
              >
                Contact
              </Button>

              {application.status === 'pending' && (
                <View style={styles.pendingActions}>
                  <Button
                    mode="outlined"
                    onPress={onReject}
                    icon="close"
                    textColor={colors.error}
                    style={[styles.actionButton, styles.rejectButton]}
                    compact
                  >
                    Reject
                  </Button>
                  <Button
                    mode="contained"
                    onPress={onAccept}
                    icon="check"
                    style={[styles.actionButton, styles.acceptButton]}
                    buttonColor={colors.success}
                    compact
                  >
                    Accept
                  </Button>
                </View>
              )}

              {application.status === 'accepted' && (
                <Surface style={styles.acceptedBadge} elevation={0}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text variant="bodySmall" style={styles.acceptedText}>
                    Application Accepted
                  </Text>
                </Surface>
              )}

              {application.status === 'rejected' && (
                <Surface style={styles.rejectedBadge} elevation={0}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color={colors.error}
                  />
                  <Text variant="bodySmall" style={styles.rejectedText}>
                    Application Rejected
                  </Text>
                </Surface>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderColor: colors.background,
    elevation: 2,
  },
  content: {
    paddingVertical: 16,
  },
  compactContent: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  applicantDetails: {
    flex: 1,
  },
  applicantName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  applicantEmail: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeAgo: {
    color: colors.muted,
    marginTop: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageSection: {
    marginBottom: 12,
  },
  messagePreview: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  keyInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    color: colors.textSecondary,
    marginLeft: 6,
  },
  experienceSection: {
    marginBottom: 12,
  },
  experienceTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  experienceText: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  portfolioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioText: {
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialTitle: {
    color: colors.textSecondary,
    marginRight: 8,
  },
  socialIcons: {
    flexDirection: 'row',
  },
  socialIcon: {
    width: 24,
    height: 24,
    margin: 0,
    marginLeft: 4,
  },
  divider: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactButton: {
    borderColor: colors.primary,
    flex: 1,
    marginRight: 8,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  rejectButton: {
    borderColor: colors.error,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptedBadge: {
    backgroundColor: `${colors.success}20`,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  acceptedText: {
    color: colors.success,
    marginLeft: 6,
    fontWeight: '500',
  },
  rejectedBadge: {
    backgroundColor: `${colors.error}20`,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rejectedText: {
    color: colors.error,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default ApplicationCard;