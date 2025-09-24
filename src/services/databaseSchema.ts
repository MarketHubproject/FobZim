import { Timestamp, serverTimestamp } from 'firebase/firestore';

// Base interface for all documents
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Document Schema
export interface UserDocument extends BaseDocument {
  // Basic Info
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  
  // Account Status
  isCreator: boolean;
  isVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  
  // Creator-specific fields
  category?: string;
  socialMediaHandles?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  
  // Statistics
  followersCount: number;
  followingCount: number;
  campaignsCompleted: number;
  totalEarnings: number;
  
  // Preferences
  notificationSettings?: {
    newCampaigns: boolean;
    followerUpdates: boolean;
    campaignUpdates: boolean;
    emailNotifications: boolean;
  };
  
  // Arrays for relationships
  following: string[]; // User IDs
  savedCampaigns: string[]; // Campaign IDs
  appliedCampaigns: string[]; // Campaign IDs
  savedTips: string[]; // Tip IDs
  
  // Metadata
  lastLoginAt?: Timestamp;
  onboardingCompleted: boolean;
}

// Creator Document Schema (duplicated from users for easy querying)
export interface CreatorDocument extends BaseDocument {
  userId: string; // Reference to user document
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  category: string;
  
  // Verification
  isVerified: boolean;
  verificationDate?: Timestamp;
  
  // Statistics
  followers: string[]; // User IDs of followers
  followersCount: number;
  avgEngagementRate: number;
  totalViews: number;
  totalCampaigns: number;
  
  // Content Stats
  contentCategories: string[];
  primaryAudience: {
    ageRange: string;
    gender: string;
    location: string[];
  };
  
  // Social Media
  socialMediaHandles: {
    instagram?: { username: string; followers: number; verified: boolean };
    twitter?: { username: string; followers: number; verified: boolean };
    tiktok?: { username: string; followers: number; verified: boolean };
    youtube?: { channel: string; subscribers: number; verified: boolean };
  };
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  availableForCampaigns: boolean;
  rateCard?: {
    postRate: number;
    storyRate: number;
    videoRate: number;
    currency: string;
  };
}

// Campaign Document Schema
export interface CampaignDocument extends BaseDocument {
  // Basic Info
  title: string;
  brand: string;
  description: string;
  longDescription?: string;
  
  // Financial
  budget: string;
  budgetAmount: number; // Numeric value for filtering
  currency: string;
  paymentTerms: string;
  
  // Timeline
  deadline: string;
  campaignStartDate?: Timestamp;
  campaignEndDate?: Timestamp;
  applicationDeadline: Timestamp;
  
  // Targeting
  category: string;
  subcategories: string[];
  targetAudience: {
    ageRange: string[];
    gender: string[];
    location: string[];
    interests: string[];
  };
  
  // Requirements
  requirements: string[];
  deliverables: {
    type: 'post' | 'story' | 'video' | 'reel' | 'article';
    platform: string;
    quantity: number;
    specifications?: string;
  }[];
  
  // Media
  image: string;
  gallery?: string[];
  brandAssets?: string[];
  
  // Status & Management
  status: 'draft' | 'active' | 'paused' | 'completed' | 'expired' | 'cancelled';
  createdBy: string; // User ID of campaign creator
  managedBy: string[]; // Array of manager user IDs
  
  // Applications
  applications: string[]; // User IDs who applied
  selectedCreators: string[]; // User IDs of selected creators
  rejectedApplications: string[]; // User IDs of rejected applications
  maxApplications?: number;
  
  // Engagement
  savedBy: string[]; // User IDs who saved this campaign
  views: number;
  applicationsCount: number;
  
  // Metrics
  performance?: {
    totalReach: number;
    totalEngagement: number;
    totalImpressions: number;
    conversionRate: number;
  };
}

// Tip/Content Document Schema
export interface TipDocument extends BaseDocument {
  // Basic Info
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  
  // Author
  author: string; // Display name
  authorId: string; // User ID
  authorAvatar?: string;
  
  // Media
  image?: string;
  gallery?: string[];
  videoUrl?: string;
  
  // Engagement
  likes: number;
  likedBy: string[]; // User IDs
  savedBy: string[]; // User IDs
  shares: number;
  comments: number;
  views: number;
  
  // Status
  status: 'draft' | 'published' | 'archived' | 'featured';
  featured: boolean;
  featuredUntil?: Timestamp;
  
  // SEO
  slug?: string;
  metaDescription?: string;
  keywords: string[];
  
  // Moderation
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatedBy?: string;
  moderationNotes?: string;
}

// Application Document Schema
export interface ApplicationDocument extends BaseDocument {
  campaignId: string;
  userId: string;
  creatorId: string; // Same as userId for creators
  
  // Application Content
  coverLetter: string;
  proposedContent: string;
  timeline: string;
  budget?: number;
  
  // Media/Portfolio
  portfolioItems: {
    type: 'image' | 'video' | 'link';
    url: string;
    caption?: string;
  }[];
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  
  // Feedback
  reviewNotes?: string;
  creatorFeedback?: string;
  rating?: number;
  
  // Contract
  contractSigned: boolean;
  contractSignedAt?: Timestamp;
  deliveryStatus: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'revision_needed';
  
  // Payment
  paymentStatus: 'pending' | 'processing' | 'paid' | 'disputed';
  paymentAmount?: number;
  paymentDate?: Timestamp;
}

// Follow Relationship Schema
export interface FollowDocument extends BaseDocument {
  followerId: string; // User who follows
  followingId: string; // User being followed
  followedAt: Timestamp;
  
  // Notification preferences for this relationship
  notifications: boolean;
  
  // Stats
  interactionCount: number;
  lastInteractionAt?: Timestamp;
}

