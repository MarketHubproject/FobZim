import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ANALYTICS_KEY = 'zimbuzz_analytics';
const SESSION_KEY = 'zimbuzz_session';

export interface UserEngagement {
  tipsViewed: number;
  tipsSaved: number;
  tipsRemoved: number;
  campaignsViewed: number;
  campaignsSaved: number;
  campaignsApplied: number;
  searchQueries: number;
  timeSpentInApp: number; // in milliseconds
  screenVisits: Record<string, number>;
  featureUsage: Record<string, number>;
  lastActiveDate: string;
  totalSessions: number;
  averageSessionLength: number;
}

export interface SessionData {
  startTime: number;
  endTime?: number;
  screenVisits: string[];
  actionsPerformed: string[];
  isActive: boolean;
}

export interface AnalyticsData {
  userId?: string;
  installDate: string;
  lastUpdateDate: string;
  engagement: UserEngagement;
  sessions: SessionData[];
  preferences: {
    trackingEnabled: boolean;
    shareAnonymousData: boolean;
  };
}

class AnalyticsManager {
  private isWeb = Platform.OS === 'web';
  private currentSession: SessionData | null = null;
  private analyticsData: AnalyticsData | null = null;

  async initialize(): Promise<void> {
    try {
      await this.loadAnalytics();
      await this.startSession();
    } catch (error) {
      console.warn('Failed to initialize analytics:', error);
    }
  }

