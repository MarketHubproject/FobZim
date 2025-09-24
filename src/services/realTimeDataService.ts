import { useState, useEffect, useCallback } from 'react';
import { Creator, Campaign, Tip } from '../store/AppState';
import { SEED_CREATORS, SEED_CAMPAIGNS, SEED_TIPS } from './dataMigration';

// Use mock data for demo purposes
const USE_MOCK_DATA = true;

// Mock state management for simulating real-time updates
class MockDataStore {
  private static instance: MockDataStore;
  private creators: Creator[] = [];
  private campaigns: Campaign[] = [];
  private tips: Tip[] = [];
  private listeners: {
    creators: (() => void)[];
    campaigns: (() => void)[];
    tips: (() => void)[];
  } = { creators: [], campaigns: [], tips: [] };
  private userInteractions: {
    followedCreators: Set<string>;
    savedCampaigns: Set<string>;
    appliedCampaigns: Set<string>;
    savedTips: Set<string>;
  } = {
    followedCreators: new Set(),
    savedCampaigns: new Set(),
    appliedCampaigns: new Set(),
    savedTips: new Set()
  };

  static getInstance(): MockDataStore {
    if (!this.instance) {
      this.instance = new MockDataStore();
      this.instance.initializeMockData();
    }
    return this.instance;
  }

  private initializeMockData() {
    // Convert seed data to app format
    this.creators = SEED_CREATORS.map((creator, index) => ({
      id: `creator-${index + 1}`,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar,
      followers: creator.followersCount,
      isVerified: creator.isVerified,
      category: creator.category,
      location: creator.location,
      bio: creator.bio
    }));

    this.campaigns = SEED_CAMPAIGNS.map((campaign, index) => ({
      id: `campaign-${index + 1}`,
      title: campaign.title,
      brand: campaign.brand,
      description: campaign.description,
      budget: campaign.budget,
      deadline: campaign.deadline,
      category: campaign.category,
      requirements: campaign.requirements,
      applicants: campaign.applicationsCount,
      image: campaign.image
    }));

    this.tips = SEED_TIPS.map((tip, index) => ({
      id: `tip-${index + 1}`,
      title: tip.title,
      content: tip.content,
      category: tip.category,
      author: tip.author,
      likes: tip.likes,
      date: new Date().toISOString()
    }));
  }

  // Creators
  getCreators(): Creator[] {
    return [...this.creators];
  }

  subscribeToCreators(callback: () => void): () => void {
    this.listeners.creators.push(callback);
    return () => {
      const index = this.listeners.creators.indexOf(callback);
      if (index > -1) this.listeners.creators.splice(index, 1);
    };
  }

  // Campaigns
  getCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  subscribeToCampaigns(callback: () => void): () => void {
    this.listeners.campaigns.push(callback);
    return () => {
      const index = this.listeners.campaigns.indexOf(callback);
      if (index > -1) this.listeners.campaigns.splice(index, 1);
    };
  }

  // Tips
  getTips(): Tip[] {
    return [...this.tips];
  }

  subscribeToTips(callback: () => void): () => void {
    this.listeners.tips.push(callback);
    return () => {
      const index = this.listeners.tips.indexOf(callback);
      if (index > -1) this.listeners.tips.splice(index, 1);
    };
  }

  // User interactions
  followCreator(creatorId: string): void {
    this.userInteractions.followedCreators.add(creatorId);
    // Update follower count
    const creator = this.creators.find(c => c.id === creatorId);
    if (creator) {
      creator.followers += 1;
      this.notifyListeners('creators');
    }
  }

  unfollowCreator(creatorId: string): void {
    this.userInteractions.followedCreators.delete(creatorId);
    // Update follower count
    const creator = this.creators.find(c => c.id === creatorId);
    if (creator) {
      creator.followers = Math.max(0, creator.followers - 1);
      this.notifyListeners('creators');
    }
  }

  isCreatorFollowed(creatorId: string): boolean {
    return this.userInteractions.followedCreators.has(creatorId);
  }

  saveCampaign(campaignId: string): void {
    this.userInteractions.savedCampaigns.add(campaignId);
  }

  unsaveCampaign(campaignId: string): void {
    this.userInteractions.savedCampaigns.delete(campaignId);
  }

  isCampaignSaved(campaignId: string): boolean {
    return this.userInteractions.savedCampaigns.has(campaignId);
  }

  applyToCampaign(campaignId: string): void {
    this.userInteractions.appliedCampaigns.add(campaignId);
    // Update applicant count
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.applicants += 1;
      this.notifyListeners('campaigns');
    }
  }

  isCampaignApplied(campaignId: string): boolean {
    return this.userInteractions.appliedCampaigns.has(campaignId);
  }

  saveTip(tipId: string): void {
    this.userInteractions.savedTips.add(tipId);
  }

  unsaveTip(tipId: string): void {
    this.userInteractions.savedTips.delete(tipId);
  }

  isTipSaved(tipId: string): boolean {
    return this.userInteractions.savedTips.has(tipId);
  }

  likeTip(tipId: string): void {
    const tip = this.tips.find(t => t.id === tipId);
    if (tip) {
      tip.likes += 1;
      this.notifyListeners('tips');
    }
  }

  private notifyListeners(type: keyof typeof this.listeners): void {
    this.listeners[type].forEach(callback => callback());
  }
}

