import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  Surface,
  IconButton,
  Divider,
  ProgressBar,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';

interface ApplicationStatus {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  brandLogo?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'approved' | 'rejected' | 'contract_sent' | 'in_progress' | 'completed';
  submittedDate: Date;
  lastUpdate: Date;
  proposedRate: number;
  responseDeadline?: Date;
  nextAction?: string;
  feedback?: string;
  contractDetails?: {
    finalRate: number;
    startDate: Date;
    deadline: Date;
    deliverables: string[];
  };
  timeline: {
    date: Date;
    status: string;
    description: string;
    isCompleted: boolean;
  }[];
}

const statusConfig = {
  submitted: {
    color: colors.info,
    icon: 'send-check',
    label: 'Submitted',
    description: 'Application sent to brand',
  },
  under_review: {
    color: colors.warning,
    icon: 'eye-check',
    label: 'Under Review',
    description: 'Brand is reviewing your application',
  },
  shortlisted: {
    color: colors.secondary,
    icon: 'star-check',
    label: 'Shortlisted',
    description: 'You\'ve been shortlisted for this campaign',
  },
  approved: {
    color: colors.success,
    icon: 'check-circle',
    label: 'Approved',
    description: 'Congratulations! You\'ve been selected',
  },
  rejected: {
    color: colors.error,
    icon: 'close-circle',
    label: 'Not Selected',
    description: 'Unfortunately, you weren\'t selected this time',
  },
  contract_sent: {
    color: colors.primary,
    icon: 'file-document-outline',
    label: 'Contract Pending',
    description: 'Contract has been sent for your review',
  },
  in_progress: {
    color: colors.accent,
    icon: 'progress-clock',
    label: 'In Progress',
    description: 'Campaign is currently active',
  },
  completed: {
    color: colors.success,
    icon: 'check-all',
    label: 'Completed',
    description: 'Campaign successfully completed',
  },
};

