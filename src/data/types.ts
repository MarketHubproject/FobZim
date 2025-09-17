export type Niche = "Comedy" | "Music" | "Fashion" | "Lifestyle" | "Tech";

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  niche: Niche;
  followers: number;
  location: string;
  spotlight?: boolean;
  bio?: string;
  instagramHandle?: string;
  tikTokHandle?: string;
  youtubeHandle?: string;
}

export interface Campaign {
  id: string;
  brand: string;
  title: string;
  description: string;
  niche: Niche;
  budgetUSD: number;
  deadlineISO: string;
  image: string;
  requirements?: string[];
  contactEmail?: string;
}

export interface Trend {
  id: string;
  hashtag: string;
  description: string;
  postsCount: number;
  category: "Challenge" | "Topic" | "Idea";
  relatedNiches?: Niche[];
}

export interface Post {
  id: string;
  creatorId: string;
  image: string;
  caption: string;
  likes: number;
  timestampISO: string;
  platform?: "instagram" | "tiktok" | "youtube";
}

export interface UserProfile {
  name: string;
  bio: string;
  nicheInterests: Niche[];
  email?: string;
  phone?: string;
}

export interface AppPreferences {
  selectedNiches: Niche[];
  showOnlySpotlight: boolean;
  notificationsEnabled: boolean;
}

// Form types
export interface CampaignApplicationForm {
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  pitch: string;
  expectedRateUSD: number;
}