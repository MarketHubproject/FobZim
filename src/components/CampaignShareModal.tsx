import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import {
  Text,
  IconButton,
  Card,
  Avatar,
  Searchbar,
  ActivityIndicator,
  Button,
  Chip,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';

const { width, height } = Dimensions.get('window');

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
  accent: '#FF5722',
  overlay: 'rgba(0, 0, 0, 0.5)'
};

// Mock campaign interface (would be imported from campaign service)
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
  createdAt: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  participantCount: number;
  isOwner: boolean;
}

interface CampaignShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShareCampaign: (campaign: Campaign, message?: string) => void;
  loading?: boolean;
}

const CampaignShareModal: React.FC<CampaignShareModalProps> = ({
  visible,
  onClose,
  onShareCampaign,
  loading = false
}) => {
  const { user } = useEnhancedAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my' | 'participating'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [step, setStep] = useState<'select' | 'customize'>('select');

  // Load campaigns
  useEffect(() => {
    if (visible) {
      loadCampaigns();
    }
  }, [visible]);

  // Filter campaigns based on search and filter
  useEffect(() => {
    let filtered = campaigns;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchLower) ||
        campaign.description.toLowerCase().includes(searchLower) ||
        campaign.category.toLowerCase().includes(searchLower) ||
        campaign.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filters
    switch (selectedFilter) {
      case 'my':
        filtered = filtered.filter(campaign => campaign.isOwner);
        break;
      case 'participating':
        filtered = filtered.filter(campaign => !campaign.isOwner && campaign.participantCount > 0);
        break;
      default:
        break;
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, selectedFilter]);

  const loadCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      
      // Mock campaign data - in real app, this would come from campaignService
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Clean Water Initiative',
          description: 'Bringing clean water to rural communities in Zimbabwe. Help us install new water pumps and purification systems.',
          category: 'Environment',
          imageUrl: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=300',
          targetAmount: 50000,
          currentAmount: 25000,
          location: 'Mashonaland, Zimbabwe',
          createdBy: user?.uid || 'current-user',
          createdAt: new Date('2024-01-15'),
          endDate: new Date('2024-12-31'),
          status: 'active',
          participantCount: 156,
          isOwner: true
        },
        {
          id: '2',
          title: 'Youth Skills Development Program',
          description: 'Empowering young people with technical skills and entrepreneurship training to create sustainable livelihoods.',
          category: 'Education',
          imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300',
          targetAmount: 30000,
          currentAmount: 18500,
          location: 'Harare, Zimbabwe',
          createdBy: 'other-user',
          createdAt: new Date('2024-02-01'),
          endDate: new Date('2024-11-30'),
          status: 'active',
          participantCount: 89,
          isOwner: false
        },
        {
          id: '3',
          title: 'Solar Power for Schools',
          description: 'Installing solar panels in rural schools to provide reliable electricity for learning and digital access.',
          category: 'Technology',
          imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300',
          targetAmount: 75000,
          currentAmount: 65000,
          location: 'Matabeleland, Zimbabwe',
          createdBy: user?.uid || 'current-user',
          createdAt: new Date('2024-01-10'),
          endDate: new Date('2024-10-31'),
          status: 'active',
          participantCount: 234,
          isOwner: true
        },
        {
          id: '4',
          title: 'Community Health Clinic',
          description: 'Building a new health clinic to serve remote communities with basic medical care and maternal health services.',
          category: 'Healthcare',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300',
          targetAmount: 100000,
          currentAmount: 45000,
          location: 'Midlands, Zimbabwe',
          createdBy: 'other-user',
          createdAt: new Date('2024-03-01'),
          endDate: new Date('2025-02-28'),
          status: 'active',
          participantCount: 167,
          isOwner: false
        }
      ];

      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      Alert.alert('Error', 'Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setStep('customize');
  };

  const handleShare = () => {
    if (!selectedCampaign) return;
    
    onShareCampaign(selectedCampaign, customMessage.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedCampaign(null);
    setCustomMessage('');
    setSearchQuery('');
    setSelectedFilter('all');
    onClose();
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const formatProgress = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    return `${percentage.toFixed(0)}%`;
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <TouchableOpacity onPress={() => handleCampaignSelect(item)}>
      <Card style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          {item.imageUrl ? (
            <Avatar.Image size={60} source={{ uri: item.imageUrl }} />
          ) : (
            <Avatar.Icon size={60} icon="briefcase" />
          )}
          
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.campaignLocation} numberOfLines={1}>
              📍 {item.location}
            </Text>
            <View style={styles.campaignStats}>
              <Chip
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
                compact
              >
                {item.category}
              </Chip>
              <Text style={styles.participantCount}>
                👥 {item.participantCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressAmount}>
              {formatCurrency(item.currentAmount)} raised of {formatCurrency(item.targetAmount)}
            </Text>
            <Text style={styles.progressPercentage}>
              {formatProgress(item.currentAmount, item.targetAmount)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((item.currentAmount / item.targetAmount) * 100, 100)}%` }
              ]} 
            />
          </View>
        </View>

        {item.isOwner && (
          <View style={styles.ownerBadge}>
            <MaterialCommunityIcons name="crown" size={16} color={colors.warning} />
            <Text style={styles.ownerText}>Your Campaign</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { key: 'all', label: 'All Campaigns' },
          { key: 'my', label: 'My Campaigns' },
          { key: 'participating', label: 'Participating' }
        ]}
        renderItem={({ item }) => (
          <Chip
            style={[
              styles.filterChip,
              selectedFilter === item.key && styles.activeFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === item.key && styles.activeFilterChipText
            ]}
            onPress={() => setSelectedFilter(item.key as any)}
          >
            {item.label}
          </Chip>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filtersContent}
      />
    </View>
  );

  const renderSelectStep = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Share Campaign</Text>
        <IconButton
          icon="close"
          iconColor={colors.textSecondary}
          onPress={handleClose}
        />
      </View>

      <Divider />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search campaigns..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filters */}
      {renderFilterChips()}

      <Divider />

      {/* Campaign List */}
      <View style={styles.listContainer}>
        {loadingCampaigns ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading campaigns...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCampaigns}
            renderItem={renderCampaignItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="briefcase-outline" size={64} color={colors.muted} />
                <Text style={styles.emptyTitle}>No Campaigns Found</Text>
                <Text style={styles.emptyDescription}>
                  {searchQuery ? 'No campaigns match your search' : 'No campaigns available to share'}
                </Text>
              </View>
            }
            contentContainerStyle={filteredCampaigns.length === 0 ? styles.emptyContentContainer : undefined}
          />
        )}
      </View>
    </>
  );

  const renderCustomizeStep = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textSecondary}
          onPress={() => setStep('select')}
        />
        <Text style={styles.headerTitle}>Add Message</Text>
        <Button
          mode="contained"
          onPress={handleShare}
          loading={loading}
          disabled={loading}
          compact
        >
          Share
        </Button>
      </View>

      <Divider />

      {/* Selected Campaign Preview */}
      {selectedCampaign && (
        <View style={styles.selectedCampaignContainer}>
          <Text style={styles.selectedCampaignLabel}>Sharing:</Text>
          <Card style={styles.selectedCampaignCard}>
            <View style={styles.campaignHeader}>
              {selectedCampaign.imageUrl ? (
                <Avatar.Image size={50} source={{ uri: selectedCampaign.imageUrl }} />
              ) : (
                <Avatar.Icon size={50} icon="briefcase" />
              )}
              
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignTitle} numberOfLines={1}>
                  {selectedCampaign.title}
                </Text>
                <Text style={styles.campaignLocation} numberOfLines={1}>
                  📍 {selectedCampaign.location}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      <Divider />

      {/* Message Input */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageLabel}>Add a message (optional):</Text>
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Tell them why this campaign matters..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    </>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {step === 'select' ? renderSelectStep() : renderCustomizeStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.background,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
  },
  activeFilterChipText: {
    color: colors.white,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  campaignCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
    marginLeft: 12,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  campaignLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  campaignStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    backgroundColor: colors.primary + '20',
    flex: 1,
    marginRight: 8,
  },
  categoryChipText: {
    color: colors.primary,
    fontSize: 12,
  },
  participantCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressAmount: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  ownerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownerText: {
    fontSize: 10,
    color: colors.warning,
    marginLeft: 2,
    fontWeight: '600',
  },
  selectedCampaignContainer: {
    padding: 16,
  },
  selectedCampaignLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedCampaignCard: {
    padding: 12,
  },
  messageContainer: {
    flex: 1,
    padding: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  messageInputContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
});

export default CampaignShareModal;