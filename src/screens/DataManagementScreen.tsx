import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Card, Button, Switch, List, Divider, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { colors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/tokens';
import { useAppStore } from '../store/simpleStore';
import { persistenceManager } from '../utils/persistence';
import { analyticsManager } from '../utils/analytics';
import { encryptionManager } from '../utils/encryption';

interface DataStats {
  totalSize: number;
  itemCounts: {
    savedTips: number;
    savedCampaigns: number;
    savedTrends: number;
    appliedCampaigns: number;
    searchHistoryItems: number;
  };
  lastModified: number | null;
  dataVersion: string;
}

export default function DataManagementScreen() {
  const {
    autoSaveEnabled,
    enableAutoSave,
    disableAutoSave,
    saveToStorage,
    clearAllData,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [persistenceSettings, setPersistenceSettings] = useState<any>(null);
  const [analyticsInsights, setAnalyticsInsights] = useState<any>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load data statistics
      const stats = await persistenceManager.getDataStats();
      setDataStats(stats);

      // Load persistence settings
      const settings = await persistenceManager.loadSettings();
      setPersistenceSettings(settings);

      // Load analytics insights
      const insights = await analyticsManager.getEngagementInsights();
      setAnalyticsInsights(insights);

      // Get encryption status
      const encStatus = encryptionManager.getStatus();
      setEncryptionStatus(encStatus);
    } catch (error) {
      setErrorMessage('Failed to load data management information');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  // Data export functionality
  const handleExportData = async () => {
    setLoading(true);
    try {
      const exportData = await persistenceManager.exportData();
      if (!exportData) {
        showError('No data to export');
        return;
      }

      const fileName = `zimbuzz_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      if (Platform.OS === 'web') {
        // Web download
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Mobile sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, exportData);
        await Sharing.shareAsync(fileUri);
      }
      
      showSuccess('✅ Data exported successfully!');
    } catch (error) {
      showError('❌ Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Data import functionality
  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setLoading(true);
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        const importResult = await persistenceManager.importData(fileContent);
        
        if (importResult.success) {
          showSuccess('✅ Data imported successfully!');
          await loadAllData(); // Refresh data
        } else {
          showError(`❌ Import failed: ${importResult.error}`);
        }
      }
    } catch (error) {
      showError('❌ Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  // Clear all data with confirmation
  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your saved data, including tips, campaigns, preferences, and analytics. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              clearAllData();
              await persistenceManager.clearState();
              await analyticsManager.clearAnalytics();
              showSuccess('🗑️ All data cleared successfully!');
              await loadAllData();
            } catch (error) {
              showError('❌ Failed to clear data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Update persistence settings
  const updatePersistenceSetting = async (key: string, value: any) => {
    try {
      const newSettings = { ...persistenceSettings, [key]: value };
      await persistenceManager.updateSettings(newSettings);
      setPersistenceSettings(newSettings);
      showSuccess('⚙️ Settings updated!');
    } catch (error) {
      showError('❌ Failed to update settings');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="database-cog" size={32} color={colors.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          Data Management
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage your app data, settings, and privacy
        </Text>
      </View>

      {/* Success/Error Messages */}
      {successMessage ? (
        <Card style={styles.successCard}>
          <Text style={styles.successText}>{successMessage}</Text>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </Card>
      ) : null}

      {loading && <ProgressBar indeterminate color={colors.primary} style={styles.progressBar} />}

      {/* Data Overview */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="chart-pie" size={24} color={colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>Data Overview</Text>
        </View>
        
        {dataStats ? (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Storage:</Text>
              <Text style={styles.statValue}>{formatBytes(dataStats.totalSize)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Saved Tips:</Text>
              <Text style={styles.statValue}>{dataStats.itemCounts.savedTips}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Saved Campaigns:</Text>
              <Text style={styles.statValue}>{dataStats.itemCounts.savedCampaigns}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Applied Campaigns:</Text>
              <Text style={styles.statValue}>{dataStats.itemCounts.appliedCampaigns}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Search History:</Text>
              <Text style={styles.statValue}>{dataStats.itemCounts.searchHistoryItems}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Data Version:</Text>
              <Text style={styles.statValue}>{dataStats.dataVersion}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No data statistics available</Text>
        )}
      </Card>

      {/* Auto-Save Settings */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="content-save-cog" size={24} color={colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>Auto-Save Settings</Text>
        </View>
        
        <List.Item
          title="Enable Auto-Save"
          description="Automatically save data when changes occur"
          left={(props) => <MaterialCommunityIcons {...props} name="auto-upload" size={24} />}
          right={() => (
            <Switch
              value={autoSaveEnabled}
              onValueChange={(value) => {
                if (value) {
                  enableAutoSave();
                  showSuccess('▶️ Auto-save enabled');
                } else {
                  disableAutoSave();
                  showSuccess('⏸️ Auto-save disabled');
                }
              }}
            />
          )}
        />
      </Card>

      {/* Persistence Settings */}
      {persistenceSettings && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="cog" size={24} color={colors.primary} />
            <Text variant="titleLarge" style={styles.cardTitle}>Storage Settings</Text>
          </View>
          
          <List.Item
            title="Save Profile Data"
            description="Store user profile information"
            right={() => (
              <Switch
                value={persistenceSettings.persistProfile}
                onValueChange={(value) => updatePersistenceSetting('persistProfile', value)}
              />
            )}
          />
          <List.Item
            title="Save Preferences"
            description="Store app preferences and settings"
            right={() => (
              <Switch
                value={persistenceSettings.persistPreferences}
                onValueChange={(value) => updatePersistenceSetting('persistPreferences', value)}
              />
            )}
          />
          <List.Item
            title="Save Bookmarks"
            description="Store saved tips and campaigns"
            right={() => (
              <Switch
                value={persistenceSettings.persistSavedItems}
                onValueChange={(value) => updatePersistenceSetting('persistSavedItems', value)}
              />
            )}
          />
          <List.Item
            title="Save Search History"
            description="Store recent searches"
            right={() => (
              <Switch
                value={persistenceSettings.persistSearchHistory}
                onValueChange={(value) => updatePersistenceSetting('persistSearchHistory', value)}
              />
            )}
          />
        </Card>
      )}

      {/* Data Import/Export */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="import" size={24} color={colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>Backup & Restore</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleExportData}
            style={styles.actionButton}
            icon="export"
            disabled={loading}
          >
            Export Data
          </Button>
          <Button
            mode="outlined"
            onPress={handleImportData}
            style={styles.actionButton}
            icon="import"
            disabled={loading}
          >
            Import Data
          </Button>
        </View>
        
        <Text style={styles.helpText}>
          Export your data as a JSON file for backup or transfer to another device. 
          Import data from a previously exported file.
        </Text>
      </Card>

      {/* Analytics Insights */}
      {analyticsInsights && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
            <Text variant="titleLarge" style={styles.cardTitle}>Usage Insights</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Time in App:</Text>
              <Text style={styles.statValue}>{analyticsInsights.totalTime}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Engagement Score:</Text>
              <Text style={styles.statValue}>{analyticsInsights.engagementScore}/100</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Most Used Feature:</Text>
              <Text style={styles.statValue}>{analyticsInsights.mostUsedFeature}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Favorite Screen:</Text>
              <Text style={styles.statValue}>{analyticsInsights.favoriteScreen}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tip Save Rate:</Text>
              <Text style={styles.statValue}>{analyticsInsights.tipSaveRate}%</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Security Info */}
      {encryptionStatus && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.success} />
            <Text variant="titleLarge" style={styles.cardTitle}>Security Status</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Encryption:</Text>
              <Text style={[styles.statValue, { color: encryptionStatus.available ? colors.success : colors.error }]}>
                {encryptionStatus.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Algorithm:</Text>
              <Text style={styles.statValue}>{encryptionStatus.algorithm}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Platform:</Text>
              <Text style={styles.statValue}>{encryptionStatus.platform}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Danger Zone */}
      <Card style={styles.dangerCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="alert" size={24} color={colors.error} />
          <Text variant="titleLarge" style={[styles.cardTitle, { color: colors.error }]}>
            Danger Zone
          </Text>
        </View>
        
        <Button
          mode="outlined"
          onPress={handleClearAllData}
          style={[styles.actionButton, { borderColor: colors.error }]}
          textColor={colors.error}
          icon="delete-forever"
          disabled={loading}
        >
          Clear All Data
        </Button>
        
        <Text style={[styles.helpText, { color: colors.error }]}>
          ⚠️ This action cannot be undone. All your data will be permanently deleted.
        </Text>
      </Card>

      <View style={styles.bottomSpacing} />
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
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  dangerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  statsContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  noDataText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 12,
    padding: spacing.md,
    paddingTop: 0,
    textAlign: 'center',
    lineHeight: 16,
  },
  successCard: {
    backgroundColor: colors.success + '15',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successText: {
    color: colors.success,
    padding: spacing.md,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: colors.error + '15',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    padding: spacing.md,
    fontWeight: '600',
  },
  progressBar: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});