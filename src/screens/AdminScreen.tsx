import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, Divider, ProgressBar, List, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DataMigrationService from '../services/dataMigration';
import { useAuth } from '../contexts/AuthContext';

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  white: '#FFFFFF',
};

interface MigrationStatus {
  creators: boolean;
  campaigns: boolean;
  tips: boolean;
  overall: boolean;
}

export default function AdminScreen() {
  const { userProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    creators: false,
    campaigns: false,
    tips: false,
    overall: false
  });
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const migrationService = DataMigrationService.getInstance();

  useEffect(() => {
    // Check if user has admin privileges (in a real app, you'd check roles)
    if (userProfile && !userProfile.email.includes('admin') && !userProfile.email.includes('demo')) {
      Alert.alert('Access Denied', 'This screen is for administrators only.');
    }
  }, [userProfile]);

  const addToLog = (message: string) => {
    setMigrationLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullMigration = async () => {
    setLoading(true);
    setProgress(0);
    setMigrationLog([]);
    setMigrationStatus({
      creators: false,
      campaigns: false,
      tips: false,
      overall: false
    });

    try {
      addToLog('🚀 Starting full data migration...');
      
      // Migrate creators
      setProgress(0.2);
      addToLog('📝 Migrating creators data...');
      await migrationService.migrateCreators();
      setMigrationStatus(prev => ({ ...prev, creators: true }));
      addToLog('✅ Creators migration completed');
      
      // Migrate campaigns
      setProgress(0.5);
      addToLog('🎯 Migrating campaigns data...');
      await migrationService.migrateCampaigns();
      setMigrationStatus(prev => ({ ...prev, campaigns: true }));
      addToLog('✅ Campaigns migration completed');
      
      // Migrate tips
      setProgress(0.8);
      addToLog('💡 Migrating tips data...');
      await migrationService.migrateTips();
      setMigrationStatus(prev => ({ ...prev, tips: true }));
      addToLog('✅ Tips migration completed');
      
      setProgress(1);
      setMigrationStatus(prev => ({ ...prev, overall: true }));
      addToLog('🎉 Full migration completed successfully!');
      
      Alert.alert(
        'Migration Successful! 🎉',
        'All data has been migrated to the database. The app now has real content from Zimbabwean creators and brands!',
        [{ text: 'Great!', style: 'default' }]
      );
      
    } catch (error: any) {
      addToLog(`❌ Migration failed: ${error.message}`);
      Alert.alert('Migration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const migrateCreators = async () => {
    setLoading(true);
    try {
      addToLog('📝 Migrating creators only...');
      await migrationService.migrateCreators();
      setMigrationStatus(prev => ({ ...prev, creators: true }));
      addToLog('✅ Creators migration completed');
      Alert.alert('Success', 'Creators data migrated successfully!');
    } catch (error: any) {
      addToLog(`❌ Creators migration failed: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const migrateCampaigns = async () => {
    setLoading(true);
    try {
      addToLog('🎯 Migrating campaigns only...');
      await migrationService.migrateCampaigns();
      setMigrationStatus(prev => ({ ...prev, campaigns: true }));
      addToLog('✅ Campaigns migration completed');
      Alert.alert('Success', 'Campaigns data migrated successfully!');
    } catch (error: any) {
      addToLog(`❌ Campaigns migration failed: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const migrateTips = async () => {
    setLoading(true);
    try {
      addToLog('💡 Migrating tips only...');
      await migrationService.migrateTips();
      setMigrationStatus(prev => ({ ...prev, tips: true }));
      addToLog('✅ Tips migration completed');
      Alert.alert('Success', 'Tips data migrated successfully!');
    } catch (error: any) {
      addToLog(`❌ Tips migration failed: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLog = () => {
    setMigrationLog([]);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-crown" size={48} color={colors.primary} />
        <Text style={styles.title}>ZimBuzz Admin Panel</Text>
        <Text style={styles.subtitle}>Database Management & Migration</Text>
      </View>

      {/* User Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Current User</Text>
          <Text style={styles.userInfo}>
            {userProfile?.displayName} ({userProfile?.email})
          </Text>
          <Text style={styles.userRole}>
            Role: {userProfile?.isCreator ? 'Creator' : 'User'}
            {userProfile?.isVerified && ' • Verified'}
          </Text>
          <Button 
            mode="outlined" 
            onPress={handleSignOut} 
            style={styles.signOutButton}
            icon="logout"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      {/* Migration Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Migration Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Creators:</Text>
            <Badge 
              style={[styles.badge, migrationStatus.creators ? styles.successBadge : styles.warningBadge]}
            >
              {migrationStatus.creators ? 'Completed' : 'Pending'}
            </Badge>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Campaigns:</Text>
            <Badge 
              style={[styles.badge, migrationStatus.campaigns ? styles.successBadge : styles.warningBadge]}
            >
              {migrationStatus.campaigns ? 'Completed' : 'Pending'}
            </Badge>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Tips:</Text>
            <Badge 
              style={[styles.badge, migrationStatus.tips ? styles.successBadge : styles.warningBadge]}
            >
              {migrationStatus.tips ? 'Completed' : 'Pending'}
            </Badge>
          </View>

          {loading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Migration in progress...</Text>
              <ProgressBar 
                progress={progress} 
                color={colors.primary} 
                style={styles.progressBar}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Migration Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Data Migration Actions</Text>
          <Text style={styles.cardSubtitle}>
            Populate the database with realistic Zimbabwean content
          </Text>

          <Button
            mode="contained"
            onPress={runFullMigration}
            disabled={loading}
            loading={loading}
            style={[styles.button, styles.primaryButton]}
            icon="database-plus"
          >
            Run Full Migration
          </Button>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Individual Migrations</Text>
          
          <Button
            mode="outlined"
            onPress={migrateCreators}
            disabled={loading}
            style={styles.button}
            icon="account-star"
          >
            Migrate Creators (5 profiles)
          </Button>

          <Button
            mode="outlined"
            onPress={migrateCampaigns}
            disabled={loading}
            style={styles.button}
            icon="briefcase"
          >
            Migrate Campaigns (3 campaigns)
          </Button>

          <Button
            mode="outlined"
            onPress={migrateTips}
            disabled={loading}
            style={styles.button}
            icon="lightbulb"
          >
            Migrate Tips (5 educational tips)
          </Button>
        </Card.Content>
      </Card>

      {/* Migration Log */}
      {migrationLog.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.logHeader}>
              <Text style={styles.cardTitle}>Migration Log</Text>
              <Button mode="text" onPress={clearLog} compact>
                Clear
              </Button>
            </View>
            
            <View style={styles.logContainer}>
              {migrationLog.map((logEntry, index) => (
                <Text key={index} style={styles.logEntry}>
                  {logEntry}
                </Text>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Database Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Database Schema</Text>
          
          <List.Section>
            <List.Item
              title="users"
              description="User accounts and profiles"
              left={() => <List.Icon icon="account" />}
              right={() => <Badge>Active</Badge>}
            />
            <List.Item
              title="creators"
              description="Creator profiles and stats"
              left={() => <List.Icon icon="account-star" />}
              right={() => <Badge>Ready</Badge>}
            />
            <List.Item
              title="campaigns"
              description="Brand campaigns and opportunities"
              left={() => <List.Icon icon="briefcase" />}
              right={() => <Badge>Ready</Badge>}
            />
            <List.Item
              title="tips"
              description="Educational content and tips"
              left={() => <List.Icon icon="lightbulb" />}
              right={() => <Badge>Ready</Badge>}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ZimBuzz Admin Panel • Built for Zimbabwe's Creator Economy
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  userInfo: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  signOutButton: {
    alignSelf: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.warning,
  },
  successBadge: {
    backgroundColor: colors.success,
  },
  warningBadge: {
    backgroundColor: colors.warning,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});