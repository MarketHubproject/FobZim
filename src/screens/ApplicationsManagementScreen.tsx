import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  Text,
  Surface,
  Chip,
  Button,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Card,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { CampaignService } from '../services/CampaignService';
import ApplicationCard from '../components/application/ApplicationCard';
import { CampaignApplication } from '../types/campaign';

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

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

interface ApplicationsManagementScreenProps {
  route: {
    params: {
      campaignId: string;
      campaignTitle: string;
    };
  };
}

const ApplicationsManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { campaignId, campaignTitle } = route.params as { campaignId: string; campaignTitle: string };

  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<CampaignApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedApplication, setSelectedApplication] = useState<CampaignApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [campaignId]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await CampaignService.getCampaignApplications(campaignId);
      setApplications(apps);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.creatorName.toLowerCase().includes(query) ||
        app.creatorEmail.toLowerCase().includes(query) ||
        app.message.toLowerCase().includes(query) ||
        app.experience?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleAcceptApplication = async (application: CampaignApplication) => {
    Alert.alert(
      'Accept Application',
      `Are you sure you want to accept ${application.creatorName}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await CampaignService.updateApplicationStatus(application.id, 'accepted');
              await loadApplications();
              Alert.alert('Success', 'Application accepted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to accept application');
            }
          },
        },
      ]
    );
  };

  const handleRejectApplication = async (application: CampaignApplication) => {
    Alert.alert(
      'Reject Application',
      `Are you sure you want to reject ${application.creatorName}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await CampaignService.updateApplicationStatus(application.id, 'rejected');
              await loadApplications();
              Alert.alert('Success', 'Application rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject application');
            }
          },
        },
      ]
    );
  };

  const handleContactApplicant = (application: CampaignApplication) => {
    Alert.alert(
      'Contact Applicant',
      `How would you like to contact ${application.creatorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            // In a real app, you'd open email client or in-app messaging
            Alert.alert('Email', `Opening email to ${application.creatorEmail}`);
          },
        },
        {
          text: 'In-App Message',
          onPress: () => {
            Alert.alert('Coming Soon', 'In-app messaging will be available soon!');
          },
        },
      ]
    );
  };

  const showApplicationDetail = (application: CampaignApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
    return counts;
  };

  const renderFilterChips = () => {
    const counts = getStatusCounts();
    const filters: { key: FilterStatus; label: string; count: number }[] = [
      { key: 'all', label: 'All', count: counts.all },
      { key: 'pending', label: 'Pending', count: counts.pending },
      { key: 'accepted', label: 'Accepted', count: counts.accepted },
      { key: 'rejected', label: 'Rejected', count: counts.rejected },
    ];

    return (
      <View style={styles.filtersContainer}>
        {filters.map(filter => (
          <Chip
            key={filter.key}
            mode={statusFilter === filter.key ? 'flat' : 'outlined'}
            selected={statusFilter === filter.key}
            onPress={() => setStatusFilter(filter.key)}
            style={[
              styles.filterChip,
              statusFilter === filter.key && styles.activeFilterChip,
            ]}
            textStyle={[
              styles.filterChipText,
              statusFilter === filter.key && styles.activeFilterChipText,
            ]}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </View>
    );
  };

  const renderApplicationItem = ({ item }: { item: CampaignApplication }) => (
    <ApplicationCard
      application={item}
      onPress={() => showApplicationDetail(item)}
      onAccept={() => handleAcceptApplication(item)}
      onReject={() => handleRejectApplication(item)}
      onContact={() => handleContactApplicant(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="account-search"
        size={64}
        color={colors.muted}
      />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        {statusFilter === 'all' ? 'No Applications Yet' : `No ${statusFilter} Applications`}
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        {statusFilter === 'all'
          ? 'Your campaign hasn\'t received any applications yet. Share it to get more visibility!'
          : `There are no ${statusFilter} applications to show.`}
      </Text>
      {statusFilter === 'all' && applications.length === 0 && (
        <Button
          mode="outlined"
          onPress={() => {
            Alert.alert('Share Campaign', 'Campaign sharing functionality coming soon!');
          }}
          style={styles.emptyAction}
          icon="share-variant"
        >
          Share Campaign
        </Button>
      )}
    </View>
  );

  const renderApplicationDetail = () => {
    if (!selectedApplication) return null;

    return (
      <Portal>
        <Modal
          visible={showDetailModal}
          onDismiss={() => setShowDetailModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.detailCard}>
            <Card.Content>
              <View style={styles.detailHeader}>
                <Text variant="headlineSmall" style={styles.detailTitle}>
                  Application Details
                </Text>
                <Button
                  mode="text"
                  onPress={() => setShowDetailModal(false)}
                  icon="close"
                >
                  Close
                </Button>
              </View>
              
              <ApplicationCard
                application={selectedApplication}
                onAccept={() => {
                  setShowDetailModal(false);
                  handleAcceptApplication(selectedApplication);
                }}
                onReject={() => {
                  setShowDetailModal(false);
                  handleRejectApplication(selectedApplication);
                }}
                onContact={() => {
                  setShowDetailModal(false);
                  handleContactApplicant(selectedApplication);
                }}
                compact={false}
              />
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title="Applications" 
          subtitle={campaignTitle}
          subtitleStyle={styles.subtitle}
        />
        <Appbar.Action
          icon="refresh"
          onPress={onRefresh}
          disabled={refreshing}
        />
      </Appbar.Header>

      {/* Stats Summary */}
      <Surface style={styles.statsContainer} elevation={1}>
        <View style={styles.statItem}>
          <Text variant="titleLarge" style={styles.statValue}>
            {getStatusCounts().all}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Total Applications
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.warning }]}>
            {getStatusCounts().pending}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Pending Review
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.success }]}>
            {getStatusCounts().accepted}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Accepted
          </Text>
        </View>
      </Surface>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search applications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bulk Actions FAB */}
      {getStatusCounts().pending > 0 && (
        <FAB
          icon="account-multiple-check"
          label="Bulk Actions"
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => {
            Alert.alert('Bulk Actions', 'Bulk actions functionality coming soon!');
          }}
        />
      )}

      {/* Application Detail Modal */}
      {renderApplicationDetail()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    elevation: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.background,
    alignSelf: 'center',
    height: '60%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    backgroundColor: colors.surface,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    margin: 4,
    borderColor: colors.primary,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
  },
  activeFilterChipText: {
    color: colors.white,
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 50,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAction: {
    borderColor: colors.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  detailCard: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
});

export default ApplicationsManagementScreen;