export default function ApplicationHistoryScreen() {
  const navigation = useNavigation();
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationStatus | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const mockApplications: ApplicationStatus[] = [
    {
      id: '1',
      campaignId: 'camp1',
      campaignTitle: 'Summer Fashion Collection 2024',
      brandName: 'StyleHub Zimbabwe',
      status: 'in_progress',
      submittedDate: new Date('2024-01-10'),
      lastUpdate: new Date('2024-01-15'),
      proposedRate: 1200,
      contractDetails: {
        finalRate: 1200,
        startDate: new Date('2024-01-20'),
        deadline: new Date('2024-02-10'),
        deliverables: ['5 Instagram posts', '3 Stories', '1 Reel'],
      },
      timeline: [
        { date: new Date('2024-01-10'), status: 'Submitted', description: 'Application submitted', isCompleted: true },
        { date: new Date('2024-01-12'), status: 'Under Review', description: 'Brand started reviewing', isCompleted: true },
        { date: new Date('2024-01-14'), status: 'Approved', description: 'Selected for campaign', isCompleted: true },
        { date: new Date('2024-01-15'), status: 'Contract Sent', description: 'Contract details sent', isCompleted: true },
        { date: new Date('2024-01-20'), status: 'In Progress', description: 'Campaign started', isCompleted: true },
        { date: new Date('2024-02-10'), status: 'Deadline', description: 'Campaign completion due', isCompleted: false },
      ],
    },
    {
      id: '2',
      campaignId: 'camp2',
      campaignTitle: 'Tech Product Launch',
      brandName: 'TechZim Solutions',
      status: 'shortlisted',
      submittedDate: new Date('2024-01-08'),
      lastUpdate: new Date('2024-01-12'),
      proposedRate: 800,
      responseDeadline: new Date('2024-01-18'),
      nextAction: 'Brand will contact shortlisted creators by January 18th',
      timeline: [
        { date: new Date('2024-01-08'), status: 'Submitted', description: 'Application submitted', isCompleted: true },
        { date: new Date('2024-01-10'), status: 'Under Review', description: 'Brand started reviewing', isCompleted: true },
        { date: new Date('2024-01-12'), status: 'Shortlisted', description: 'Added to shortlist', isCompleted: true },
        { date: new Date('2024-01-18'), status: 'Final Selection', description: 'Brand will announce decision', isCompleted: false },
      ],
    },
    {
      id: '3',
      campaignId: 'camp3',
      campaignTitle: 'Local Food Festival Promotion',
      brandName: 'Harare Food Festival',
      status: 'rejected',
      submittedDate: new Date('2024-01-05'),
      lastUpdate: new Date('2024-01-09'),
      proposedRate: 600,
      feedback: 'Thank you for your application. We went with creators who have more food content in their portfolio. We encourage you to apply for future campaigns!',
      timeline: [
        { date: new Date('2024-01-05'), status: 'Submitted', description: 'Application submitted', isCompleted: true },
        { date: new Date('2024-01-07'), status: 'Under Review', description: 'Brand reviewed application', isCompleted: true },
        { date: new Date('2024-01-09'), status: 'Not Selected', description: 'Application not successful', isCompleted: true },
      ],
    },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApplications(mockApplications);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getFilteredApplications = () => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  };

  const getStatusProgress = (status: string): number => {
    const progressMap = {
      submitted: 0.2,
      under_review: 0.4,
      shortlisted: 0.6,
      approved: 0.8,
      contract_sent: 0.9,
      in_progress: 1.0,
      completed: 1.0,
      rejected: 0.4,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderApplicationCard = (application: ApplicationStatus) => {
    const config = statusConfig[application.status];
    
    return (
      <Card key={application.id} style={styles.applicationCard}>
        <Card.Content>
          <View style={styles.applicationHeader}>
            <View style={styles.brandInfo}>
              <Text variant="titleMedium" style={styles.campaignTitle}>
                {application.campaignTitle}
              </Text>
              <Text variant="bodyMedium" style={styles.brandName}>
                {application.brandName}
              </Text>
            </View>
            
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: config.color + '20' }]}
              textStyle={{ color: config.color, fontSize: 12 }}
              icon={() => (
                <MaterialCommunityIcons 
                  name={config.icon as any} 
                  size={16} 
                  color={config.color} 
                />
              )}
            >
              {config.label}
            </Chip>
          </View>

          <View style={styles.applicationDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
              <Text variant="bodySmall" style={styles.detailText}>
                Applied {formatTimeAgo(application.submittedDate)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="currency-usd" size={16} color={colors.textSecondary} />
              <Text variant="bodySmall" style={styles.detailText}>
                ${application.proposedRate.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="update" size={16} color={colors.textSecondary} />
              <Text variant="bodySmall" style={styles.detailText}>
                Updated {formatTimeAgo(application.lastUpdate)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={getStatusProgress(application.status)}
              color={config.color}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {config.description}
            </Text>
          </View>

          {/* Next Action */}
          {application.nextAction && (
            <View style={styles.nextActionContainer}>
              <MaterialCommunityIcons name="information" size={16} color={colors.info} />
              <Text variant="bodySmall" style={styles.nextActionText}>
                {application.nextAction}
              </Text>
            </View>
          )}

          {/* Response Deadline */}
          {application.responseDeadline && (
            <View style={styles.deadlineContainer}>
              <MaterialCommunityIcons name="clock-alert" size={16} color={colors.warning} />
              <Text variant="bodySmall" style={styles.deadlineText}>
                Response expected by {application.responseDeadline.toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedApplication(application);
              setShowDetailsModal(true);
            }}
            style={styles.actionButton}
          >
            View Details
          </Button>
          
          {application.status === 'contract_sent' && (
            <Button
              mode="contained"
              onPress={() => Alert.alert('Contract', 'Contract review functionality would open here')}
              style={styles.actionButton}
            >
              Review Contract
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;
    
    const config = statusConfig[selectedApplication.status];
    
    return (
      <Portal>
        <Modal 
          visible={showDetailsModal} 
          onDismiss={() => setShowDetailsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Application Details
              </Text>
              <IconButton
                icon="close"
                onPress={() => setShowDetailsModal(false)}
              />
            </View>

            <Card style={styles.detailsCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.campaignTitle}>
                  {selectedApplication.campaignTitle}
                </Text>
                <Text variant="bodyMedium" style={styles.brandName}>
                  {selectedApplication.brandName}
                </Text>
                
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: config.color + '20', marginTop: spacing.sm }]}
                  textStyle={{ color: config.color }}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={config.icon as any} 
                      size={20} 
                      color={config.color} 
                    />
                  )}
                >
                  {config.label}
                </Chip>
              </Card.Content>
            </Card>

            {/* Timeline */}
            <Card style={styles.detailsCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Application Timeline
                </Text>
                
                {selectedApplication.timeline.map((event, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={[
                      styles.timelineIcon,
                      event.isCompleted ? styles.timelineCompleted : styles.timelinePending
                    ]}>
                      <MaterialCommunityIcons
                        name={event.isCompleted ? 'check' : 'clock'}
                        size={16}
                        color={event.isCompleted ? colors.white : colors.textSecondary}
                      />
                    </View>
                    
                    <View style={styles.timelineContent}>
                      <Text variant="bodyMedium" style={styles.timelineStatus}>
                        {event.status}
                      </Text>
                      <Text variant="bodySmall" style={styles.timelineDescription}>
                        {event.description}
                      </Text>
                      <Text variant="bodySmall" style={styles.timelineDate}>
                        {event.date.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Contract Details */}
            {selectedApplication.contractDetails && (
              <Card style={styles.detailsCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Contract Details
                  </Text>
                  
                  <View style={styles.contractDetail}>
                    <Text variant="bodyMedium" style={styles.contractLabel}>Final Rate:</Text>
                    <Text variant="bodyMedium" style={styles.contractValue}>
                      ${selectedApplication.contractDetails.finalRate.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.contractDetail}>
                    <Text variant="bodyMedium" style={styles.contractLabel}>Start Date:</Text>
                    <Text variant="bodyMedium" style={styles.contractValue}>
                      {selectedApplication.contractDetails.startDate.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.contractDetail}>
                    <Text variant="bodyMedium" style={styles.contractLabel}>Deadline:</Text>
                    <Text variant="bodyMedium" style={styles.contractValue}>
                      {selectedApplication.contractDetails.deadline.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Text variant="bodyMedium" style={[styles.contractLabel, { marginTop: spacing.sm }]}>
                    Deliverables:
                  </Text>
                  {selectedApplication.contractDetails.deliverables.map((deliverable, index) => (
                    <Text key={index} variant="bodySmall" style={styles.deliverable}>
                      • {deliverable}
                    </Text>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Feedback */}
            {selectedApplication.feedback && (
              <Card style={styles.detailsCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Brand Feedback
                  </Text>
                  <Text variant="bodyMedium" style={styles.feedbackText}>
                    {selectedApplication.feedback}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'approved', label: 'Approved' },
    { key: 'in_progress', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Not Selected' },
  ];

  const filteredApplications = getFilteredApplications();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          My Applications
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your campaign application status
        </Text>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScrollView}
      >
        {filters.map((filterItem) => (
          <Chip
            key={filterItem.key}
            mode={filter === filterItem.key ? 'flat' : 'outlined'}
            selected={filter === filterItem.key}
            onPress={() => setFilter(filterItem.key)}
            style={styles.filterChip}
          >
            {filterItem.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Applications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContent}>
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading applications...
            </Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="inbox-outline" size={64} color={colors.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No applications found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              {filter === 'all' 
                ? "You haven't applied to any campaigns yet" 
                : `No applications with status: ${filters.find(f => f.key === filter)?.label}`}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Campaigns' as never)}
              style={styles.browseButton}
            >
              Browse Campaigns
            </Button>
          </View>
        ) : (
          filteredApplications.map(renderApplicationCard)
        )}
      </ScrollView>

      {renderApplicationDetails()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  filtersScrollView: {
    marginBottom: spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  applicationCard: {
    marginBottom: spacing.md,
    ...shadow.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  brandInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  campaignTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  brandName: {
    color: colors.textSecondary,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  applicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressText: {
    color: colors.textSecondary,
  },
  nextActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '10',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  nextActionText: {
    color: colors.info,
    marginLeft: spacing.xs,
    flex: 1,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  deadlineText: {
    color: colors.warning,
    marginLeft: spacing.xs,
    flex: 1,
  },
  cardActions: {
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  browseButton: {
    marginTop: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.background,
    margin: spacing.md,
    borderRadius: radius.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineCompleted: {
    backgroundColor: colors.success,
  },
  timelinePending: {
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timelineDescription: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timelineDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  contractDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contractLabel: {
    color: colors.textSecondary,
  },
  contractValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  deliverable: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
});