import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Niche, UserProfile, AppPreferences } from '../data/types';

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
  isHydrated: false,
  showOnboardingTip: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Profile actions
      updateProfile: (profileUpdate) => {
        set((state) => ({
          profile: { ...state.profile, ...profileUpdate },
        }));
      },
      
      // Preferences actions
      setSelectedNiches: (niches) => {
        set((state) => ({
          preferences: { ...state.preferences, selectedNiches: niches },
        }));
      },
      
      toggleSpotlightOnly: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            showOnlySpotlight: !state.preferences.showOnlySpotlight,
          },
        }));
      },
      
      toggleNotifications: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            notificationsEnabled: !state.preferences.notificationsEnabled,
          },
        }));
      },
      
      // Saved items actions
      toggleSaveCampaign: (campaignId) => {
        set((state) => {
          const isCurrentlySaved = state.savedCampaignIds.includes(campaignId);
          return {
            savedCampaignIds: isCurrentlySaved
              ? state.savedCampaignIds.filter((id) => id !== campaignId)
              : [...state.savedCampaignIds, campaignId],
          };
        });
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
      },
      
      markCampaignApplied: (campaignId) => {
        set((state) => ({
          appliedCampaignIds: state.appliedCampaignIds.includes(campaignId)
            ? state.appliedCampaignIds
            : [...state.appliedCampaignIds, campaignId],
        }));
      },

      saveTip: (tip) => {
        set((state) => ({
          savedTips: state.savedTips.includes(tip)
            ? state.savedTips
            : [...state.savedTips, tip],
        }));
      },

      removeSavedTip: (tip) => {
        set((state) => ({
          savedTips: state.savedTips.filter((t) => t !== tip),
        }));
      },

      // Search actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      addToSearchHistory: (query) => {
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 10),
        }));
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // UI actions
      dismissOnboardingTip: () => {
        set({ showOnboardingTip: false });
      },
      
      // Utility actions
      clearAllData: () => {
        set(() => ({
          ...initialState,
          isHydrated: true, // Keep hydrated state
        }));
      },
      
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'fobzim-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('FobZim store rehydrated');
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        savedCampaignIds: state.savedCampaignIds,
        savedTrendIds: state.savedTrendIds,
        appliedCampaignIds: state.appliedCampaignIds,
        savedTips: state.savedTips,
        searchHistory: state.searchHistory,
        showOnboardingTip: state.showOnboardingTip,
      }),
    }
  )
);

// Selectors for commonly used derived state
export const useProfile = () => useAppStore((state) => state.profile);
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useSavedCampaigns = () => useAppStore((state) => state.savedCampaignIds);
export const useSavedTrends = () => useAppStore((state) => state.savedTrendIds);
export const useAppliedCampaigns = () => useAppStore((state) => state.appliedCampaignIds);
export const useIsHydrated = () => useAppStore((state) => state.isHydrated);