  // Load analytics data
  private async loadAnalytics(): Promise<void> {
    try {
      let storedData: string | null = null;
      
      if (this.isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          storedData = window.localStorage.getItem(ANALYTICS_KEY);
        }
      } else {
        storedData = await AsyncStorage.getItem(ANALYTICS_KEY);
      }
      
      if (storedData) {
        this.analyticsData = JSON.parse(storedData) as AnalyticsData;
      } else {
        // Initialize new analytics data
        this.analyticsData = this.createDefaultAnalyticsData();
        await this.saveAnalytics();
      }
    } catch (error) {
      console.warn('Failed to load analytics:', error);
      this.analyticsData = this.createDefaultAnalyticsData();
    }
  }

  // Save analytics data
  private async saveAnalytics(): Promise<void> {
    if (!this.analyticsData) return;

    try {
      const dataToSave = JSON.stringify(this.analyticsData);
      
      if (this.isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(ANALYTICS_KEY, dataToSave);
        }
      } else {
        await AsyncStorage.setItem(ANALYTICS_KEY, dataToSave);
      }
      
      this.analyticsData.lastUpdateDate = new Date().toISOString();
    } catch (error) {
      console.warn('Failed to save analytics:', error);
    }
  }

  // Create default analytics data structure
  private createDefaultAnalyticsData(): AnalyticsData {
    const now = new Date().toISOString();
    
    return {
      installDate: now,
      lastUpdateDate: now,
      engagement: {
        tipsViewed: 0,
        tipsSaved: 0,
        tipsRemoved: 0,
        campaignsViewed: 0,
        campaignsSaved: 0,
        campaignsApplied: 0,
        searchQueries: 0,
        timeSpentInApp: 0,
        screenVisits: {},
        featureUsage: {},
        lastActiveDate: now,
        totalSessions: 0,
        averageSessionLength: 0,
      },
      sessions: [],
      preferences: {
        trackingEnabled: true,
        shareAnonymousData: false,
      },
    };
  }

  // Session management
  async startSession(): Promise<void> {
    if (!this.analyticsData?.preferences.trackingEnabled) return;

    this.currentSession = {
      startTime: Date.now(),
      screenVisits: [],
      actionsPerformed: [],
      isActive: true,
    };

    if (this.analyticsData) {
      this.analyticsData.engagement.totalSessions++;
      await this.saveAnalytics();
    }
  }

  async endSession(): Promise<void> {
    if (!this.currentSession || !this.analyticsData) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.isActive = false;
    
    const sessionLength = this.currentSession.endTime - this.currentSession.startTime;
    
    // Update analytics data
    this.analyticsData.engagement.timeSpentInApp += sessionLength;
    this.analyticsData.sessions.push({ ...this.currentSession });
    
    // Keep only last 50 sessions to limit storage
    if (this.analyticsData.sessions.length > 50) {
      this.analyticsData.sessions = this.analyticsData.sessions.slice(-50);
    }
    
    // Update average session length
    const totalTime = this.analyticsData.engagement.timeSpentInApp;
    const totalSessions = this.analyticsData.engagement.totalSessions;
    this.analyticsData.engagement.averageSessionLength = totalTime / totalSessions;
    
    await this.saveAnalytics();
    this.currentSession = null;
  }

  // Track screen visits
  trackScreenVisit(screenName: string): void {
    if (!this.analyticsData?.preferences.trackingEnabled) return;

    if (this.currentSession) {
      this.currentSession.screenVisits.push(screenName);
    }

    if (this.analyticsData) {
      const screenVisits = this.analyticsData.engagement.screenVisits;
      screenVisits[screenName] = (screenVisits[screenName] || 0) + 1;
      this.saveAnalytics(); // Save async without awaiting
    }
  }

  // Track user actions
  trackAction(actionName: string, metadata?: Record<string, any>): void {
    if (!this.analyticsData?.preferences.trackingEnabled) return;

    const actionWithMetadata = metadata 
      ? `${actionName}:${JSON.stringify(metadata)}`
      : actionName;

    if (this.currentSession) {
      this.currentSession.actionsPerformed.push(actionWithMetadata);
    }

    if (this.analyticsData) {
      const featureUsage = this.analyticsData.engagement.featureUsage;
      featureUsage[actionName] = (featureUsage[actionName] || 0) + 1;
      
      // Update specific engagement metrics
      switch (actionName) {
        case 'tip_viewed':
          this.analyticsData.engagement.tipsViewed++;
          break;
        case 'tip_saved':
          this.analyticsData.engagement.tipsSaved++;
          break;
        case 'tip_removed':
          this.analyticsData.engagement.tipsRemoved++;
          break;
        case 'campaign_viewed':
          this.analyticsData.engagement.campaignsViewed++;
          break;
        case 'campaign_saved':
          this.analyticsData.engagement.campaignsSaved++;
          break;
        case 'campaign_applied':
          this.analyticsData.engagement.campaignsApplied++;
          break;
        case 'search_performed':
          this.analyticsData.engagement.searchQueries++;
          break;
      }
      
      this.analyticsData.engagement.lastActiveDate = new Date().toISOString();
      this.saveAnalytics(); // Save async without awaiting
    }
  }

  // Get analytics insights
  async getEngagementInsights(): Promise<{
    totalTime: string;
    mostUsedFeature: string;
    favoriteScreen: string;
    engagementScore: number;
    streakDays: number;
    tipSaveRate: number;
    campaignApplicationRate: number;
  } | null> {
    if (!this.analyticsData) return null;

    const engagement = this.analyticsData.engagement;
    
    // Calculate most used feature
    const features = Object.entries(engagement.featureUsage);
    const mostUsedFeature = features.reduce((max, current) => 
      current[1] > max[1] ? current : max, features[0] || ['none', 0]
    )[0];

    // Calculate favorite screen
    const screens = Object.entries(engagement.screenVisits);
    const favoriteScreen = screens.reduce((max, current) => 
      current[1] > max[1] ? current : max, screens[0] || ['home', 0]
    )[0];

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.floor(
      (engagement.tipsSaved * 10 + 
       engagement.campaignsApplied * 15 + 
       engagement.searchQueries * 5 + 
       Object.keys(engagement.screenVisits).length * 3) / 10
    ));

    // Calculate tip save rate
    const tipSaveRate = engagement.tipsViewed > 0 
      ? (engagement.tipsSaved / engagement.tipsViewed) * 100 
      : 0;

    // Calculate campaign application rate
    const campaignApplicationRate = engagement.campaignsViewed > 0
      ? (engagement.campaignsApplied / engagement.campaignsViewed) * 100
      : 0;

    return {
      totalTime: this.formatDuration(engagement.timeSpentInApp),
      mostUsedFeature,
      favoriteScreen,
      engagementScore,
      streakDays: this.calculateStreakDays(),
      tipSaveRate: Math.round(tipSaveRate),
      campaignApplicationRate: Math.round(campaignApplicationRate),
    };
  }

  // Format duration in a human-readable way
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Calculate streak days (placeholder - would need more complex logic)
  private calculateStreakDays(): number {
    // Simplified calculation - in a real app, you'd track daily usage
    const sessionsLastWeek = this.analyticsData?.sessions.filter(
      session => (Date.now() - session.startTime) < 7 * 24 * 60 * 60 * 1000
    ).length || 0;
    
    return Math.min(7, sessionsLastWeek);
  }

  // Privacy controls
  async updatePreferences(preferences: Partial<AnalyticsData['preferences']>): Promise<void> {
    if (!this.analyticsData) return;

    this.analyticsData.preferences = { ...this.analyticsData.preferences, ...preferences };
    await this.saveAnalytics();
  }

  async clearAnalytics(): Promise<void> {
    try {
      if (this.isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(ANALYTICS_KEY);
        }
      } else {
        await AsyncStorage.removeItem(ANALYTICS_KEY);
      }
      
      this.analyticsData = null;
      this.currentSession = null;
    } catch (error) {
      console.warn('Failed to clear analytics:', error);
    }
  }

  getAnalyticsData(): AnalyticsData | null {
    return this.analyticsData ? { ...this.analyticsData } : null;
  }
}

export const analyticsManager = new AnalyticsManager();