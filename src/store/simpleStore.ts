import { create } from 'zustand';
import { Niche, UserProfile, AppPreferences } from '../data/types';
import { persistenceManager, PersistedState, PersistenceSettings } from '../utils/persistence';
import { analyticsManager } from '../utils/analytics';

// Debounced auto-save functionality
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DELAY = 1000; // 1 second delay after last change

interface AppState {
  // User profile
  profile: UserProfile;
  
  // App preferences
  preferences: AppPreferences;
  
  // Saved items
  savedCampaignIds: string[];
  savedTrendIds: string[];
  appliedCampaignIds: string[];
  savedTips: string[];
  
  // Search state
  searchQuery: string;
  searchHistory: string[];
  
  // UI state
  isHydrated: boolean;
  showOnboardingTip: boolean;
  
  // Persistence state
  autoSaveEnabled: boolean;
}

interface AppActions {
  // Profile actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  // Preferences actions
  setSelectedNiches: (niches: Niche[]) => void;
  toggleSpotlightOnly: () => void;
  toggleNotifications: () => void;
  
  // Saved items actions
  toggleSaveCampaign: (campaignId: string) => void;
  toggleSaveTrend: (trendId: string) => void;
  markCampaignApplied: (campaignId: string) => void;
  saveTip: (tip: string) => void;
  removeSavedTip: (tip: string) => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // UI actions
  dismissOnboardingTip: () => void;
  
  // Persistence actions
  saveToStorage: () => Promise<boolean>;
  loadFromStorage: () => Promise<void>;
  clearStorage: () => Promise<boolean>;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  exportData: () => Promise<string | null>;
  importData: (jsonData: string) => Promise<{ success: boolean; error?: string }>;
  updatePersistenceSettings: (settings: Partial<PersistenceSettings>) => Promise<boolean>;
  getPersistenceSettings: () => Promise<PersistenceSettings>;
  
  // Analytics actions
  trackAction: (actionName: string, metadata?: Record<string, any>) => void;
  trackScreenVisit: (screenName: string) => void;
  getEngagementInsights: () => Promise<any>;
  
  // Utility actions
  clearAllData: () => void;
  setHydrated: (hydrated: boolean) => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  profile: {
    name: '',
    bio: '',
    nicheInterests: [],
  },
  preferences: {
    selectedNiches: [],
    showOnlySpotlight: false,
    notificationsEnabled: true,
  },
  savedCampaignIds: [],
  savedTrendIds: [],
  appliedCampaignIds: [],
  savedTips: [],
  searchQuery: '',
  searchHistory: [],
  isHydrated: true,
  showOnboardingTip: true,
  autoSaveEnabled: false, // Start disabled for safety
};

// Helper function to trigger auto-save
const triggerAutoSave = (getState: () => AppStore) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    const state = getState();
    if (state.autoSaveEnabled && state.isHydrated) {
      try {
        const persistableState: Partial<PersistedState> = {
          profile: state.profile,
          preferences: state.preferences,
          savedCampaignIds: state.savedCampaignIds,
          savedTrendIds: state.savedTrendIds,
          appliedCampaignIds: state.appliedCampaignIds,
          savedTips: state.savedTips,
          searchHistory: state.searchHistory,
          showOnboardingTip: state.showOnboardingTip,
        };
        await persistenceManager.saveState(persistableState);
        console.log('Auto-saved state to storage');
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }, SAVE_DELAY);
};