// Notification Document Schema
export interface NotificationDocument extends BaseDocument {
  userId: string; // Recipient
  type: 'campaign_new' | 'campaign_application' | 'follow_new' | 'campaign_accepted' | 'campaign_rejected' | 'tip_liked' | 'system';
  
  // Content
  title: string;
  message: string;
  actionUrl?: string;
  
  // Status
  read: boolean;
  readAt?: Timestamp;
  
  // Related entities
  relatedUserId?: string;
  relatedCampaignId?: string;
  relatedTipId?: string;
  
  // Delivery
  deliveryMethod: ('push' | 'email' | 'in_app')[];
  deliveredAt?: Timestamp;
}

// Comment Document Schema
export interface CommentDocument extends BaseDocument {
  // Target
  targetType: 'tip' | 'campaign' | 'creator';
  targetId: string;
  parentCommentId?: string; // For replies
  
  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  
  // Content
  content: string;
  mentions: string[]; // User IDs mentioned
  
  // Engagement
  likes: number;
  likedBy: string[];
  replies: number;
  
  // Moderation
  status: 'active' | 'hidden' | 'deleted';
  moderatedBy?: string;
  moderationReason?: string;
  
  // Hierarchy
  depth: number; // For nested comments
  threadId: string; // Root comment ID
}

// Analytics Document Schema (for creators and campaigns)
export interface AnalyticsDocument extends BaseDocument {
  // Target
  entityType: 'creator' | 'campaign' | 'tip';
  entityId: string;
  
  // Time period
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Timestamp;
  
  // Metrics
  views: number;
  uniqueViews: number;
  engagement: number;
  shares: number;
  saves: number;
  
  // Audience
  audienceMetrics?: {
    ageGroups: { [key: string]: number };
    genders: { [key: string]: number };
    locations: { [key: string]: number };
  };
  
  // Revenue (for creators)
  revenue?: number;
  
  // Campaign specific
  applications?: number;
  conversions?: number;
  ctr?: number; // Click through rate
}

// Database Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CREATORS: 'creators', 
  CAMPAIGNS: 'campaigns',
  TIPS: 'tips',
  APPLICATIONS: 'applications',
  FOLLOWS: 'follows',
  NOTIFICATIONS: 'notifications',
  COMMENTS: 'comments',
  ANALYTICS: 'analytics'
} as const;

// Index Definitions for Firestore
export const FIRESTORE_INDEXES = [
  // Users
  { collection: 'users', fields: ['isCreator', 'createdAt'] },
  { collection: 'users', fields: ['location', 'isCreator'] },
  { collection: 'users', fields: ['followersCount', 'isCreator'] },
  
  // Creators
  { collection: 'creators', fields: ['category', 'followersCount'] },
  { collection: 'creators', fields: ['location', 'isVerified'] },
  { collection: 'creators', fields: ['status', 'availableForCampaigns'] },
  
  // Campaigns
  { collection: 'campaigns', fields: ['status', 'createdAt'] },
  { collection: 'campaigns', fields: ['category', 'status', 'deadline'] },
  { collection: 'campaigns', fields: ['budgetAmount', 'status'] },
  { collection: 'campaigns', fields: ['createdBy', 'status'] },
  
  // Tips
  { collection: 'tips', fields: ['status', 'createdAt'] },
  { collection: 'tips', fields: ['category', 'status'] },
  { collection: 'tips', fields: ['featured', 'createdAt'] },
  { collection: 'tips', fields: ['authorId', 'status'] },
  
  // Applications
  { collection: 'applications', fields: ['campaignId', 'status'] },
  { collection: 'applications', fields: ['userId', 'status'] },
  { collection: 'applications', fields: ['status', 'appliedAt'] },
  
  // Follows
  { collection: 'follows', fields: ['followerId', 'followedAt'] },
  { collection: 'follows', fields: ['followingId', 'followedAt'] },
  
  // Notifications
  { collection: 'notifications', fields: ['userId', 'read', 'createdAt'] },
  { collection: 'notifications', fields: ['type', 'createdAt'] },
  
  // Comments
  { collection: 'comments', fields: ['targetType', 'targetId', 'createdAt'] },
  { collection: 'comments', fields: ['authorId', 'createdAt'] },
  { collection: 'comments', fields: ['parentCommentId', 'createdAt'] },
  
  // Analytics
  { collection: 'analytics', fields: ['entityType', 'entityId', 'period', 'date'] }
];

// Security Rules Template
export const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Others can read basic profile info
    }
    
    // Creators are publicly readable, but only owner can write
    match /creators/{creatorId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == creatorId || 
         request.auth.uid == resource.data.userId);
    }
    
    // Campaigns are publicly readable, creator can write their own
    match /campaigns/{campaignId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         request.auth.uid in resource.data.managedBy);
      allow create: if request.auth != null;
    }
    
    // Tips are publicly readable, author can write their own
    match /tips/{tipId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Applications - creator can read/write their own, campaign owner can read all
    match /applications/{applicationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == get(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)).data.createdBy);
      allow create: if request.auth != null;
    }
    
    // Follows - users can manage their own relationships
    match /follows/{followId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.followerId ||
         request.auth.uid == resource.data.followingId);
      allow create: if request.auth != null;
    }
    
    // Notifications - users can read their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Comments - publicly readable, authenticated users can write
    match /comments/{commentId} {
      allow read: if resource.data.status == 'active';
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Analytics - only owners can read their analytics
    match /analytics/{analyticsId} {
      allow read: if request.auth != null && 
        request.auth.uid == get(/databases/$(database)/documents/\${resource.data.entityType}s/\${resource.data.entityId}).data.userId;
    }
  }
}
`;

export default {
  COLLECTIONS,
  FIRESTORE_INDEXES,
  FIRESTORE_SECURITY_RULES
};