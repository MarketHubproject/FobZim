import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  Share
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Menu,
  ProgressBar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { CampaignDetailNavigationProp, CampaignDetailRouteProp } from '../types/navigation';

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

// Mock campaign interface
interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  location: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  participantCount: number;
  isOwner: boolean;
  isParticipating: boolean;
  updates: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    imageUrl?: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    targetAmount: number;
    isCompleted: boolean;
  }>;
}

interface CampaignDetailScreenProps {
  route: CampaignDetailRouteProp;
  navigation: CampaignDetailNavigationProp;
}

const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { campaignId } = route.params;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'about' | 'updates' | 'milestones'>('about');

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  const loadCampaignDetails = async () => {
    try {
      setLoading(true);
      
      // Mock campaign data - in real app, this would come from campaignService
      const mockCampaign: Campaign = {
        id: campaignId,
        title: 'Clean Water Initiative',
        description: 'Bringing clean water to rural communities in Zimbabwe. This comprehensive project aims to install new water pumps and purification systems in 10 villages across Mashonaland province.\n\nOur goal is to provide sustainable access to clean drinking water for over 5,000 people. The project includes:\n\n• Installation of 10 solar-powered water pumps\n• Water purification and storage systems\n• Community training programs\n• Maintenance and monitoring systems\n\nEvery dollar donated directly supports materials, installation, and ongoing maintenance of these vital water systems.',
        category: 'Environment',
        imageUrl: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=600',
        targetAmount: 50000,
        currentAmount: 32500,
        location: 'Mashonaland, Zimbabwe',
        createdBy: 'creator-id',
        creatorName: 'Sarah Mwangi',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        createdAt: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        participantCount: 156,
        isOwner: campaignId === '1', // Mock ownership check
        isParticipating: Math.random() > 0.5,
        updates: [
          {
            id: '1',
            title: 'First Village Water Pump Installed!',
            content: 'Great news! We successfully installed the first solar-powered water pump in Mhangura village. The community gathered to celebrate this milestone.',
            createdAt: new Date('2024-03-10'),
            imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400'
          },
          {
            id: '2',
            title: 'Community Training Complete',
            content: 'We completed training sessions with village leaders on pump maintenance and water quality monitoring. 25 community members are now certified.',
            createdAt: new Date('2024-02-28')
          },
          {
            id: '3',
            title: 'Project Launch',
            content: 'Officially launched the Clean Water Initiative with community leaders and local government officials. Excited to begin this important work!',
            createdAt: new Date('2024-01-20'),
            imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
          }
        ],
        milestones: [
          {
            id: '1',
            title: 'Community Assessment & Planning',
            targetAmount: 5000,
            isCompleted: true
          },
          {
            id: '2',
            title: 'First 3 Water Pumps',
            targetAmount: 15000,
            isCompleted: true
          },
          {
            id: '3',
            title: 'Water Purification Systems',
            targetAmount: 30000,
            isCompleted: false
          },
          {
            id: '4',
            title: 'All 10 Villages Complete',
            targetAmount: 50000,
            isCompleted: false
          }
        ]
      };

      setCampaign(mockCampaign);
    } catch (error) {
      console.error('Error loading campaign:', error);
      Alert.alert('Error', 'Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCampaignDetails();
    setRefreshing(false);
  }, []);

  const handleJoinCampaign = async () => {
    if (!campaign) return;

    try {
      setJoining(true);
      
      // Mock join/leave logic
      const newParticipationStatus = !campaign.isParticipating;
      
      setCampaign({
        ...campaign,
        isParticipating: newParticipationStatus,
        participantCount: campaign.participantCount + (newParticipationStatus ? 1 : -1)
      });
      
      Alert.alert(
        'Success',
        newParticipationStatus 
          ? 'You have joined this campaign!' 
          : 'You have left this campaign.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update participation status');
    } finally {
      setJoining(false);
    }
  };

  const handleShareCampaign = async () => {
    if (!campaign) return;

    try {
      await Share.share({
        title: campaign.title,
        message: `Check out this campaign: ${campaign.title}\n\n${campaign.description.substring(0, 100)}...\n\nJoin the cause!`,
        url: `https://zimbuzz.com/campaigns/${campaign.id}`
      });
    } catch (error) {
      console.error('Error sharing campaign:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const formatProgress = (current: number, target: number): number => {
    return Math.min((current / target), 1);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (): number => {
    if (!campaign) return 0;
    return Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <IconButton
        icon="arrow-left"
        iconColor={colors.white}
        onPress={() => navigation.goBack()}
      />
      
      <Text style={styles.headerTitle} numberOfLines={1}>
        {campaign?.title}
      </Text>
      
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            iconColor={colors.white}
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            handleShareCampaign();
          }}
          title="Share Campaign"
          leadingIcon="share-variant"
        />
        {campaign?.isOwner && (
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              // TODO: Navigate to edit campaign
            }}
            title="Edit Campaign"
            leadingIcon="pencil"
          />
        )}
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Report campaign
          }}
          title="Report"
          leadingIcon="flag"
        />
      </Menu>
    </View>
  );

  const renderCampaignHero = () => (
    <Card style={styles.heroCard}>
      {campaign?.imageUrl && (
        <Card.Cover source={{ uri: campaign.imageUrl }} style={styles.heroImage} />
      )}
      
      <View style={styles.heroContent}>
        <View style={styles.titleSection}>
          <Text style={styles.campaignTitle}>{campaign?.title}</Text>
          <View style={styles.metaRow}>
            <Chip style={styles.categoryChip} textStyle={styles.categoryChipText} compact>
              {campaign?.category}
            </Chip>
            <Text style={styles.location}>📍 {campaign?.location}</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.raisedAmount}>
              {formatCurrency(campaign?.currentAmount || 0)} raised
            </Text>
            <Text style={styles.targetAmount}>
              of {formatCurrency(campaign?.targetAmount || 0)} goal
            </Text>
          </View>
          
          <ProgressBar
            progress={formatProgress(campaign?.currentAmount || 0, campaign?.targetAmount || 1)}
            color={colors.primary}
            style={styles.progressBar}
          />
          
          <View style={styles.progressFooter}>
            <Text style={styles.participantCount}>
              👥 {campaign?.participantCount} supporters
            </Text>
            <Text style={styles.daysRemaining}>
              🕒 {getDaysRemaining()} days left
            </Text>
          </View>
        </View>

        {/* Creator Section */}
        <TouchableOpacity style={styles.creatorSection}>
          <Avatar.Image
            size={40}
            source={{ uri: campaign?.creatorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }}
          />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{campaign?.creatorName}</Text>
            <Text style={styles.creatorRole}>Campaign Organizer</Text>
          </View>
          {campaign?.isOwner && (
            <Chip style={styles.ownerChip} textStyle={styles.ownerChipText} compact>
              You
            </Chip>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!campaign?.isOwner && (
            <Button
              mode={campaign?.isParticipating ? "outlined" : "contained"}
              onPress={handleJoinCampaign}
              loading={joining}
              style={[styles.actionButton, { flex: 2 }]}
              icon={campaign?.isParticipating ? "heart" : "heart-outline"}
            >
              {campaign?.isParticipating ? 'Supporting' : 'Join Campaign'}
            </Button>
          )}
          
          <Button
            mode="outlined"
            onPress={handleShareCampaign}
            style={[styles.actionButton, { flex: 1, marginLeft: campaign?.isOwner ? 0 : 8 }]}
            icon="share-variant"
          >
            Share
          </Button>
        </View>
      </View>
    </Card>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['about', 'updates', 'milestones'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, selectedTab === tab && styles.activeTab]}
          onPress={() => setSelectedTab(tab)}
        >
          <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'about':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.sectionTitle}>About This Campaign</Text>
            <Text style={styles.description}>{campaign?.description}</Text>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Campaign Details</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
                <Text style={styles.detailText}>Started: {formatDate(campaign?.createdAt || new Date())}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.textSecondary} />
                <Text style={styles.detailText}>Ends: {formatDate(campaign?.endDate || new Date())}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.textSecondary} />
                <Text style={styles.detailText}>Location: {campaign?.location}</Text>
              </View>
            </View>
          </Card>
        );
      
      case 'updates':
        return (
          <View>
            {campaign?.updates.map((update, index) => (
              <Card key={update.id} style={[styles.contentCard, index > 0 && styles.updateCard]}>
                <Text style={styles.updateTitle}>{update.title}</Text>
                <Text style={styles.updateDate}>{formatDate(update.createdAt)}</Text>
                <Text style={styles.updateContent}>{update.content}</Text>
                {update.imageUrl && (
                  <Card.Cover source={{ uri: update.imageUrl }} style={styles.updateImage} />
                )}
              </Card>
            ))}
          </View>
        );
      
      case 'milestones':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Campaign Milestones</Text>
            {campaign?.milestones.map((milestone, index) => (
              <View key={milestone.id} style={styles.milestoneItem}>
                <View style={styles.milestoneHeader}>
                  <MaterialCommunityIcons 
                    name={milestone.isCompleted ? "check-circle" : "circle-outline"} 
                    size={24} 
                    color={milestone.isCompleted ? colors.success : colors.muted} 
                  />
                  <Text style={[
                    styles.milestoneTitle,
                    milestone.isCompleted && styles.completedMilestone
                  ]}>
                    {milestone.title}
                  </Text>
                </View>
                <Text style={styles.milestoneAmount}>
                  {formatCurrency(milestone.targetAmount)}
                </Text>
                {index < campaign.milestones.length - 1 && <Divider style={styles.milestoneDivider} />}
              </View>
            ))}
          </Card>
        );
      
      default:
        return null;
    }
  };

  if (loading && !campaign) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading campaign...</Text>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="briefcase-alert" size={64} color={colors.muted} />
        <Text style={styles.errorTitle}>Campaign Not Found</Text>
        <Text style={styles.errorDescription}>
          The campaign you're looking for doesn't exist or has been removed.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderCampaignHero()}
        {renderTabs()}
        {renderTabContent()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  heroCard: {
    margin: 16,
    marginBottom: 8,
  },
  heroImage: {
    height: 200,
  },
  heroContent: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  campaignTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    backgroundColor: colors.primary + '20',
  },
  categoryChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raisedAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  targetAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  daysRemaining: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  creatorRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ownerChip: {
    backgroundColor: colors.warning + '20',
  },
  ownerChipText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  contentCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  updateCard: {
    marginTop: 0,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  updateContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  updateImage: {
    height: 150,
    borderRadius: 8,
  },
  milestoneItem: {
    paddingVertical: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  completedMilestone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  milestoneAmount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 36,
  },
  milestoneDivider: {
    marginTop: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CampaignDetailScreen;