export const useAppStore = create<AppStore>()((set, get) => ({
  ...initialState,
  
  // Profile actions
  updateProfile: (profileUpdate) => {
    set((state) => ({
      profile: { ...state.profile, ...profileUpdate },
    }));
    triggerAutoSave(get);
  },
  
  // Preferences actions
  setSelectedNiches: (niches) => {
    set((state) => ({
      preferences: { ...state.preferences, selectedNiches: niches },
    }));
    triggerAutoSave(get);
  },
  
  toggleSpotlightOnly: () => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        showOnlySpotlight: !state.preferences.showOnlySpotlight,
      },
    }));
    triggerAutoSave(get);
  },
  
  toggleNotifications: () => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        notificationsEnabled: !state.preferences.notificationsEnabled,
      },
    }));
    triggerAutoSave(get);
  },
  
  // Saved items actions
  toggleSaveCampaign: (campaignId) => {
    set((state) => {
      const isCurrentlySaved = state.savedCampaignIds.includes(campaignId);
      const action = isCurrentlySaved ? 'campaign_unsaved' : 'campaign_saved';
      // Track analytics
      analyticsManager.trackAction(action, { campaignId });
      return {
        savedCampaignIds: isCurrentlySaved
          ? state.savedCampaignIds.filter((id) => id !== campaignId)
          : [...state.savedCampaignIds, campaignId],
      };
    });
    triggerAutoSave(get);
  },
  
  toggleSaveTrend: (trendId) => {
    set((state) => {
      const isCurrentlySaved = state.savedTrendIds.includes(trendId);
      return {
        savedTrendIds: isCurrentlySaved
          ? state.savedTrendIds.filter((id) => id !== trendId)
          : [...state.savedTrendIds, trendId],
      };
    });
    triggerAutoSave(get);
  },
  
  markCampaignApplied: (campaignId) => {
    set((state) => ({
      appliedCampaignIds: state.appliedCampaignIds.includes(campaignId)
        ? state.appliedCampaignIds
        : [...state.appliedCampaignIds, campaignId],
    }));
    // Track analytics
    analyticsManager.trackAction('campaign_applied', { campaignId });
    triggerAutoSave(get);
  },

  saveTip: (tip) => {
    set((state) => ({
      savedTips: state.savedTips.includes(tip)
        ? state.savedTips
        : [...state.savedTips, tip],
    }));
    // Track analytics
    analyticsManager.trackAction('tip_saved', { tip });
    triggerAutoSave(get);
  },

  removeSavedTip: (tip) => {
    set((state) => ({
      savedTips: state.savedTips.filter((t) => t !== tip),
    }));
    // Track analytics
    analyticsManager.trackAction('tip_removed', { tip });
    triggerAutoSave(get);
  },

  // Search actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  addToSearchHistory: (query) => {
    set((state) => ({
      searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 10),
    }));
    // Track analytics
    analyticsManager.trackAction('search_performed', { query });
    triggerAutoSave(get);
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    triggerAutoSave(get);
  },

  // UI actions
  dismissOnboardingTip: () => {
    set({ showOnboardingTip: false });
    triggerAutoSave(get);
  },
  
  // Utility actions
  clearAllData: () => {
    set(() => ({
      ...initialState,
      isHydrated: true,
    }));
  },
  
  setHydrated: (hydrated) => {
    set({ isHydrated: hydrated });
  },

  // Persistence actions
  saveToStorage: async () => {
    const state = get();
    const persistableState: Partial<PersistedState> = {
      profile: state.profile,
      preferences: state.preferences,
      savedCampaignIds: state.savedCampaignIds,
      savedTrendIds: state.savedTrendIds,
      appliedCampaignIds: state.appliedCampaignIds,
      savedTips: state.savedTips,
      searchHistory: state.searchHistory,
      showOnboardingTip: state.showOnboardingTip,
    };
    return await persistenceManager.saveState(persistableState);
  },

  loadFromStorage: async () => {
    try {
      const persistedState = await persistenceManager.loadState();
      if (persistedState) {
        set((currentState) => ({
          ...currentState,
          ...persistedState,
          isHydrated: true,
        }));
      } else {
        set((currentState) => ({ ...currentState, isHydrated: true }));
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
      set((currentState) => ({ ...currentState, isHydrated: true }));
    }
  },

  clearStorage: async () => {
    return await persistenceManager.clearState();
  },

  enableAutoSave: () => {
    set({ autoSaveEnabled: true });
    console.log('Auto-save enabled');
  },

  disableAutoSave: () => {
    set({ autoSaveEnabled: false });
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    console.log('Auto-save disabled');
  },

  // Data export/import
  exportData: async () => {
    try {
      return await persistenceManager.exportData();
    } catch (error) {
      console.warn('Export failed:', error);
      return null;
    }
  },

  importData: async (jsonData) => {
    try {
      const result = await persistenceManager.importData(jsonData);
      if (result.success) {
        // Reload the store with imported data
        const actions = get();
        await actions.loadFromStorage();
      }
      return result;
    } catch (error) {
      console.warn('Import failed:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Persistence settings management
  updatePersistenceSettings: async (settings) => {
    try {
      return await persistenceManager.updateSettings(settings);
    } catch (error) {
      console.warn('Failed to update persistence settings:', error);
      return false;
    }
  },

  getPersistenceSettings: async () => {
    try {
      return await persistenceManager.loadSettings();
    } catch (error) {
      console.warn('Failed to get persistence settings:', error);
      return persistenceManager.getSettings();
    }
  },

  // Analytics integration
  trackAction: (actionName, metadata) => {
    analyticsManager.trackAction(actionName, metadata);
  },

  trackScreenVisit: (screenName) => {
    analyticsManager.trackScreenVisit(screenName);
  },

  getEngagementInsights: async () => {
    try {
      return await analyticsManager.getEngagementInsights();
    } catch (error) {
      console.warn('Failed to get engagement insights:', error);
      return null;
    }
  },
}));
