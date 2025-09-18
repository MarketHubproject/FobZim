import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'zimbuzz_app_state';
const DATA_VERSION = '1.0.0';
const VERSION_KEY = 'zimbuzz_data_version';

export interface PersistedState {
  profile: any;
  preferences: any;
  savedCampaignIds: string[];
  savedTrendIds: string[];
  appliedCampaignIds: string[];
  savedTips: string[];
  searchHistory: string[];
  showOnboardingTip: boolean;
}

export interface VersionedPersistedState {
  version: string;
  timestamp: number;
  data: PersistedState;
  metadata?: {
    deviceInfo?: string;
    appVersion?: string;
    migrationHistory?: string[];
  };
}

export interface PersistenceSettings {
  persistProfile: boolean;
  persistPreferences: boolean;
  persistSavedItems: boolean;
  persistSearchHistory: boolean;
  persistUIState: boolean;
  encryptSensitiveData: boolean;
  autoCleanup: boolean;
  maxSearchHistoryItems: number;
  dataRetentionDays: number;
}

class PersistenceManager {
  private isWeb = Platform.OS === 'web';
  private settings: PersistenceSettings = {
    persistProfile: true,
    persistPreferences: true,
    persistSavedItems: true,
    persistSearchHistory: true,
    persistUIState: true,
    encryptSensitiveData: false,
    autoCleanup: true,
    maxSearchHistoryItems: 50,
    dataRetentionDays: 90,
  };

