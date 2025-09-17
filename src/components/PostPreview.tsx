import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Post } from '../data/types';
import { colors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/tokens';

interface PostPreviewProps {
  post: Post;
  onPress?: () => void;
  compact?: boolean;
}

export default function PostPreview({ post, onPress, compact = false }: PostPreviewProps) {
  const formatLikes = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getPlatformIcon = (platform?: string): string => {
    switch (platform) {
      case 'instagram': return 'instagram';
      case 'tiktok': return 'music-note';
      case 'youtube': return 'youtube';
      default: return 'camera';
    }
  };

  const getPlatformColor = (platform?: string): string => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'tiktok': return '#000000';
      case 'youtube': return '#FF0000';
      default: return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, compact && styles.compactCard]} elevation={2}>
        {/* Post Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            contentFit="cover"
            placeholder="📸"
          />
          
          {/* Platform Badge */}
          {post.platform && (
            <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(post.platform) }]}>
              <MaterialCommunityIcons 
                name={getPlatformIcon(post.platform)} 
                size={12} 
                color={colors.white} 
              />
            </View>
          )}

          {/* Likes Overlay */}
          <View style={styles.likesOverlay}>
            <View style={styles.likesContainer}>
              <MaterialCommunityIcons 
                name="heart" 
                size={14} 
                color={colors.white} 
              />
              <Text style={styles.likesText}>
                {formatLikes(post.likes)}
              </Text>
            </View>
          </View>
        </View>

        {/* Post Content */}
        {!compact && (
          <View style={styles.contentContainer}>
            <Text 
              variant="bodyMedium" 
              style={styles.caption} 
              numberOfLines={3}
            >
              {post.caption}
            </Text>
            
            <View style={styles.metaRow}>
              <Text variant="bodySmall" style={styles.timeText}>
                {formatTimeAgo(post.timestampISO)}
              </Text>
              
              <View style={styles.engagementRow}>
                <View style={styles.engagementItem}>
                  <MaterialCommunityIcons 
                    name="heart-outline" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text variant="bodySmall" style={styles.engagementText}>
                    {formatLikes(post.likes)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Compact Footer */}
        {compact && (
          <View style={styles.compactFooter}>
            <Text 
              variant="bodySmall" 
              style={styles.compactCaption} 
              numberOfLines={1}
            >
              {post.caption}
            </Text>
          </View>
        )}
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
    overflow: 'hidden',
    ...shadow.sm,
  },
  compactCard: {
    width: 200,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  platformBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    padding: spacing.sm,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  contentContainer: {
    padding: spacing.md,
  },
  caption: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  engagementRow: {
    flexDirection: 'row',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  engagementText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontSize: 12,
    fontWeight: '500',
  },
  compactFooter: {
    padding: spacing.sm,
    paddingTop: spacing.xs,
  },
  compactCaption: {
    color: colors.textPrimary,
    fontSize: 12,
  },
});