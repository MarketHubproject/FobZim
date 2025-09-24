import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for our state
export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  isVerified: boolean;
  category: string;
  location: string;
  bio: string;
}

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  requirements: string[];
  applicants: number;
  image: string;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  likes: number;
  date: string;
}

interface AppState {
  followedCreators: Set<string>;
  savedCampaigns: Set<string>;
  appliedCampaigns: Set<string>;
  savedTips: Set<string>;
  isLoading: boolean;
  lastRefresh: {
    home: number;
    creators: number;
    campaigns: number;
  };
}

type AppAction =
  | { type: 'TOGGLE_FOLLOW_CREATOR'; creatorId: string }
  | { type: 'TOGGLE_SAVE_CAMPAIGN'; campaignId: string }
  | { type: 'APPLY_TO_CAMPAIGN'; campaignId: string }
  | { type: 'TOGGLE_SAVE_TIP'; tipId: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'UPDATE_REFRESH_TIME'; screen: keyof AppState['lastRefresh'] }
  | { type: 'LOAD_PERSISTED_STATE'; state: Partial<AppState> };

const initialState: AppState = {
  followedCreators: new Set(),
  savedCampaigns: new Set(),
  appliedCampaigns: new Set(),
  savedTips: new Set(),
  isLoading: false,
  lastRefresh: {
    home: 0,
    creators: 0,
    campaigns: 0,
  },
};

// Storage keys
const STORAGE_KEYS = {
  FOLLOWED_CREATORS: 'followedCreators',
  SAVED_CAMPAIGNS: 'savedCampaigns',
  APPLIED_CAMPAIGNS: 'appliedCampaigns',
  SAVED_TIPS: 'savedTips',
  LAST_REFRESH: 'lastRefresh',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_FOLLOW_CREATOR':
      const newFollowedCreators = new Set(state.followedCreators);
      if (newFollowedCreators.has(action.creatorId)) {
        newFollowedCreators.delete(action.creatorId);
      } else {
        newFollowedCreators.add(action.creatorId);
      }
      return { ...state, followedCreators: newFollowedCreators };

    case 'TOGGLE_SAVE_CAMPAIGN':
      const newSavedCampaigns = new Set(state.savedCampaigns);
      if (newSavedCampaigns.has(action.campaignId)) {
        newSavedCampaigns.delete(action.campaignId);
      } else {
        newSavedCampaigns.add(action.campaignId);
      }
      return { ...state, savedCampaigns: newSavedCampaigns };

    case 'APPLY_TO_CAMPAIGN':
      const newAppliedCampaigns = new Set(state.appliedCampaigns);
      newAppliedCampaigns.add(action.campaignId);
      return { ...state, appliedCampaigns: newAppliedCampaigns };

    case 'TOGGLE_SAVE_TIP':
      const newSavedTips = new Set(state.savedTips);
      if (newSavedTips.has(action.tipId)) {
        newSavedTips.delete(action.tipId);
      } else {
        newSavedTips.add(action.tipId);
      }
      return { ...state, savedTips: newSavedTips };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'UPDATE_REFRESH_TIME':
      return {
        ...state,
        lastRefresh: {
          ...state.lastRefresh,
          [action.screen]: Date.now(),
        },
      };

    case 'LOAD_PERSISTED_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper methods
  isCreatorFollowed: (creatorId: string) => boolean;
  isCampaignSaved: (campaignId: string) => boolean;
  isCampaignApplied: (campaignId: string) => boolean;
  isTipSaved: (tipId: string) => boolean;
  shouldRefresh: (screen: keyof AppState['lastRefresh'], intervalMinutes?: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    loadPersistedState();
  }, []);

  // Persist state changes
  useEffect(() => {
    persistState();
  }, [state.followedCreators, state.savedCampaigns, state.appliedCampaigns, state.savedTips, state.lastRefresh]);

  const loadPersistedState = async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      const [followedCreators, savedCampaigns, appliedCampaigns, savedTips, lastRefresh] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FOLLOWED_CREATORS),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAMPAIGNS),
        AsyncStorage.getItem(STORAGE_KEYS.APPLIED_CAMPAIGNS),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_TIPS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_REFRESH),
      ]);

      const persistedState: Partial<AppState> = {};

      if (followedCreators) {
        persistedState.followedCreators = new Set(JSON.parse(followedCreators));
      }
      if (savedCampaigns) {
        persistedState.savedCampaigns = new Set(JSON.parse(savedCampaigns));
      }
      if (appliedCampaigns) {
        persistedState.appliedCampaigns = new Set(JSON.parse(appliedCampaigns));
      }
      if (savedTips) {
        persistedState.savedTips = new Set(JSON.parse(savedTips));
      }
      if (lastRefresh) {
        persistedState.lastRefresh = JSON.parse(lastRefresh);
      }

      dispatch({ type: 'LOAD_PERSISTED_STATE', state: persistedState });
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };

  const persistState = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.FOLLOWED_CREATORS, JSON.stringify([...state.followedCreators])),
        AsyncStorage.setItem(STORAGE_KEYS.SAVED_CAMPAIGNS, JSON.stringify([...state.savedCampaigns])),
        AsyncStorage.setItem(STORAGE_KEYS.APPLIED_CAMPAIGNS, JSON.stringify([...state.appliedCampaigns])),
        AsyncStorage.setItem(STORAGE_KEYS.SAVED_TIPS, JSON.stringify([...state.savedTips])),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_REFRESH, JSON.stringify(state.lastRefresh)),
      ]);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  };

  // Helper methods
  const isCreatorFollowed = (creatorId: string) => state.followedCreators.has(creatorId);
  const isCampaignSaved = (campaignId: string) => state.savedCampaigns.has(campaignId);
  const isCampaignApplied = (campaignId: string) => state.appliedCampaigns.has(campaignId);
  const isTipSaved = (tipId: string) => state.savedTips.has(tipId);
  
  const shouldRefresh = (screen: keyof AppState['lastRefresh'], intervalMinutes: number = 5) => {
    const lastRefreshTime = state.lastRefresh[screen];
    const now = Date.now();
    const intervalMs = intervalMinutes * 60 * 1000;
    return now - lastRefreshTime > intervalMs;
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    isCreatorFollowed,
    isCampaignSaved,
    isCampaignApplied,
    isTipSaved,
    shouldRefresh,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}