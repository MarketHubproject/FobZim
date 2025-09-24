/**
 * Campaign Data Models for ZimBuzz
 * Comprehensive type definitions for campaign management system
 */

import { UserProfile } from '../services/authService';

// Campaign Location Interface
export interface CampaignLocation {
  isRemote: boolean;
  country: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

// Portfolio Interface for Applications
export interface Portfolio {
  id: string;
  type: 'image' | 'video' | 'link';
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
}

// Campaign Status Enum
export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Campaign Category Enum
export enum CampaignCategory {
  LIFESTYLE = 'lifestyle',
  FASHION = 'fashion',
  FOOD = 'food',
  TRAVEL = 'travel',
  TECH = 'tech',
  FITNESS = 'fitness',
  BEAUTY = 'beauty',
  MUSIC = 'music',
  EDUCATION = 'education',
  BUSINESS = 'business',
  ENTERTAINMENT = 'entertainment',
  CHARITY = 'charity'
}

// Campaign Priority Levels
export enum CampaignPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Campaign Reward Types
export interface CampaignReward {
  id?: string; // Optional for backward compatibility
  type: 'monetary' | 'product' | 'service' | 'exposure' | 'other';
  value?: number; // For monetary rewards in USD
  description: string;
  quantity?: number; // How many rewards available
}

// Campaign Requirements
export interface CampaignRequirement {
  id: string;
  type: 'follower_count' | 'location' | 'age_range' | 'engagement_rate' | 'previous_work' | 'custom';
  description: string;
  value?: string | number;
  isRequired: boolean;
}

// Campaign Deliverables
export interface CampaignDeliverable {
  id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'blog' | 'review' | 'custom';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'blog' | 'other';
  description: string;
  quantity: number;
  deadline?: Date;
  specifications?: {
    duration?: number; // For videos (in seconds)
    dimensions?: string; // For images
    hashtags?: string[];
    mentions?: string[];
    customInstructions?: string;
  };
}

// Campaign Application Status
export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  COMPLETED = 'completed'
}

// Campaign Application
export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhoto?: string;
  status: ApplicationStatus;
  message: string;
  experience?: string;
  whyYou?: string;
  availability?: string;
  expectedDelivery?: string;
  portfolio?: Portfolio[];
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  // Legacy fields for backward compatibility
  applicantId?: string;
  applicant?: UserProfile;
  applicationDate?: Date;
  proposedDeliverables?: string;
  creatorRate?: number;
  responseDate?: Date;
  completionDate?: Date;
  rating?: {
    creatorRating: number;
    brandRating: number;
    feedback?: string;
  };
}

// Main Campaign Interface
export interface Campaign {
  // Basic Information
  id: string;
  title: string;
  description: string;
  briefDescription: string; // Short summary for list views
  
  // Creator/Brand Information
  creatorId: string;
  creator?: UserProfile;
  brandName?: string; // If different from creator name
  brandLogo?: string;
  
  // Campaign Details
  category: CampaignCategory;
  status: CampaignStatus;
  priority: CampaignPriority;
  
  // Content Requirements
  deliverables: CampaignDeliverable[];
  requirements: CampaignRequirement[];
  
  // Rewards and Budget
  rewards: CampaignReward[];
  budget?: {
    min: number;
    max: number;
    currency: 'USD' | 'ZWL' | 'ZAR'; // Zimbabwe Dollar, SA Rand
  };
  
  // Timeline
  applicationDeadline: Date;
  campaignStartDate: Date;
  campaignEndDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Location and Targeting
  location?: {
    country: string;
    city?: string;
    region?: string;
    isRemote: boolean;
  };
  
  // Media
  images: string[]; // URLs to campaign images
  videos?: string[]; // URLs to campaign videos
  
  // Engagement Metrics
  metrics: {
    views: number;
    applications: number;
    shares: number;
    saves: number;
    clicks: number;
  };
  
  // Campaign Configuration
  settings: {
    isPublic: boolean;
    allowDirectApplications: boolean;
    requirePortfolio: boolean;
    autoApproval: boolean;
    maxApplicants?: number;
  };
  
  // SEO and Discovery
  tags: string[];
  keywords: string[];
  
  // Applications
  applications?: CampaignApplication[];
  
  // Status tracking
  isActive: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
}

// Campaign List Item (for efficient list rendering)
export interface CampaignListItem {
  id: string;
  title: string;
  briefDescription: string;
  category: CampaignCategory;
  status: CampaignStatus;
  creator?: {
    displayName: string;
    photoURL?: string;
    isVerified: boolean;
  };
  rewards: Pick<CampaignReward, 'type' | 'value' | 'description'>[];
  applicationDeadline: Date;
  location?: {
    city?: string;
    country: string;
    isRemote: boolean;
  };
  images: string[]; // Just the first image usually
  metrics: Pick<Campaign['metrics'], 'views' | 'applications'>;
  createdAt: Date;
  isFeatured: boolean;
}