// Hook for real-time creators data
export function useCreators(filters?: {
  category?: string;
  location?: string;
  verified?: boolean;
}) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataStore = MockDataStore.getInstance();
    
    const updateCreators = () => {
      try {
        let filteredCreators = dataStore.getCreators();
        
        if (filters?.category && filters.category !== 'All') {
          filteredCreators = filteredCreators.filter(c => c.category === filters.category);
        }
        if (filters?.location && filters.location !== 'All') {
          filteredCreators = filteredCreators.filter(c => c.location === filters.location);
        }
        if (filters?.verified) {
          filteredCreators = filteredCreators.filter(c => c.isVerified);
        }
        
        setCreators(filteredCreators);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    updateCreators();
    const unsubscribe = dataStore.subscribeToCreators(updateCreators);
    
    return unsubscribe;
  }, [filters?.category, filters?.location, filters?.verified]);

  return { creators, loading, error };
}

// Hook for real-time campaigns data
export function useCampaigns(filters?: {
  category?: string;
  budget?: { min?: number; max?: number };
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataStore = MockDataStore.getInstance();
    
    const updateCampaigns = () => {
      try {
        let filteredCampaigns = dataStore.getCampaigns();
        
        if (filters?.category && filters.category !== 'All') {
          filteredCampaigns = filteredCampaigns.filter(c => c.category === filters.category);
        }
        
        setCampaigns(filteredCampaigns);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    updateCampaigns();
    const unsubscribe = dataStore.subscribeToCampaigns(updateCampaigns);
    
    return unsubscribe;
  }, [filters?.category, filters?.budget]);

  return { campaigns, loading, error };
}

// Hook for real-time tips data
export function useTips(filters?: {
  category?: string;
  featured?: boolean;
}) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataStore = MockDataStore.getInstance();
    
    const updateTips = () => {
      try {
        let filteredTips = dataStore.getTips();
        
        if (filters?.category && filters.category !== 'All') {
          filteredTips = filteredTips.filter(t => t.category === filters.category);
        }
        
        setTips(filteredTips);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    updateTips();
    const unsubscribe = dataStore.subscribeToTips(updateTips);
    
    return unsubscribe;
  }, [filters?.category, filters?.featured]);

  return { tips, loading, error };
}

// Hook for user interactions
export function useUserInteractions() {
  const dataStore = MockDataStore.getInstance();

  const toggleFollowCreator = useCallback((creatorId: string) => {
    if (dataStore.isCreatorFollowed(creatorId)) {
      dataStore.unfollowCreator(creatorId);
    } else {
      dataStore.followCreator(creatorId);
    }
  }, [dataStore]);

  const toggleSaveCampaign = useCallback((campaignId: string) => {
    if (dataStore.isCampaignSaved(campaignId)) {
      dataStore.unsaveCampaign(campaignId);
    } else {
      dataStore.saveCampaign(campaignId);
    }
  }, [dataStore]);

  const applyToCampaign = useCallback((campaignId: string) => {
    dataStore.applyToCampaign(campaignId);
  }, [dataStore]);

  const toggleSaveTip = useCallback((tipId: string) => {
    if (dataStore.isTipSaved(tipId)) {
      dataStore.unsaveTip(tipId);
    } else {
      dataStore.saveTip(tipId);
    }
  }, [dataStore]);

  const likeTip = useCallback((tipId: string) => {
    dataStore.likeTip(tipId);
  }, [dataStore]);

  // Status check functions
  const isCreatorFollowed = useCallback((creatorId: string) => {
    return dataStore.isCreatorFollowed(creatorId);
  }, [dataStore]);

  const isCampaignSaved = useCallback((campaignId: string) => {
    return dataStore.isCampaignSaved(campaignId);
  }, [dataStore]);

  const isCampaignApplied = useCallback((campaignId: string) => {
    return dataStore.isCampaignApplied(campaignId);
  }, [dataStore]);

  const isTipSaved = useCallback((tipId: string) => {
    return dataStore.isTipSaved(tipId);
  }, [dataStore]);

  return {
    // Actions
    toggleFollowCreator,
    toggleSaveCampaign,
    applyToCampaign,
    toggleSaveTip,
    likeTip,
    // Status checks
    isCreatorFollowed,
    isCampaignSaved,
    isCampaignApplied,
    isTipSaved
  };
}

// Hook for refreshing data
export function useDataRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async (type?: 'creators' | 'campaigns' | 'tips') => {
    setRefreshing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would trigger Firebase refreshes
    console.log(`Refreshed ${type || 'all'} data`);
    
    setRefreshing(false);
  }, []);

  return { refreshing, refreshData };
}

// Export the data store for advanced usage
export { MockDataStore };