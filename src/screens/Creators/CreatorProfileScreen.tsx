import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Linking,
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  Chip, 
  IconButton,
  Divider,
  Portal,
  Modal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';
import { Creator, Post } from '../../data/types';
import { useAppStore } from '../../store/simpleStore';
import PostPreview from '../../components/PostPreview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PORTFOLIO_ITEM_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3;

interface CreatorProfileScreenProps {
  creator: Creator;
  onBack: () => void;
}

export default function CreatorProfileScreen({ creator, onBack }: CreatorProfileScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'about' | 'contact'>('posts');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);


  // Mock portfolio posts for the creator
  const portfolioPosts: Post[] = [
    {
      id: '1',
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      caption: 'Amazing dance performance in Harare! 💃🇿🇼',
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
      videoUrl: '',
      likes: 2340,
      commentsCount: 156,
      sharesCount: 89,
      timestampISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      hashtags: ['#ZimDance', '#Harare', '#DanceChallenge'],
      platform: 'instagram',
    },
    {
      id: '2',
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      caption: 'Behind the scenes of my latest comedy skit 😂',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      videoUrl: '',
      likes: 1890,
      commentsCount: 203,
      sharesCount: 67,
      timestampISO: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      hashtags: ['#ZimComedy', '#BehindTheScenes'],
      platform: 'tiktok',
    },
    {
      id: '3',
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      caption: 'Collaborating with local musicians 🎵',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      videoUrl: '',
      likes: 3120,
      commentsCount: 298,
      sharesCount: 134,
      timestampISO: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      hashtags: ['#ZimMusic', '#Collaboration'],
      platform: 'instagram',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setShowSuccessMessage(
      isFollowing ? '👋 Unfollowed creator' : '🎉 Now following creator!'
    );
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleSocialLink = (platform: 'instagram' | 'tiktok') => {
    const socialHandles = creator.socialHandles;
    if (socialHandles) {
      const handle = platform === 'instagram' ? socialHandles.instagram : socialHandles.tiktok;
      if (handle) {
        const url = platform === 'instagram' 
          ? `https://instagram.com/${handle}` 
          : `https://tiktok.com/@${handle}`;
        Linking.openURL(url);
      }
    }
  };

  const handleCollaboration = () => {
    setShowSuccessMessage('💼 Collaboration inquiry sent!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
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
    const nicheColors: { [key: string]: string } = {
      Comedy: colors.accent,
      Dance: colors.primary,
      Music: colors.secondary,
      Fashion: '#E91E63',
      Food: '#FF9800',
      Lifestyle: '#9C27B0',
      Fitness: '#4CAF50',
      Beauty: '#F06292',
      Tech: '#2196F3',
      Education: '#795548',
    };
    return nicheColors[niche] || colors.textSecondary;
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'posts':
        return (
          <View style={styles.portfolioGrid}>
            {portfolioPosts.map((post, index) => (
              <TouchableOpacity
                key={post.id}
                style={styles.portfolioItem}
                onPress={() => setSelectedPost(post)}
              >
                <Image
                  source={{ uri: post.image }}
                  style={styles.portfolioImage}
                  contentFit="cover"
                />
                <View style={styles.portfolioOverlay}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={16}
                    color={colors.white}
                  />
                  <Text style={styles.portfolioStats}>
                    {formatFollowers(post.likes)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'about':
        return (
          <View style={styles.aboutContent}>
            <Card style={styles.bioCard}>
              <View style={styles.cardContent}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  About {creator.name}
                </Text>
                <Text variant="bodyMedium" style={styles.bioText}>
                  {creator.bio}
                </Text>
                
                <Divider style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {creator.location}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Joined December 2023
                  </Text>
                </View>

                {creator.niche && (
                  <View style={styles.nicheContainer}>
                    <Text variant="titleSmall" style={styles.nicheTitle}>
                      Content Categories
                    </Text>
                    <View style={styles.nicheList}>
                      {creator.niche.map((niche, index) => (
                        <Chip
                          key={index}
                          style={[
                            styles.nicheChip,
                            { backgroundColor: getNicheColor(niche) }
                          ]}
                          textStyle={styles.nicheChipText}
                        >
                          {niche}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Card>
          </View>
        );
      
      case 'contact':
        return (
          <View style={styles.contactContent}>
            <Card style={styles.contactCard}>
              <View style={styles.cardContent}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Connect with {creator.name}
                </Text>
                
                {/* Social Media Links */}
                {creator.socialHandles && (
                  <View style={styles.socialSection}>
                    <Text variant="titleSmall" style={styles.socialTitle}>
                      Social Media
                    </Text>
                    <View style={styles.socialButtons}>
                      {creator.socialHandles.instagram && (
                        <Button
                          mode="outlined"
                          onPress={() => handleSocialLink('instagram')}
                          icon="instagram"
                          style={[styles.socialButton, { borderColor: '#E4405F' }]}
                          labelStyle={{ color: '#E4405F' }}
                        >
                          Instagram
                        </Button>
                      )}
                      {creator.socialHandles.tiktok && (
                        <Button
                          mode="outlined"
                          onPress={() => handleSocialLink('tiktok')}
                          icon="music"
                          style={[styles.socialButton, { borderColor: '#000000' }]}
                          labelStyle={{ color: '#000000' }}
                        >
                          TikTok
                        </Button>
                      )}
                    </View>
                  </View>
                )}
                
                <Divider style={styles.divider} />
                
                {/* Collaboration Button */}
                <View style={styles.collaborationSection}>
                  <Text variant="titleSmall" style={styles.collaborationTitle}>
                    Business Inquiries
                  </Text>
                  <Button
                    mode="contained"
                    onPress={handleCollaboration}
                    icon="briefcase"
                    style={styles.collaborationButton}
                  >
                    Collaboration Inquiry
                  </Button>
                  <Text variant="bodySmall" style={styles.collaborationNote}>
                    Send a collaboration request to work with {creator.name}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={onBack}
          iconColor={colors.white}
          style={styles.backButton}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with Cover */}
        <View style={styles.profileHeader}>
          <View style={styles.coverGradient} />
          
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: creator.avatar }}
              style={styles.profileImage}
              contentFit="cover"
            />
            {creator.spotlight && (
              <View style={styles.spotlightBadge}>
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={colors.white}
                />
              </View>
            )}
          </View>

          {/* Creator Info */}
          <View style={styles.creatorInfo}>
            <Text variant="headlineSmall" style={styles.creatorName}>
              {creator.name}
            </Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>
                  {formatFollowers(creator.followersCount)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Followers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>
                  {portfolioPosts.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Posts
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>
                  4.9
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Rating
                </Text>
              </View>
            </View>

            {/* Follow Button */}
            <Button
              mode={isFollowing ? 'outlined' : 'contained'}
              onPress={handleFollow}
              style={styles.followButton}
              icon={isFollowing ? 'account-check' : 'account-plus'}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </View>
        </View>

        {/* Success Message */}
        {showSuccessMessage && (
          <Card style={styles.successCard}>
            <Text variant="bodyMedium" style={styles.successText}>
              {showSuccessMessage}
            </Text>
          </Card>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {[
            { key: 'posts', label: 'Posts', icon: 'grid' },
            { key: 'about', label: 'About', icon: 'information' },
            { key: 'contact', label: 'Contact', icon: 'email' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={20}
                color={selectedTab === tab.key ? colors.primary : colors.textSecondary}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.tabLabel,
                  selectedTab === tab.key && styles.activeTabLabel
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Post Preview Modal */}
      <Portal>
        <Modal
          visible={!!selectedPost}
          onDismiss={() => setSelectedPost(null)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedPost && (
            <PostPreview
              post={selectedPost}
              onPress={() => setSelectedPost(null)}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  backButton: {
    backgroundColor: colors.surface + '80',
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    position: 'relative',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: colors.primary + '40',
  },
  profileImageContainer: {
    marginTop: 120,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  spotlightBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.accent,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  creatorInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  creatorName: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  statNumber: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  followButton: {
    paddingHorizontal: spacing.xl,
  },
  successCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successText: {
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 12,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: spacing.md,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItem: {
    width: PORTFOLIO_ITEM_SIZE,
    height: PORTFOLIO_ITEM_SIZE,
    marginBottom: spacing.sm,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioOverlay: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface + '80',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  portfolioStats: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  aboutContent: {
    // Additional styling for about content
  },
  bioCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  cardContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  bioText: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  nicheContainer: {
    marginTop: spacing.md,
  },
  nicheTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  nicheList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nicheChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  nicheChipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  contactContent: {
    // Additional styling for contact content
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  socialSection: {
    marginBottom: spacing.lg,
  },
  socialTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialButton: {
    flex: 1,
  },
  collaborationSection: {
    alignItems: 'center',
  },
  collaborationTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  collaborationButton: {
    marginBottom: spacing.sm,
  },
  collaborationNote: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContent: {
    margin: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});