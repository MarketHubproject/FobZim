import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';

import CreatorCard from '../../components/CreatorCard';
import PostPreview from '../../components/PostPreview';
import SectionHeader from '../../components/SectionHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import AnimatedSuccessMessage from '../../components/AnimatedSuccessMessage';
import { 
  HorizontalCreatorListSkeleton, 
  StatsBarSkeleton, 
  HomeScreenSkeleton 
} from '../../components/SkeletonLoaders';

import { mockCreators, mockPosts, mockCampaigns, dailyTips } from '../../data/mockData';
import { Creator, Post, Campaign } from '../../data/types';
import { useAppStore } from '../../store/simpleStore';

export default function HomeScreen() {
  console.log('🏠 HomeScreen rendering...');
  
  const { 
    savedTips,
    savedCampaignIds, 
    appliedCampaignIds,
    savedCreatorIds,
    followedCreatorIds,
    saveTip, 
    removeSavedTip, 
    toggleSaveCampaign, 
    markCampaignApplied,
    toggleSaveCreator,
    toggleFollowCreator,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    enableAutoSave,
    disableAutoSave,
    autoSaveEnabled
  } = useAppStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Simulate initial loading
  useEffect(() => {
    const loadInitialData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setInitialLoading(false);
    };
    
    loadInitialData();
  }, []);
  
  // Optimize data with useMemo for better performance
  const { spotlightCreators, recentPosts, topCampaigns, todaysTip, homeData } = useMemo(() => {
    // Show skeleton data while loading
    if (initialLoading) {
      return {
        spotlightCreators: [],
        recentPosts: [],
        topCampaigns: [],
        todaysTip: '',
        homeData: [{ id: 'skeleton', type: 'skeleton' }]
      };
    }
    
    const spotlight = mockCreators.filter(creator => creator.spotlight).slice(0, 5);
    const recent = mockPosts.slice(0, 10);
    const campaigns = mockCampaigns.slice(0, 3);
    const tip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    
    // Create sections for FlatList
    const sections = [
      { id: 'welcome', type: 'welcome' },
      { id: 'tip', type: 'tip', data: tip },
      { id: 'creators-header', type: 'section-header', title: 'Spotlight Creators', subtitle: 'Rising stars from Zimbabwe' },
      { id: 'creators', type: 'horizontal-creators', data: spotlight },
      { id: 'posts-header', type: 'section-header', title: 'Latest Content', subtitle: 'Fresh posts from creators' },
      { id: 'posts', type: 'horizontal-posts', data: recent },
      { id: 'campaigns-header', type: 'section-header', title: 'Brand Opportunities', subtitle: 'Featured campaigns for creators' },
      ...campaigns.map(campaign => ({ id: campaign.id, type: 'campaign', data: campaign })),
      { id: 'spacer', type: 'spacer' }
    ];
    
    return {
      spotlightCreators: spotlight,
      recentPosts: recent,
      topCampaigns: campaigns,
      todaysTip: tip,
      homeData: sections
    };
  }, [savedTips, savedCampaignIds, appliedCampaignIds, showSuccess, initialLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleSaveTip = (tip: string) => {
    if (savedTips.includes(tip)) {
      removeSavedTip(tip);
      showSuccessToast('💡 Tip removed from saved!');
    } else {
      saveTip(tip);
      showSuccessToast('💡 Tip saved to your collection!');
    }
  };

  const handleApplyToCampaign = (campaign: Campaign) => {
    markCampaignApplied(campaign.id);
    showSuccessToast(`🚀 Applied to ${campaign.brand} campaign!`);
  };

  const handleSaveCampaign = (campaignId: string) => {
    const wasSaved = savedCampaignIds.includes(campaignId);
    toggleSaveCampaign(campaignId);
    showSuccessToast(wasSaved ? '📌 Campaign removed!' : '📌 Campaign saved!');
  };

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const dismissSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };

  const renderCreator = ({ item }: { item: Creator }) => (
    <CreatorCard 
      creator={item} 
      compact
      onPress={() => showSuccessToast(`👤 Viewing ${item.name}'s profile`)}
    />
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostPreview 
      post={item} 
      compact
      onPress={() => {}}
    />
  );

  // Main render item function for optimized FlatList
  const renderHomeItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'welcome':
        return (
          <View style={styles.welcomeSection}>
            <Text variant="headlineMedium" style={styles.greeting}>
              Welcome to FobZim! 🇿🇼
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Discover Zimbabwe's rising content creators
            </Text>
          </View>
        );
        
      case 'tip':
        return (
          <Card style={styles.tipCard} elevation={2}>
            <View style={styles.tipContent}>
              <View style={styles.tipHeader}>
                <MaterialCommunityIcons 
                  name="lightbulb" 
                  size={24} 
                  color={colors.secondary} 
                />
                <Text variant="titleMedium" style={styles.tipTitle}>
                  Creator Tip of the Day
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.tipText}>
                {item.data}
              </Text>
              <View style={styles.tipActions}>
                <Button
                  mode={savedTips.includes(item.data) ? 'contained' : 'outlined'}
                  onPress={() => handleSaveTip(item.data)}
                  style={styles.saveTipButton}
                  icon={savedTips.includes(item.data) ? 'bookmark' : 'bookmark-outline'}
                  labelStyle={styles.saveTipLabel}
                >
                  {savedTips.includes(item.data) ? 'Saved ✓' : 'Save Tip'}
                </Button>
              </View>
            </View>
          </Card>
        );
        
      case 'section-header':
        return (
          <SectionHeader 
            title={item.title} 
            subtitle={item.subtitle}
            actionText="See All"
            onActionPress={() => {}}
          />
        );
        
      case 'horizontal-creators':
        return (
          <FlatList
            data={item.data}
            renderItem={renderCreator}
            keyExtractor={(creator) => creator.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        );
        
      case 'horizontal-posts':
        return (
          <FlatList
            data={item.data}
            renderItem={renderPost}
            keyExtractor={(post) => post.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        );
        
      case 'campaign':
        const campaign = item.data;
        const isApplied = appliedCampaignIds.includes(campaign.id);
        const isSaved = savedCampaignIds.includes(campaign.id);
        
        return (
          <Card key={campaign.id} style={styles.campaignCard} elevation={2}>
            <View style={styles.campaignContent}>
              <View style={styles.campaignInfo}>
                <View style={styles.campaignHeader}>
                  <Text variant="titleMedium" style={styles.campaignTitle}>
                    {campaign.brand}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => handleSaveCampaign(campaign.id)}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonLabel}
                    icon={isSaved ? 'bookmark' : 'bookmark-outline'}
                  >
                    {isSaved ? 'Saved ✓' : 'Save'}
                  </Button>
                </View>
                <Text variant="bodyMedium" style={styles.campaignDescription}>
                  {campaign.title}
                </Text>
                <View style={styles.campaignMeta}>
                  <View style={styles.budgetContainer}>
                    <MaterialCommunityIcons 
                      name="currency-usd" 
                      size={16} 
                      color={colors.success} 
                    />
                    <Text variant="bodySmall" style={styles.budgetText}>
                      ${campaign.budgetUSD}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.deadlineText}>
                    Deadline: {new Date(campaign.deadlineISO).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.campaignActions}>
                <Button 
                  mode={isApplied ? "outlined" : "contained"}
                  style={[styles.applyButton, isApplied && styles.appliedButton]}
                  labelStyle={[styles.applyButtonText, isApplied && styles.appliedButtonText]}
                  onPress={() => handleApplyToCampaign(campaign)}
                  disabled={isApplied}
                  icon={isApplied ? 'check' : 'send'}
                >
                  {isApplied ? 'Applied ✓' : 'Apply Now'}
                </Button>
              </View>
            </View>
          </Card>
        );
        
      case 'spacer':
        return <View style={styles.bottomSpacing} />;
        
      case 'skeleton':
        return <HomeScreenSkeleton />;
        
      default:
        return null;
    }
  };

  return (
    <>
      <FlatList
        data={homeData}
        renderItem={renderHomeItem}
        keyExtractor={(item) => item.id}
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
      />
      
      {/* Enhanced Animated Success Message */}
      <AnimatedSuccessMessage
        visible={showSuccess}
        message={successMessage}
        onDismiss={dismissSuccess}
        icon={successMessage.includes('💡') ? 'lightbulb' : 
              successMessage.includes('🚀') ? 'rocket-launch' :
              successMessage.includes('📌') ? 'bookmark' :
              'check-circle'}
      />
      
      <LoadingOverlay 
        visible={loading} 
        message="Loading Zimbabwe's best creators..."
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  greeting: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  tipContent: {
    padding: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  tipText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  horizontalList: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
  },
  campaignCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  campaignContent: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  campaignTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  campaignDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    color: colors.success,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  deadlineText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  tipActions: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  saveTipButton: {
    borderColor: colors.primary,
  },
  saveTipLabel: {
    fontSize: 14,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginRight: -spacing.sm,
  },
  saveButtonLabel: {
    fontSize: 12,
  },
  campaignActions: {
    justifyContent: 'center',
  },
  appliedButton: {
    borderColor: colors.success,
    backgroundColor: 'transparent',
  },
  appliedButtonText: {
    color: colors.success,
  },
});