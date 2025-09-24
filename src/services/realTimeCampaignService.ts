import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  writeBatch,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { handleFirebaseError } from '../config/firebase.prod';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced Campaign Interface for Production
export interface ProductionCampaign {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  location: string;
  region: string;
  country: string;
  createdBy: string;
  createdByProfile?: {
    displayName: string;
    photoURL?: string;
    isVerified: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'paused' | 'under_review';
  participantIds: string[];
  participantCount: number;
  contributorIds: string[];
  contributorCount: number;
  tags: string[];
  hashtags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'public' | 'private' | 'invited' | 'region_locked';
  featured: boolean;
  trending: boolean;
  verified: boolean;
  socialMediaHandles?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  milestones: CampaignMilestone[];
  updates: CampaignUpdate[];
  moderators: string[];
  reportCount: number;
  shareCount: number;
  viewCount: number;
  engagementRate: number;
  completionPercentage: number;
  daysRemaining: number;
  metadata?: {
    source?: string;
    utmParams?: Record<string, string>;
    analytics?: Record<string, any>;
  };
}

export interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  targetDate?: Timestamp;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
  reward?: string;
  imageUrl?: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Timestamp;
  createdBy: string;
  createdByProfile?: {
    displayName: string;
    photoURL?: string;
  };
  likes: number;
  likedBy: string[];
  comments: number;
  type: 'general' | 'milestone' | 'achievement' | 'announcement' | 'media';
}

export interface CampaignContribution {
  id: string;
  campaignId: string;
  contributorId: string;
  amount: number;
  currency: string;
  message?: string;
  anonymous: boolean;
  createdAt: Timestamp;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
}

export interface CampaignFilter {
  category?: string;
  subcategory?: string;
  location?: string;
  region?: string;
  status?: ProductionCampaign['status'][];
  createdBy?: string;
  participantId?: string;
  contributorId?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  hashtags?: string[];
  searchQuery?: string;
  featured?: boolean;
  trending?: boolean;
  verified?: boolean;
  startDate?: Date;
  endDate?: Date;
  priority?: ProductionCampaign['priority'][];
  visibility?: ProductionCampaign['visibility'][];
}

export interface CampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalRaised: number;
  totalContributions: number;
  averageContribution: number;
  averageCompletion: number;
  averageTimeToCompletion: number;
  topCategories: { category: string; count: number; raised: number }[];
  topRegions: { region: string; count: number; raised: number }[];
  monthlyTrends: { month: string; campaigns: number; raised: number }[];
}

