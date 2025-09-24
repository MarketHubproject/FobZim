import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { createButtonPressAnimation, createFadeAnimation, ANIMATION_DURATION } from '../utils/animations';

import { Creator } from '../data/types';
import { colors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/tokens';

interface CreatorCardProps {
  creator: Creator;
  onPress?: () => void;
  compact?: boolean;
}

export default function CreatorCard({ creator, onPress, compact = false }: CreatorCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spotlightPulse = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);
  
  // Animation handlers
  const { pressIn, pressOut } = createButtonPressAnimation(scaleAnim, onPress);
  
  // Mount animation
  useEffect(() => {
    createFadeAnimation(fadeAnim, 1, ANIMATION_DURATION.NORMAL).start();
    
    // Spotlight pulse animation
    if (creator.spotlight) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spotlightPulse, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(spotlightPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [creator.spotlight]);
  
  const handlePressIn = () => {
    setIsPressed(true);
    pressIn();
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    pressOut();
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getNicheColor = (niche: string): string => {
    switch (niche) {
      case 'Comedy': return colors.secondary;
      case 'Music': return colors.accent;
      case 'Fashion': return '#E91E63';
      case 'Lifestyle': return '#9C27B0';
      case 'Tech': return '#2196F3';
      default: return colors.primary;
    }
  };

  const getNicheIcon = (niche: string): string => {
    switch (niche) {
      case 'Comedy': return 'emoticon-happy';
      case 'Music': return 'music-note';
      case 'Fashion': return 'hanger';
      case 'Lifestyle': return 'heart';
      case 'Tech': return 'laptop';
      default: return 'account';
    }
  };

  return (
    <Animated.View 
      style={[{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }]}
    >
      <TouchableOpacity 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card style={[
          styles.card, 
          compact && styles.compactCard,
          isPressed && styles.pressedCard
        ]} elevation={isPressed ? 6 : 3}>
          <View style={styles.cardContent}>
            {/* Avatar and Spotlight Badge */}
            <View style={styles.avatarContainer}>
              <Animated.View style={[styles.avatarWrapper, {
                transform: [{ scale: spotlightPulse }]
              }]}>
                <Image
                  source={{ uri: creator.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                  placeholder="👤"
                />
              </Animated.View>
              {creator.spotlight && (
                <Animated.View style={[
                  styles.spotlightBadge,
                  { transform: [{ scale: spotlightPulse }] }
                ]}>
                  <MaterialCommunityIcons 
                    name="star" 
                    size={12} 
                    color={colors.white} 
                  />
                </Animated.View>
              )}
            </View>

          {/* Creator Info */}
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                {creator.name}
              </Text>
              {creator.spotlight && (
                <MaterialCommunityIcons 
                  name="check-decagram" 
                  size={16} 
                  color={colors.secondary} 
                />
              )}
            </View>

            <Text variant="bodySmall" style={styles.location} numberOfLines={1}>
              📍 {creator.location}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons 
                  name="account-group" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text variant="bodySmall" style={styles.statText}>
                  {formatFollowers(creator.followers)}
                </Text>
              </View>
            </View>

            {/* Niche Chip */}
            <View style={styles.chipContainer}>
              <Chip 
                icon={() => (
                  <MaterialCommunityIcons 
                    name={getNicheIcon(creator.niche)} 
                    size={14} 
                    color={colors.white} 
                  />
                )}
                style={[styles.nicheChip, { backgroundColor: getNicheColor(creator.niche) }]}
                textStyle={styles.chipText}
                compact
              >
                {creator.niche}
              </Chip>
            </View>

            {/* Bio (if not compact) */}
            {!compact && creator.bio && (
              <Text variant="bodySmall" style={styles.bio} numberOfLines={2}>
                {creator.bio}
              </Text>
            )}

            {/* Social handles (if not compact) */}
            {!compact && (
              <View style={styles.socialRow}>
                {creator.instagramHandle && (
                  <View style={styles.socialItem}>
                    <MaterialCommunityIcons 
                      name="instagram" 
                      size={14} 
                      color={colors.accent} 
                    />
                    <Text variant="bodySmall" style={styles.socialText}>
                      {creator.instagramHandle.replace('@', '')}
                    </Text>
                  </View>
                )}
                {creator.tikTokHandle && (
                  <View style={styles.socialItem}>
                    <MaterialCommunityIcons 
                      name="music-note" 
                      size={14} 
                      color={colors.textSecondary} 
                    />
                    <Text variant="bodySmall" style={styles.socialText}>
                      TikTok
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    ...shadow.md,
    transition: 'all 0.2s ease',
  },
  pressedCard: {
    backgroundColor: colors.surface,
    transform: [{ scale: 0.98 }],
  },
  compactCard: {
    width: 280,
  },
  avatarWrapper: {
    borderRadius: radius.full,
  },
  cardContent: {
    padding: spacing.md,
    flexDirection: 'row',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  spotlightBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.xs,
  },
  location: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  chipContainer: {
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  nicheChip: {
    height: 28,
  },
  chipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  bio: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  socialText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontSize: 12,
  },
});