import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';

import CreatorCard from '../../components/CreatorCard';
import PostPreview from '../../components/PostPreview';
import SectionHeader from '../../components/SectionHeader';
import LoadingOverlay from '../../components/LoadingOverlay';

import { mockCreators, mockPosts, mockCampaigns, dailyTips } from '../../data/mockData';
import { Creator, Post, Campaign } from '../../data/types';
import { useAppStore } from '../../store/useAppStore';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  
  // Store actions
  const { 
    saveTip, 
    removeSavedTip, 
    markCampaignApplied,
    toggleSaveCampaign,
    savedTips,
    savedCampaignIds,
    appliedCampaignIds,
    showOnboardingTip,
    dismissOnboardingTip
  } = useAppStore();
  
  // Get data for home screen
  const spotlightCreators = mockCreators.filter(creator => creator.spotlight).slice(0, 5);
  const recentPosts = mockPosts.slice(0, 10);
  const topCampaigns = mockCampaigns.slice(0, 3);
  const todaysTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleSaveTip = (tip: string) => {
    const isSaved = savedTips.includes(tip);
    if (isSaved) {
      removeSavedTip(tip);
      setShowSuccessMessage('Tip removed from saved items');
    } else {
      saveTip(tip);
      setShowSuccessMessage('Tip saved! Check your Profile to see all saved tips.');
    }
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleApplyToCampaign = (campaign: Campaign) => {
    const isAlreadyApplied = appliedCampaignIds.includes(campaign.id);
    if (isAlreadyApplied) {
      setShowSuccessMessage('You have already applied to this campaign!');
    } else {
      markCampaignApplied(campaign.id);
      setShowSuccessMessage(`Applied to ${campaign.brand} campaign! They'll review your application.`);
    }
    setTimeout(() => setShowSuccessMessage(''), 4000);
  };

  const handleSaveCampaign = (campaignId: string) => {
    toggleSaveCampaign(campaignId);
    const isSaved = savedCampaignIds.includes(campaignId);
    setShowSuccessMessage(isSaved ? 'Campaign removed from saved' : 'Campaign saved!');
    setTimeout(() => setShowSuccessMessage(''), 2000);
  };

  const renderCreator = ({ item }: { item: Creator }) => (
    <CreatorCard 
      creator={item} 
      compact
      onPress={() => console.log('Creator pressed:', item.name)}
    />
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostPreview 
      post={item} 
      compact
      onPress={() => console.log('Post pressed:', item.id)}
    />
  );

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text variant="headlineMedium" style={styles.greeting}>
            Welcome to FobZim! 🇿🇼
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Discover Zimbabwe's rising content creators
          </Text>
        </View>

        {/* Daily Tip */}
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
              {todaysTip}
            </Text>
            <View style={styles.tipActions}>
              <Button
                mode={savedTips.includes(todaysTip) ? 'contained' : 'outlined'}
                onPress={() => handleSaveTip(todaysTip)}
                style={styles.saveTipButton}
                icon={savedTips.includes(todaysTip) ? 'bookmark' : 'bookmark-outline'}
                labelStyle={styles.saveTipLabel}
              >
                {savedTips.includes(todaysTip) ? 'Saved' : 'Save Tip'}
              </Button>
            </View>
          </View>
        </Card>

        {/* Success Message */}
        {showSuccessMessage && (
          <Card style={styles.successCard} elevation={3}>
            <View style={styles.successContent}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={colors.success} 
              />
              <Text variant="bodyMedium" style={styles.successText}>
                {showSuccessMessage}
              </Text>
            </View>
          </Card>
        )}

        {/* Spotlight Creators */}
        <SectionHeader 
          title="Spotlight Creators" 
          subtitle="Rising stars from Zimbabwe"
          actionText="See All"
          onActionPress={() => console.log('See all creators')}
        />
        <FlatList
          data={spotlightCreators}
          renderItem={renderCreator}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Latest Content */}
        <SectionHeader 
          title="Latest Content" 
          subtitle="Fresh posts from creators"
          actionText="Explore"
          onActionPress={() => console.log('Explore content')}
        />
        <FlatList
          data={recentPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Brand Campaigns */}
        <SectionHeader 
          title="Brand Opportunities" 
          subtitle="Featured campaigns for creators"
          actionText="View All"
          onActionPress={() => console.log('View campaigns')}
        />
        
        {topCampaigns.map((campaign) => {
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
                      {isSaved ? 'Saved' : 'Save'}
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
                    {isApplied ? 'Applied' : 'Apply'}
                  </Button>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
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
  successCard: {
    backgroundColor: colors.success + '15',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successContent: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    color: colors.success,
    marginLeft: spacing.sm,
    fontWeight: '500',
    flex: 1,
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
