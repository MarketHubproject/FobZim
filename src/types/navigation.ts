import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Main App Stack Navigation Types
export type RootStackParamList = {
  // Authentication
  Auth: undefined;
  
  // Main app
  Main: undefined;
  
  // Chat/Messaging screens
  ConversationList: undefined;
  Chat: {
    conversationId: string;
    participantName: string;
    participantAvatar?: string;
    participantId?: string;
    campaignId?: string;
    campaignTitle?: string;
    highlightMessageId?: string;
  };
  MessageSearch: {
    conversationId?: string;
    initialQuery?: string;
  };
  
  // Campaign related screens
  CampaignDetail: {
    campaignId: string;
  };
  CreateCampaign: undefined;
  EditCampaign: {
    campaignId: string;
  };
  
  // Profile screens
  UserProfile: {
    userId: string;
  };
  EditProfile: undefined;
  
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Other screens
  Settings: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

// Navigation prop types
export type RootStackNavigationProp<T extends keyof RootStackParamList> = 
  StackNavigationProp<RootStackParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;

// Specific screen navigation types
export type ChatScreenNavigationProp = RootStackNavigationProp<'Chat'>;
export type ChatScreenRouteProp = RootStackRouteProp<'Chat'>;

export type ConversationListNavigationProp = RootStackNavigationProp<'ConversationList'>;
export type ConversationListRouteProp = RootStackRouteProp<'ConversationList'>;

export type CampaignDetailNavigationProp = RootStackNavigationProp<'CampaignDetail'>;
export type CampaignDetailRouteProp = RootStackRouteProp<'CampaignDetail'>;

export type UserProfileNavigationProp = RootStackNavigationProp<'UserProfile'>;
export type UserProfileRouteProp = RootStackRouteProp<'UserProfile'>;

// Tab navigation types for main bottom tabs
export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Messaging stack types (nested in Messages tab)
export type MessagingStackParamList = {
  ConversationList: undefined;
  Chat: {
    conversationId: string;
    participantName: string;
    participantAvatar?: string;
    participantId?: string;
    campaignId?: string;
    campaignTitle?: string;
    highlightMessageId?: string;
  };
  MessageSearch: {
    conversationId?: string;
    initialQuery?: string;
  };
};

export type MessagingStackNavigationProp<T extends keyof MessagingStackParamList> = 
  StackNavigationProp<MessagingStackParamList, T>;