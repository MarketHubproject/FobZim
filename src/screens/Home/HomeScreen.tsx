import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';

import CreatorCard from '../../components/CreatorCard';
import PostPreview from '../../components/PostPreview';
import SectionHeader from '../../components/SectionHeader';
import LoadingOverlay from '../../components/LoadingOverlay';

import { mockCreators, mockPosts, mockCampaigns, dailyTips } from '../../data/mockData';
import { Creator, Post, Campaign } from '../../data/types';
import { useAppStore } from '../../store/simpleStore';

export default function HomeScreen() {
  const { 
    savedTips, 
    savedCampaignIds, 
    appliedCampaignIds, 
    saveTip, 
    removeSavedTip, 
    toggleSaveCampaign, 
    markCampaignApplied,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    enableAutoSave,
    disableAutoSave,
    autoSaveEnabled
  } = useAppStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  const handleSaveToStorage = async () => {
    setLoading(true);
    const success = await saveToStorage();
    setLoading(false);
    showSuccessToast(success ? '💾 Data saved to storage!' : '❌ Failed to save data');
  };

  const handleLoadFromStorage = async () => {
    setLoading(true);
    await loadFromStorage();
    setLoading(false);
    showSuccessToast('🔄 Data loaded from storage!');
  };

  const handleClearStorage = async () => {
    setLoading(true);
    const success = await clearStorage();
    setLoading(false);
    showSuccessToast(success ? '🗑️ Storage cleared!' : '❌ Failed to clear storage');
  };

  const handleToggleAutoSave = () => {
    if (autoSaveEnabled) {
      disableAutoSave();
      showSuccessToast('⏸️ Auto-save disabled');
    } else {
      enableAutoSave();
      showSuccessToast('▶️ Auto-save enabled');
    }
  };

  const renderCreator = ({ item }: { item: Creator }) => (
    <CreatorCard 
      creator={item} 
      compact
      onPress={() => {}}
    />
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostPreview 
      post={item} 
      compact
      onPress={() => {}}
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

        {/* Persistence Testing (Development only) */}
        <Card style={styles.testCard} elevation={2}>
          <View style={styles.testContent}>
            <Text variant="titleMedium" style={styles.testTitle}>
              🔧 Persistence Testing
            </Text>
            <Text variant="bodySmall" style={styles.testSubtitle}>
              Test data saving/loading (Development mode)
            </Text>
            <View style={styles.autoSaveContainer}>
              <Button
                mode={autoSaveEnabled ? 'contained' : 'outlined'}
                onPress={handleToggleAutoSave}
                style={[styles.autoSaveButton, autoSaveEnabled && styles.autoSaveEnabled]}
                icon={autoSaveEnabled ? 'pause' : 'play'}
              >
                {autoSaveEnabled ? 'Auto-Save ON' : 'Auto-Save OFF'}
              </Button>
            </View>
            <View style={styles.testButtons}>
              <Button
                mode="outlined"
                onPress={handleSaveToStorage}
                style={styles.testButton}
                icon="content-save"
              >
                Save Data
              </Button>
              <Button
                mode="outlined"
                onPress={handleLoadFromStorage}
                style={styles.testButton}
                icon="reload"
              >
                Load Data
              </Button>
              <Button
                mode="outlined"
                onPress={handleClearStorage}
                style={styles.testButton}
                icon="delete"
              >
                Clear Storage
              </Button>
            </View>
            <Text variant="bodySmall" style={styles.testInfo}>
              💡 Saved Tips: {savedTips.length} | Campaigns: {savedCampaignIds.length}
            </Text>
            <Text variant="bodySmall" style={[styles.testInfo, styles.autoSaveStatus]}>
              🤖 Auto-Save: {autoSaveEnabled ? '✅ ENABLED' : '❌ DISABLED'}
            </Text>
          </View>
        </Card>

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
                {savedTips.includes(todaysTip) ? 'Saved ✓' : 'Save Tip'}
              </Button>
            </View>
          </View>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <Card style={styles.successCard} elevation={3}>
            <View style={styles.successContent}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={colors.success} 
              />
              <Text variant="bodyMedium" style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          </Card>
        )}

        {/* Spotlight Creators */}
        <SectionHeader 
          title="Spotlight Creators" 
          subtitle="Rising stars from Zimbabwe"
          actionText="See All"
          onActionPress={() => {}}
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
          onActionPress={() => {}}
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
          onActionPress={() => {}}
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
  successCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...shadow.sm,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  successText: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
    flex: 1,
  },
  testCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    ...shadow.sm,
  },
  testContent: {
    padding: spacing.md,
  },
  testTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  testSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  testButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testButton: {
    flex: 1,
    borderColor: colors.secondary,
  },
  testInfo: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  autoSaveContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  autoSaveButton: {
    borderColor: colors.secondary,
    minWidth: 150,
  },
  autoSaveEnabled: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  autoSaveStatus: {
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