  async saveState(state: Partial<PersistedState>): Promise<boolean> {
    try {
      const filteredState = this.filterStateBySettings(state);
      
      const versionedState: VersionedPersistedState = {
        version: DATA_VERSION,
        timestamp: Date.now(),
        data: filteredState,
        metadata: {
          deviceInfo: this.isWeb ? 'web' : 'mobile',
          appVersion: DATA_VERSION,
          migrationHistory: [],
        },
      };
      
      const stateToSave = JSON.stringify(versionedState);
      
      if (this.isWeb) {
        // For web, use localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, stateToSave);
          window.localStorage.setItem(VERSION_KEY, DATA_VERSION);
          return true;
        }
        return false;
      } else {
        // For React Native, use AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEY, stateToSave);
        await AsyncStorage.setItem(VERSION_KEY, DATA_VERSION);
        return true;
      }
    } catch (error) {
      console.warn('Failed to save state:', error);
      return false;
    }
  }

  async loadState(): Promise<Partial<PersistedState> | null> {
    try {
      let storedState: string | null = null;
      let storedVersion: string | null = null;
      
      if (this.isWeb) {
        // For web, use localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          storedState = window.localStorage.getItem(STORAGE_KEY);
          storedVersion = window.localStorage.getItem(VERSION_KEY);
        }
      } else {
        // For React Native, use AsyncStorage
        storedState = await AsyncStorage.getItem(STORAGE_KEY);
        storedVersion = await AsyncStorage.getItem(VERSION_KEY);
      }
      
      if (storedState) {
        let parsedData: any;
        
        try {
          parsedData = JSON.parse(storedState);
        } catch (parseError) {
          console.warn('Failed to parse stored state:', parseError);
          return null;
        }
        
        // Check if we have versioned data
        if (parsedData.version && parsedData.data) {
          const versionedData = parsedData as VersionedPersistedState;
          
          // Perform migration if needed
          const migratedData = await this.migrateData(versionedData);
          return migratedData.data;
        } else {
          // Legacy data format - migrate it
          console.log('Migrating legacy data format');
          const legacyData = parsedData as Partial<PersistedState>;
          return legacyData;
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to load state:', error);
      return null;
    }
  }

  async clearState(): Promise<boolean> {
    try {
      if (this.isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem(VERSION_KEY);
          return true;
        }
        return false;
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem(VERSION_KEY);
        return true;
      }
    } catch (error) {
      console.warn('Failed to clear state:', error);
      return false;
    }
  }

  // Filter state based on persistence settings
  private filterStateBySettings(state: Partial<PersistedState>): Partial<PersistedState> {
    const filtered: Partial<PersistedState> = {};
    
    if (this.settings.persistProfile && state.profile) {
      filtered.profile = state.profile;
    }
    
    if (this.settings.persistPreferences && state.preferences) {
      filtered.preferences = state.preferences;
    }
    
    if (this.settings.persistSavedItems) {
      if (state.savedCampaignIds) filtered.savedCampaignIds = state.savedCampaignIds;
      if (state.savedTrendIds) filtered.savedTrendIds = state.savedTrendIds;
      if (state.appliedCampaignIds) filtered.appliedCampaignIds = state.appliedCampaignIds;
      if (state.savedTips) filtered.savedTips = state.savedTips;
    }
    
    if (this.settings.persistSearchHistory && state.searchHistory) {
      // Limit search history based on settings
      filtered.searchHistory = state.searchHistory.slice(0, this.settings.maxSearchHistoryItems);
    }
    
    if (this.settings.persistUIState && state.showOnboardingTip !== undefined) {
      filtered.showOnboardingTip = state.showOnboardingTip;
    }
    
    return filtered;
  }

  // Data migration logic
  private async migrateData(versionedData: VersionedPersistedState): Promise<VersionedPersistedState> {
    const currentVersion = versionedData.version;
    let migratedData = { ...versionedData };
    const migrationHistory = versionedData.metadata?.migrationHistory || [];
    
    // Add migration logic here for future versions
    if (currentVersion !== DATA_VERSION) {
      console.log(`Migrating data from ${currentVersion} to ${DATA_VERSION}`);
      
      // Example migration logic (placeholder for future use)
      switch (currentVersion) {
        case '0.9.0':
          // Migration logic for version 0.9.0 to current
          migrationHistory.push(`Migrated from ${currentVersion} to ${DATA_VERSION}`);
          break;
        default:
          console.log('No migration needed or unknown version');
      }
      
      migratedData.version = DATA_VERSION;
      migratedData.metadata = {
        ...migratedData.metadata,
        migrationHistory,
      };
    }
    
    return migratedData;
  }

  // Settings management
  async updateSettings(newSettings: Partial<PersistenceSettings>): Promise<boolean> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      
      // Save settings to storage
      const settingsKey = 'zimbuzz_persistence_settings';
      const settingsData = JSON.stringify(this.settings);
      
      if (this.isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(settingsKey, settingsData);
        }
      } else {
        await AsyncStorage.setItem(settingsKey, settingsData);
      }
      
      return true;
    } catch (error) {
      console.warn('Failed to update settings:', error);
      return false;
    }
  }

  async loadSettings(): Promise<PersistenceSettings> {
    try {
      const settingsKey = 'zimbuzz_persistence_settings';
      let settingsData: string | null = null;
      
      if (this.isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          settingsData = window.localStorage.getItem(settingsKey);
        }
      } else {
        settingsData = await AsyncStorage.getItem(settingsKey);
      }
      
      if (settingsData) {
        const loadedSettings = JSON.parse(settingsData) as PersistenceSettings;
        this.settings = { ...this.settings, ...loadedSettings };
      }
      
      return this.settings;
    } catch (error) {
      console.warn('Failed to load settings:', error);
      return this.settings;
    }
  }

  getSettings(): PersistenceSettings {
    return { ...this.settings };
  }

  // Data export functionality
  async exportData(): Promise<string | null> {
    try {
      const currentState = await this.loadState();
      if (!currentState) {
        return null;
      }

      const exportData: VersionedPersistedState = {
        version: DATA_VERSION,
        timestamp: Date.now(),
        data: currentState,
        metadata: {
          deviceInfo: this.isWeb ? 'web' : 'mobile',
          appVersion: DATA_VERSION,
          migrationHistory: [],
          exportDate: new Date().toISOString(),
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.warn('Failed to export data:', error);
      return null;
    }
  }

  // Data import functionality
  async importData(jsonData: string): Promise<{ success: boolean; error?: string }> {
    try {
      let importedData: any;
      
      try {
        importedData = JSON.parse(jsonData);
      } catch (parseError) {
        return { success: false, error: 'Invalid JSON format' };
      }

      // Validate the imported data structure
      if (!this.validateImportData(importedData)) {
        return { success: false, error: 'Invalid data structure' };
      }

      let dataToImport: Partial<PersistedState>;
      
      // Handle versioned data
      if (importedData.version && importedData.data) {
        const versionedData = importedData as VersionedPersistedState;
        const migratedData = await this.migrateData(versionedData);
        dataToImport = migratedData.data;
      } else {
        // Legacy format
        dataToImport = importedData as Partial<PersistedState>;
      }

      // Save the imported data
      const saveSuccess = await this.saveState(dataToImport);
      
      if (!saveSuccess) {
        return { success: false, error: 'Failed to save imported data' };
      }

      return { success: true };
    } catch (error) {
      console.warn('Failed to import data:', error);
      return { success: false, error: 'Import failed: ' + (error as Error).message };
    }
  }

  // Validate imported data structure
  private validateImportData(data: any): boolean {
    if (!data) return false;
    
    // Check if it's versioned data
    if (data.version && data.data) {
      const versionedData = data as VersionedPersistedState;
      return this.validatePersistedState(versionedData.data);
    }
    
    // Check if it's direct persisted state
    return this.validatePersistedState(data);
  }

  private validatePersistedState(data: any): boolean {
    if (typeof data !== 'object' || data === null) return false;
    
    // Check for expected properties (at least one should exist)
    const expectedProps = [
      'profile', 'preferences', 'savedCampaignIds', 'savedTrendIds',
      'appliedCampaignIds', 'savedTips', 'searchHistory', 'showOnboardingTip'
    ];
    
    return expectedProps.some(prop => data.hasOwnProperty(prop));
  }

  // Get data statistics for display
  async getDataStats(): Promise<{
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
  } | null> {
    try {
      const state = await this.loadState();
      if (!state) return null;

      const dataString = JSON.stringify(state);
      const totalSize = new Blob([dataString]).size;

      return {
        totalSize,
        itemCounts: {
          savedTips: state.savedTips?.length || 0,
          savedCampaigns: state.savedCampaignIds?.length || 0,
          savedTrends: state.savedTrendIds?.length || 0,
          appliedCampaigns: state.appliedCampaignIds?.length || 0,
          searchHistoryItems: state.searchHistory?.length || 0,
        },
        lastModified: Date.now(),
        dataVersion: DATA_VERSION,
      };
    } catch (error) {
      console.warn('Failed to get data stats:', error);
      return null;
    }
  }
}

export const persistenceManager = new PersistenceManager();