// Campaign Form Data (for creation/editing)
export interface CampaignFormData {
  title: string;
  description: string;
  briefDescription: string;
  category: CampaignCategory;
  priority: CampaignPriority;
  brandName?: string;
  applicationDeadline: Date;
  campaignStartDate: Date;
  campaignEndDate: Date;
  location?: Campaign['location'];
  rewards: CampaignReward[];
  deliverables: CampaignDeliverable[];
  requirements: CampaignRequirement[];
  budget?: Campaign['budget'];
  tags: string[];
  settings: Campaign['settings'];
  images: (File | string)[]; // Files for new images, strings for existing URLs
  creatorId?: string; // For backward compatibility
}

// Campaign Search/Filter Parameters
export interface CampaignSearchParams {
  query?: string;
  category?: CampaignCategory[];
  status?: CampaignStatus[];
  location?: {
    country?: string;
    city?: string;
    includeRemote?: boolean;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  deadline?: {
    from?: Date;
    to?: Date;
  };
  creatorId?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'deadline' | 'budget' | 'applications' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Campaign Statistics (for creator dashboard)
export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalApplications: number;
  averageApplications: number;
  totalViews: number;
  conversionRate: number; // applications/views
  averageRating: number;
  totalRevenueGenerated?: number;
  topPerformingCategory: CampaignCategory;
  recentActivity: {
    newApplications: number;
    newViews: number;
    period: 'today' | 'week' | 'month';
  };
}

// Campaign Activity Log
export interface CampaignActivity {
  id: string;
  campaignId: string;
  type: 'created' | 'updated' | 'application_received' | 'application_approved' | 'application_rejected' | 'completed' | 'cancelled';
  userId: string;
  user?: Pick<UserProfile, 'displayName' | 'photoURL'>;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Export utility functions
export const CAMPAIGN_CATEGORIES_LABELS: Record<CampaignCategory, string> = {
  [CampaignCategory.LIFESTYLE]: 'Lifestyle',
  [CampaignCategory.FASHION]: 'Fashion & Style',
  [CampaignCategory.FOOD]: 'Food & Dining',
  [CampaignCategory.TRAVEL]: 'Travel & Tourism',
  [CampaignCategory.TECH]: 'Technology',
  [CampaignCategory.FITNESS]: 'Fitness & Health',
  [CampaignCategory.BEAUTY]: 'Beauty & Skincare',
  [CampaignCategory.MUSIC]: 'Music & Audio',
  [CampaignCategory.EDUCATION]: 'Education',
  [CampaignCategory.BUSINESS]: 'Business & Finance',
  [CampaignCategory.ENTERTAINMENT]: 'Entertainment',
  [CampaignCategory.CHARITY]: 'Charity & Causes'
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: 'Draft',
  [CampaignStatus.ACTIVE]: 'Active',
  [CampaignStatus.PAUSED]: 'Paused',
  [CampaignStatus.COMPLETED]: 'Completed',
  [CampaignStatus.CANCELLED]: 'Cancelled'
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Pending Review',
  [ApplicationStatus.ACCEPTED]: 'Accepted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
  [ApplicationStatus.COMPLETED]: 'Completed'
};

// Utility type guards
export const isCampaignActive = (campaign: Campaign): boolean => {
  return campaign.status === CampaignStatus.ACTIVE && 
         campaign.applicationDeadline > new Date() &&
         campaign.isActive;
};

export const canApplyToCampaign = (campaign: Campaign, userId?: string): boolean => {
  if (!userId || campaign.creatorId === userId) return false;
  if (!isCampaignActive(campaign)) return false;
  if (campaign.settings.maxApplicants && 
      (campaign.applications?.length || 0) >= campaign.settings.maxApplicants) {
    return false;
  }
  // Check if user already applied
  if (campaign.applications?.some(app => app.applicantId === userId)) {
    return false;
  }
  return true;
};

export const getCampaignStatusColor = (status: CampaignStatus): string => {
  switch (status) {
    case CampaignStatus.ACTIVE: return '#4CAF50';
    case CampaignStatus.DRAFT: return '#FF9800';
    case CampaignStatus.PAUSED: return '#FFC107';
    case CampaignStatus.COMPLETED: return '#2196F3';
    case CampaignStatus.CANCELLED: return '#F44336';
    default: return '#757575';
  }
};

export const formatCampaignBudget = (budget?: Campaign['budget']): string => {
  if (!budget) return 'Budget not specified';
  if (budget.min === budget.max) {
    return `${budget.currency} ${budget.min.toLocaleString()}`;
  }
  return `${budget.currency} ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}`;
};