class RealTimeCampaignService {
  private readonly campaignsCollection = 'campaigns';
  private readonly contributionsCollection = 'contributions';
  private readonly analyticsCollection = 'analytics';
  private readonly CACHE_KEY_PREFIX = 'campaign_cache_';
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Create a new campaign with enhanced data
  async createCampaign(campaignData: Omit<ProductionCampaign, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount' | 'participantCount' | 'contributorCount' | 'participantIds' | 'contributorIds' | 'shareCount' | 'viewCount' | 'reportCount' | 'engagementRate' | 'completionPercentage' | 'daysRemaining'>): Promise<string> {
    try {
      const now = serverTimestamp();
      const endDate = Timestamp.fromDate(new Date(campaignData.endDate as any));
      const startDate = campaignData.startDate ? Timestamp.fromDate(new Date(campaignData.startDate as any)) : now;

      const docRef = await addDoc(collection(db, this.campaignsCollection), {
        ...campaignData,
        currentAmount: 0,
        participantCount: 0,
        contributorCount: 0,
        participantIds: [],
        contributorIds: [],
        shareCount: 0,
        viewCount: 0,
        reportCount: 0,
        engagementRate: 0,
        completionPercentage: 0,
        daysRemaining: Math.ceil((endDate.toMillis() - Date.now()) / (1000 * 60 * 60 * 24)),
        createdAt: now,
        updatedAt: now,
        startDate,
        endDate,
        milestones: campaignData.milestones || [],
        updates: [],
        moderators: campaignData.moderators || [campaignData.createdBy],
        currency: campaignData.currency || 'USD',
        country: campaignData.country || 'Zimbabwe',
        region: campaignData.region || 'Harare',
        hashtags: campaignData.hashtags || [],
        featured: false,
        trending: false,
        verified: false,
      });

      // Update user's campaign count
      await this.updateUserCampaignCount(campaignData.createdBy, 1);

      // Clear relevant caches
      await this.clearCacheForUser(campaignData.createdBy);

      console.log('📝 Production campaign created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  // Get campaigns with advanced filtering and caching
  async getCampaigns(
    filters?: CampaignFilter,
    limitCount: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ campaigns: ProductionCampaign[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      // Try cache first for common queries
      const cacheKey = this.generateCacheKey('campaigns', filters, limitCount);
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        console.log('📋 Using cached campaign data');
        return cached;
      }

      let q = query(collection(db, this.campaignsCollection));

      // Apply filters
      if (filters) {
        if (filters.category) {
          q = query(q, where('category', '==', filters.category));
        }
        if (filters.subcategory) {
          q = query(q, where('subcategory', '==', filters.subcategory));
        }
        if (filters.region) {
          q = query(q, where('region', '==', filters.region));
        }
        if (filters.status && filters.status.length > 0) {
          q = query(q, where('status', 'in', filters.status));
        }
        if (filters.createdBy) {
          q = query(q, where('createdBy', '==', filters.createdBy));
        }
        if (filters.participantId) {
          q = query(q, where('participantIds', 'array-contains', filters.participantId));
        }
        if (filters.contributorId) {
          q = query(q, where('contributorIds', 'array-contains', filters.contributorId));
        }
        if (filters.featured !== undefined) {
          q = query(q, where('featured', '==', filters.featured));
        }
        if (filters.trending !== undefined) {
          q = query(q, where('trending', '==', filters.trending));
        }
        if (filters.verified !== undefined) {
          q = query(q, where('verified', '==', filters.verified));
        }
        if (filters.tags && filters.tags.length > 0) {
          q = query(q, where('tags', 'array-contains-any', filters.tags));
        }
        if (filters.hashtags && filters.hashtags.length > 0) {
          q = query(q, where('hashtags', 'array-contains-any', filters.hashtags));
        }
        if (filters.minAmount) {
          q = query(q, where('targetAmount', '>=', filters.minAmount));
        }
        if (filters.maxAmount) {
          q = query(q, where('targetAmount', '<=', filters.maxAmount));
        }
        if (filters.visibility && filters.visibility.length > 0) {
          q = query(q, where('visibility', 'in', filters.visibility));
        }
      }

      // Default ordering with pagination
      q = query(q, orderBy('featured', 'desc'), orderBy('createdAt', 'desc'));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      q = query(q, limit(limitCount));

      const querySnapshot = await getDocs(q);
      const campaigns: ProductionCampaign[] = [];
      let newLastDoc: QueryDocumentSnapshot<DocumentData> | undefined;

      querySnapshot.forEach((doc, index) => {
        const data = doc.data() as Omit<ProductionCampaign, 'id'>;
        
        // Calculate dynamic fields
        const now = Date.now();
        const endTime = data.endDate.toMillis();
        const daysRemaining = Math.max(0, Math.ceil((endTime - now) / (1000 * 60 * 60 * 24)));
        const completionPercentage = Math.min(100, (data.currentAmount / data.targetAmount) * 100);

        campaigns.push({
          id: doc.id,
          ...data,
          daysRemaining,
          completionPercentage,
        });

        // Set last document for pagination
        if (index === querySnapshot.docs.length - 1) {
          newLastDoc = doc;
        }
      });

      // Client-side search filtering if needed
      let filteredCampaigns = campaigns;
      if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredCampaigns = campaigns.filter(campaign => 
          campaign.title.toLowerCase().includes(searchLower) ||
          campaign.description.toLowerCase().includes(searchLower) ||
          campaign.shortDescription?.toLowerCase().includes(searchLower) ||
          campaign.location.toLowerCase().includes(searchLower) ||
          campaign.region.toLowerCase().includes(searchLower) ||
          campaign.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          campaign.hashtags.some(hashtag => hashtag.toLowerCase().includes(searchLower))
        );
      }

      const result = { campaigns: filteredCampaigns, lastDoc: newLastDoc };

      // Cache the result
      await this.setCachedData(cacheKey, result);

      console.log(`📊 Retrieved ${filteredCampaigns.length} campaigns from Firestore`);
      return result;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  // Subscribe to real-time campaign updates with enhanced features
  subscribeToRealTimeCampaigns(
    filters: CampaignFilter | undefined,
    callback: (campaigns: ProductionCampaign[], changes: any[]) => void,
    errorCallback?: (error: Error) => void,
    limitCount: number = 20
  ): () => void {
    try {
      let q = query(collection(db, this.campaignsCollection));

      // Apply filters
      if (filters) {
        if (filters.category) {
          q = query(q, where('category', '==', filters.category));
        }
        if (filters.status && filters.status.length > 0) {
          q = query(q, where('status', 'in', filters.status));
        }
        if (filters.createdBy) {
          q = query(q, where('createdBy', '==', filters.createdBy));
        }
        if (filters.featured !== undefined) {
          q = query(q, where('featured', '==', filters.featured));
        }
        if (filters.region) {
          q = query(q, where('region', '==', filters.region));
        }
      }

      q = query(q, orderBy('featured', 'desc'), orderBy('updatedAt', 'desc'), limit(limitCount));

      console.log('👂 Subscribing to real-time campaign updates');

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const campaigns: ProductionCampaign[] = [];
        const changes: any[] = [];

        snapshot.docChanges().forEach((change) => {
          changes.push({
            type: change.type,
            doc: change.doc,
            oldIndex: change.oldIndex,
            newIndex: change.newIndex,
          });
        });

        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<ProductionCampaign, 'id'>;
          
          // Calculate dynamic fields
          const now = Date.now();
          const endTime = data.endDate.toMillis();
          const daysRemaining = Math.max(0, Math.ceil((endTime - now) / (1000 * 60 * 60 * 24)));
          const completionPercentage = Math.min(100, (data.currentAmount / data.targetAmount) * 100);

          campaigns.push({
            id: doc.id,
            ...data,
            daysRemaining,
            completionPercentage,
          });
        });

        // Client-side search filtering
        let filteredCampaigns = campaigns;
        if (filters?.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          filteredCampaigns = campaigns.filter(campaign => 
            campaign.title.toLowerCase().includes(searchLower) ||
            campaign.description.toLowerCase().includes(searchLower) ||
            campaign.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
            campaign.hashtags.some(hashtag => hashtag.toLowerCase().includes(searchLower))
          );
        }

        console.log(`🔄 Real-time update: ${filteredCampaigns.length} campaigns, ${changes.length} changes`);
        callback(filteredCampaigns, changes);
      }, (error) => {
        console.error('Error in campaign subscription:', error);
        errorCallback?.(new Error(handleFirebaseError(error)));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to campaigns:', error);
      return () => {};
    }
  }

  // Advanced campaign contribution with analytics
  async contributeToCampaign(
    campaignId: string, 
    amount: number, 
    contributorId: string,
    contributorProfile: { displayName: string; photoURL?: string },
    options: {
      message?: string;
      anonymous?: boolean;
      paymentMethod: string;
      currency?: string;
    }
  ): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Create contribution record
      const contributionRef = doc(collection(db, this.contributionsCollection));
      const contribution: Omit<CampaignContribution, 'id'> = {
        campaignId,
        contributorId,
        amount,
        currency: options.currency || 'USD',
        message: options.message,
        anonymous: options.anonymous || false,
        createdAt: serverTimestamp() as Timestamp,
        paymentMethod: options.paymentMethod,
        status: 'completed', // In production, this would start as 'pending'
      };

      batch.set(contributionRef, contribution);

      // Update campaign with contribution
      const campaignRef = doc(db, this.campaignsCollection, campaignId);
      batch.update(campaignRef, {
        currentAmount: increment(amount),
        contributorIds: arrayUnion(contributorId),
        contributorCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Add campaign update for large contributions
      if (amount >= 1000) { // Threshold for featured contributions
        const updateData: Omit<CampaignUpdate, 'id'> = {
          title: 'Major Contribution Received! 🎉',
          content: options.anonymous 
            ? `An anonymous contributor donated ${options.currency || 'USD'} ${amount.toLocaleString()}!`
            : `${contributorProfile.displayName} contributed ${options.currency || 'USD'} ${amount.toLocaleString()}! ${options.message ? `Message: "${options.message}"` : ''}`,
          createdAt: serverTimestamp() as Timestamp,
          createdBy: contributorId,
          createdByProfile: options.anonymous ? undefined : contributorProfile,
          likes: 0,
          likedBy: [],
          comments: 0,
          type: 'achievement',
        };

        const updatesRef = collection(db, this.campaignsCollection, campaignId, 'updates');
        const updateRef = doc(updatesRef);
        batch.set(updateRef, updateData);
      }

      await batch.commit();

      console.log('💰 Campaign contribution completed:', { campaignId, amount, contributorId });
      return contributionRef.id;
    } catch (error) {
      console.error('Error contributing to campaign:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  // Get comprehensive campaign analytics
  async getCampaignAnalytics(userId?: string, timeframe: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<CampaignAnalytics> {
    try {
      const cacheKey = `analytics_${userId || 'global'}_${timeframe}`;
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      let q = query(collection(db, this.campaignsCollection));
      
      if (userId) {
        q = query(q, where('createdBy', '==', userId));
      }

      // Add time-based filtering
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (timeframe) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }

      const querySnapshot = await getDocs(q);
      const campaigns: ProductionCampaign[] = [];

      querySnapshot.forEach((doc) => {
        campaigns.push({
          id: doc.id,
          ...doc.data()
        } as ProductionCampaign);
      });

      // Calculate analytics
      const analytics: CampaignAnalytics = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
        totalRaised: campaigns.reduce((sum, c) => sum + c.currentAmount, 0),
        totalContributions: campaigns.reduce((sum, c) => sum + c.contributorCount, 0),
        averageContribution: 0,
        averageCompletion: campaigns.length > 0 
          ? campaigns.reduce((sum, c) => sum + c.completionPercentage, 0) / campaigns.length
          : 0,
        averageTimeToCompletion: 0,
        topCategories: this.calculateTopCategories(campaigns),
        topRegions: this.calculateTopRegions(campaigns),
        monthlyTrends: this.calculateMonthlyTrends(campaigns),
      };

      analytics.averageContribution = analytics.totalContributions > 0 
        ? analytics.totalRaised / analytics.totalContributions 
        : 0;

      // Cache the result
      await this.setCachedData(cacheKey, analytics, 10 * 60 * 1000); // 10 minutes cache

      console.log('📊 Campaign analytics calculated:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  // Helper methods for analytics
  private calculateTopCategories(campaigns: ProductionCampaign[]) {
    const categoryMap = new Map<string, { count: number; raised: number }>();
    
    campaigns.forEach(campaign => {
      const existing = categoryMap.get(campaign.category) || { count: 0, raised: 0 };
      categoryMap.set(campaign.category, {
        count: existing.count + 1,
        raised: existing.raised + campaign.currentAmount
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 10);
  }

  private calculateTopRegions(campaigns: ProductionCampaign[]) {
    const regionMap = new Map<string, { count: number; raised: number }>();
    
    campaigns.forEach(campaign => {
      const existing = regionMap.get(campaign.region) || { count: 0, raised: 0 };
      regionMap.set(campaign.region, {
        count: existing.count + 1,
        raised: existing.raised + campaign.currentAmount
      });
    });

    return Array.from(regionMap.entries())
      .map(([region, data]) => ({ region, ...data }))
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 10);
  }

  private calculateMonthlyTrends(campaigns: ProductionCampaign[]) {
    const monthMap = new Map<string, { campaigns: number; raised: number }>();
    
    campaigns.forEach(campaign => {
      const date = campaign.createdAt.toDate();
      const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const existing = monthMap.get(month) || { campaigns: 0, raised: 0 };
      monthMap.set(month, {
        campaigns: existing.campaigns + 1,
        raised: existing.raised + campaign.currentAmount
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  // Cache management
  private generateCacheKey(type: string, filters?: any, limit?: number): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `${this.CACHE_KEY_PREFIX}${type}_${btoa(filterStr)}_${limit || 'all'}`;
  }

  private async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          return data;
        }
        await AsyncStorage.removeItem(key);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async setCachedData(key: string, data: any, customExpiry?: number): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      
      // Set expiry cleanup
      setTimeout(() => {
        AsyncStorage.removeItem(key);
      }, customExpiry || this.CACHE_EXPIRY);
    } catch (error) {
      // Silent fail for cache operations
    }
  }

  private async clearCacheForUser(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userCacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_KEY_PREFIX) && key.includes(userId)
      );
      
      if (userCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(userCacheKeys);
      }
    } catch (error) {
      // Silent fail
    }
  }

  private async updateUserCampaignCount(userId: string, increment: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        campaignCount: increment > 0 ? increment(increment) : increment(increment),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // Non-critical operation, log but don't throw
      console.warn('Failed to update user campaign count:', error);
    }
  }

  // View tracking for analytics
  async trackCampaignView(campaignId: string, viewerId?: string): Promise<void> {
    try {
      const campaignRef = doc(db, this.campaignsCollection, campaignId);
      await updateDoc(campaignRef, {
        viewCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // Track unique views if viewer is authenticated
      if (viewerId) {
        // You could implement unique view tracking here
        console.log('📈 Campaign view tracked:', { campaignId, viewerId });
      }
    } catch (error) {
      // Non-critical operation
      console.warn('Failed to track campaign view:', error);
    }
  }

  // Share tracking
  async trackCampaignShare(campaignId: string, sharerId: string, platform: string = 'app'): Promise<void> {
    try {
      const campaignRef = doc(db, this.campaignsCollection, campaignId);
      await updateDoc(campaignRef, {
        shareCount: increment(1),
        updatedAt: serverTimestamp()
      });

      console.log('📤 Campaign share tracked:', { campaignId, sharerId, platform });
    } catch (error) {
      console.warn('Failed to track campaign share:', error);
    }
  }
}

// Export singleton instance
const realTimeCampaignService = new RealTimeCampaignService();
export default realTimeCampaignService;