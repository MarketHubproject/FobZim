import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

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
  zimbabwe: '#FFCC02',
};

interface AnalyticsData {
  overview: {
    totalEarnings: number;
    totalViews: number;
    totalFollowers: number;
    campaignsCompleted: number;
    averageRating: number;
    responseRate: number;
  };
  earnings: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    byCategory: Array<{ category: string; amount: number; color: string }>;
  };
  performance: {
    viewsGrowth: number;
    followersGrowth: number;
    engagementRate: number;
    topPerformingContent: Array<{
      title: string;
      views: number;
      engagement: number;
      platform: string;
    }>;
  };
  campaigns: {
    active: number;
    pending: number;
    completed: number;
    rejected: number;
    recentCampaigns: Array<{
      title: string;
      brand: string;
      status: 'active' | 'completed' | 'pending';
      earnings: number;
      deadline: string;
    }>;
  };
}

// Mock analytics data
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalEarnings: 2840,
    totalViews: 125000,
    totalFollowers: 25400,
    campaignsCompleted: 12,
    averageRating: 4.8,
    responseRate: 94,
  },
  earnings: {
    thisMonth: 850,
    lastMonth: 620,
    thisYear: 2840,
    byCategory: [
      { category: 'Fashion', amount: 1200, color: '#E91E63' },
      { category: 'Tech', amount: 800, color: '#2196F3' },
      { category: 'Food', amount: 540, color: '#FF9800' },
      { category: 'Travel', amount: 300, color: colors.success },
    ],
  },
  performance: {
    viewsGrowth: 18.5,
    followersGrowth: 12.3,
    engagementRate: 6.8,
    topPerformingContent: [
      {
        title: 'Zimbabwe Tourism Campaign',
        views: 45000,
        engagement: 8.2,
        platform: 'Instagram',
      },
      {
        title: 'Local Fashion Showcase',
        views: 32000,
        engagement: 7.5,
        platform: 'TikTok',
      },
      {
        title: 'Food Culture Series',
        views: 28000,
        engagement: 9.1,
        platform: 'Instagram',
      },
    ],
  },
  campaigns: {
    active: 3,
    pending: 5,
    completed: 12,
    rejected: 2,
    recentCampaigns: [
      {
        title: 'Nike Air Jordan Campaign',
        brand: 'Nike',
        status: 'active',
        earnings: 800,
        deadline: '2024-02-15',
      },
      {
        title: 'Tourism Zimbabwe',
        brand: 'ZTA',
        status: 'completed',
        earnings: 650,
        deadline: '2024-01-30',
      },
      {
        title: 'Local Fashion Brand',
        brand: 'Fashion Co',
        status: 'pending',
        earnings: 400,
        deadline: '2024-02-20',
      },
    ],
  },
};

