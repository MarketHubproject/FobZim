import { Timestamp } from 'firebase/firestore';

// Base interface for all documents
export interface BaseDocument {
  id: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// User interface for authentication and profile data
export interface User extends BaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  isCreator: boolean;
  isVerified: boolean;
  phone?: string;
  location?: string;
  bio?: string;
  preferences?: {
    categories: string[];
    locations: string[];
    notifications: {
      campaigns: boolean;
      tips: boolean;
      follows: boolean;
    };
  };
}

// Creator interface for content creators
export interface Creator extends BaseDocument {
  userId: string; // Reference to User document
  name: string;
  username: string;
  email: string;
  avatar: string;
  category: string;
  description: string;
  followers: number;
  following: number;
  totalTips: number;
  location: string;
  isVerified: boolean;
  rating?: number;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
    linkedin?: string;
    pinterest?: string;
    spotify?: string;
    soundcloud?: string;
  };
  portfolio: string[]; // Array of image URLs
  rates: {
    post: number;
    story: number;
    video: number;
  };
  tags?: string[];
  mediaKit?: {
    demographics: {
      ageRange: string;
      gender: string;
      location: string;
    };
    engagement: {
      avgLikes: number;
      avgComments: number;
      avgShares: number;
    };
  };
}

// Campaign interface for brand campaigns
export interface Campaign extends BaseDocument {
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: Date | Timestamp;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  requirements: string[];
  deliverables: string[];
  targetAudience: string;
  applicationCount: number;
  tags: string[];
  image?: string;
  location?: string;
  ageRange?: string;
  gender?: 'all' | 'male' | 'female';
  minFollowers?: number;
  maxBudget?: number;
  duration?: string;
}

// Tip interface for content creation tips
export interface Tip extends BaseDocument {
  title: string;
  content: string;
  category: string;
  author: string;
  likes: number;
  views: number;
  tags: string[];
  featured?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readTime?: number; // in minutes
}

// Follow relationship interface
export interface Follow extends BaseDocument {
  followerId: string; // User who follows
  followingId: string; // Creator being followed
}

// Notification interface
export interface Notification extends BaseDocument {
  userId: string;
  type: 'campaign' | 'tip' | 'follow' | 'application' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  data?: {
    campaignId?: string;
    tipId?: string;
    creatorId?: string;
    applicationId?: string;
  };
}

// Campaign Application interface
export interface CampaignApplication extends BaseDocument {
  campaignId: string;
  creatorId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  proposalText: string;
  proposedRate?: number;
  portfolio: string[];
  brandResponse?: string;
  completionProof?: string[];
  rating?: number;
  review?: string;
}

// Comment interface for tips and campaigns
export interface Comment extends BaseDocument {
  userId: string;
  userName: string;
  userAvatar?: string;
  parentId: string; // ID of tip, campaign, or creator
  parentType: 'tip' | 'campaign' | 'creator';
  content: string;
  likes: number;
  replies?: Comment[];
}

// Analytics interface for tracking
export interface Analytics extends BaseDocument {
  type: 'creator_view' | 'campaign_view' | 'tip_view' | 'application_submit';
  userId?: string;
  creatorId?: string;
  campaignId?: string;
  tipId?: string;
  metadata?: Record<string, any>;
}

// Saved items interface
export interface SavedItem extends BaseDocument {
  userId: string;
  itemId: string;
  itemType: 'campaign' | 'tip' | 'creator';
  title: string;
  image?: string;
}

// Message interface for direct messaging
export interface Message extends BaseDocument {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  editedAt?: Date | Timestamp;
  replyTo?: string; // Message ID being replied to
}

// Conversation interface
export interface Conversation extends BaseDocument {
  participants: string[]; // Array of user IDs
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date | Timestamp;
  };
  unreadCount: Record<string, number>; // userId -> unread count
}

// Report interface for content moderation
export interface Report extends BaseDocument {
  reporterId: string;
  reportedId: string; // Can be user, creator, campaign, tip, etc.
  reportedType: 'user' | 'creator' | 'campaign' | 'tip' | 'comment';
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
}

// Transaction interface for payments/tips
export interface Transaction extends BaseDocument {
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  type: 'tip' | 'campaign_payment' | 'subscription';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  referenceId?: string; // Campaign ID, tip ID, etc.
  paymentMethod: string;
  fees?: number;
  notes?: string;
}

// Brand interface
export interface Brand extends BaseDocument {
  name: string;
  email: string;
  logo?: string;
  website?: string;
  description?: string;
  industry: string;
  location?: string;
  contactPerson: string;
  phone?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  isVerified: boolean;
  campaignCount: number;
  totalBudget: number;
}

export default {
  User,
  Creator,
  Campaign,
  Tip,
  Follow,
  Notification,
  CampaignApplication,
  Comment,
  Analytics,
  SavedItem,
  Message,
  Conversation,
  Report,
  Transaction,
  Brand
};