export default function AnalyticsScreen() {
  console.log('✅ AnalyticsScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast('📊 Analytics updated!');
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'completed': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.muted;
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? 'trending-up' : growth < 0 ? 'trending-down' : 'trending-neutral';
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? colors.success : growth < 0 ? colors.error : colors.muted;
  };

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      
      <View style={styles.cardsGrid}>
        <Card style={[styles.overviewCard, styles.primaryCard]}>
          <View style={styles.cardContent}>
            <MaterialCommunityIcons name="currency-usd" size={24} color={colors.white} />
            <Text style={styles.cardValue}>{formatCurrency(data.overview.totalEarnings)}</Text>
            <Text style={styles.cardLabel}>Total Earnings</Text>
          </View>
        </Card>

        <Card style={styles.overviewCard}>
          <View style={styles.cardContent}>
            <MaterialCommunityIcons name="eye" size={24} color={colors.info} />
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
              {formatNumber(data.overview.totalViews)}
            </Text>
            <Text style={styles.cardLabel}>Total Views</Text>
          </View>
        </Card>

        <Card style={styles.overviewCard}>
          <View style={styles.cardContent}>
            <MaterialCommunityIcons name="account-group" size={24} color={colors.success} />
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
              {formatNumber(data.overview.totalFollowers)}
            </Text>
            <Text style={styles.cardLabel}>Followers</Text>
          </View>
        </Card>

        <Card style={styles.overviewCard}>
          <View style={styles.cardContent}>
            <MaterialCommunityIcons name="briefcase" size={24} color={colors.warning} />
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
              {data.overview.campaignsCompleted}
            </Text>
            <Text style={styles.cardLabel}>Campaigns</Text>
          </View>
        </Card>
      </View>
    </View>
  );

  const renderEarningsSection = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
      
      <View style={styles.earningsHeader}>
        <View style={styles.earningsPeriod}>
          <Text style={styles.earningsAmount}>{formatCurrency(data.earnings.thisMonth)}</Text>
          <Text style={styles.earningsLabel}>This Month</Text>
          <Text style={[styles.earningsGrowth, { color: colors.success }]}>
            +{((data.earnings.thisMonth - data.earnings.lastMonth) / data.earnings.lastMonth * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.subsectionTitle}>By Category</Text>
      {data.earnings.byCategory.map((category, index) => (
        <View key={index} style={styles.categoryRow}>
          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          <Text style={styles.categoryName}>{category.category}</Text>
          <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
        </View>
      ))}
    </Card>
  );

  const renderPerformanceSection = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <MaterialCommunityIcons 
              name={getGrowthIcon(data.performance.viewsGrowth)} 
              size={20} 
              color={getGrowthColor(data.performance.viewsGrowth)} 
            />
            <Text style={[styles.metricValue, { color: getGrowthColor(data.performance.viewsGrowth) }]}>
              +{data.performance.viewsGrowth}%
            </Text>
          </View>
          <Text style={styles.metricLabel}>Views Growth</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <MaterialCommunityIcons 
              name={getGrowthIcon(data.performance.followersGrowth)} 
              size={20} 
              color={getGrowthColor(data.performance.followersGrowth)} 
            />
            <Text style={[styles.metricValue, { color: getGrowthColor(data.performance.followersGrowth) }]}>
              +{data.performance.followersGrowth}%
            </Text>
          </View>
          <Text style={styles.metricLabel}>Followers Growth</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {data.performance.engagementRate}%
          </Text>
          <Text style={styles.metricLabel}>Engagement Rate</Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.subsectionTitle}>Top Performing Content</Text>
      {data.performance.topPerformingContent.map((content, index) => (
        <View key={index} style={styles.contentRow}>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <View style={styles.contentMetrics}>
              <Chip style={styles.platformChip} compact>
                {content.platform}
              </Chip>
              <Text style={styles.contentStats}>
                {formatNumber(content.views)} views • {content.engagement}% engagement
              </Text>
            </View>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderCampaignsSection = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Campaign Analytics</Text>
      
      <View style={styles.campaignStats}>
        <View style={styles.campaignStatItem}>
          <Text style={[styles.campaignStatNumber, { color: colors.success }]}>
            {data.campaigns.active}
          </Text>
          <Text style={styles.campaignStatLabel}>Active</Text>
        </View>
        <View style={styles.campaignStatItem}>
          <Text style={[styles.campaignStatNumber, { color: colors.warning }]}>
            {data.campaigns.pending}
          </Text>
          <Text style={styles.campaignStatLabel}>Pending</Text>
        </View>
        <View style={styles.campaignStatItem}>
          <Text style={[styles.campaignStatNumber, { color: colors.primary }]}>
            {data.campaigns.completed}
          </Text>
          <Text style={styles.campaignStatLabel}>Completed</Text>
        </View>
        <View style={styles.campaignStatItem}>
          <Text style={[styles.campaignStatNumber, { color: colors.error }]}>
            {data.campaigns.rejected}
          </Text>
          <Text style={styles.campaignStatLabel}>Rejected</Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.subsectionTitle}>Recent Campaigns</Text>
      {data.campaigns.recentCampaigns.map((campaign, index) => (
        <View key={index} style={styles.campaignRow}>
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            <Text style={styles.campaignBrand}>by {campaign.brand}</Text>
          </View>
          <View style={styles.campaignRight}>
            <Text style={styles.campaignEarnings}>{formatCurrency(campaign.earnings)}</Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(campaign.status) + '20' }]}
              textStyle={{ color: getStatusColor(campaign.status) }}
              compact
            >
              {campaign.status}
            </Chip>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderSuccessMessage = () => {
    if (!showSuccess) return null;
    
    return (
      <View style={styles.successMessage}>
        <MaterialCommunityIcons name="check-circle" size={20} color={colors.white} />
        <Text style={styles.successText}>{successMessage}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics Dashboard 📊</Text>
            <Text style={styles.headerSubtitle}>Track your creator journey</Text>
          </View>
          
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodChip,
                  selectedPeriod === period && styles.activePeriodChip,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period && styles.activePeriodText,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderOverviewCards()}
        {renderEarningsSection()}
        {renderPerformanceSection()}
        {renderCampaignsSection()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderSuccessMessage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + '30',
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activePeriodChip: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activePeriodText: {
    color: colors.white,
  },
  overviewContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: (screenWidth - 48) / 2,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  primaryCard: {
    backgroundColor: colors.primary,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.surface,
  },
  earningsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsPeriod: {
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  earningsLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  earningsGrowth: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contentRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + '20',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  contentMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformChip: {
    marginRight: 8,
    backgroundColor: colors.zimbabwe + '20',
  },
  contentStats: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  campaignStatItem: {
    alignItems: 'center',
  },
  campaignStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  campaignStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  campaignRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + '20',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  campaignBrand: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  campaignRight: {
    alignItems: 'flex-end',
  },
  campaignEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statusChip: {
    backgroundColor: colors.background,
  },
  successMessage: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },
  successText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});