import { collection, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  UserDocument, 
  CreatorDocument, 
  CampaignDocument, 
  TipDocument,
  COLLECTIONS 
} from './databaseSchema';

// Realistic Zimbabwean creator data
export const SEED_CREATORS: Omit<CreatorDocument, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: 'creator-1',
    name: 'Tatenda Mukamuri',
    username: 'tatenda_style',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop',
    bio: 'Zimbabwean lifestyle blogger showcasing the beauty of our culture, fashion, and daily life in Harare. Passionate about promoting local brands and celebrating African heritage.',
    location: 'Harare',
    category: 'Lifestyle',
    isVerified: true,
    verificationDate: new Date('2023-06-15') as any,
    followers: [],
    followersCount: 15400,
    avgEngagementRate: 7.8,
    totalViews: 245000,
    totalCampaigns: 23,
    contentCategories: ['Lifestyle', 'Fashion', 'Culture'],
    primaryAudience: {
      ageRange: '18-34',
      gender: 'Female (68%)',
      location: ['Harare', 'Bulawayo', 'Gweru']
    },
    socialMediaHandles: {
      instagram: { username: '@tatenda_style', followers: 15400, verified: true },
      twitter: { username: '@tatenda_muke', followers: 8200, verified: false },
      tiktok: { username: '@tatendastyle', followers: 22100, verified: true }
    },
    status: 'active',
    availableForCampaigns: true,
    rateCard: {
      postRate: 150,
      storyRate: 75,
      videoRate: 300,
      currency: 'USD'
    }
  },
  {
    userId: 'creator-2',
    name: 'Chipo Mutindi',
    username: 'chipo_kitchen',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    bio: 'Traditional Zimbabwean recipes with a modern twist! Join me as I explore our rich culinary heritage and teach you to cook authentic dishes from sadza to maputi.',
    location: 'Bulawayo',
    category: 'Food',
    isVerified: false,
    followers: [],
    followersCount: 8200,
    avgEngagementRate: 9.2,
    totalViews: 120000,
    totalCampaigns: 12,
    contentCategories: ['Food', 'Culture', 'Cooking'],
    primaryAudience: {
      ageRange: '25-45',
      gender: 'Female (72%)',
      location: ['Bulawayo', 'Victoria Falls', 'Harare']
    },
    socialMediaHandles: {
      instagram: { username: '@chipo_kitchen', followers: 8200, verified: false },
      youtube: { channel: 'Chipo\'s Kitchen', subscribers: 5600, verified: false },
      tiktok: { username: '@chipocooks', followers: 12800, verified: false }
    },
    status: 'active',
    availableForCampaigns: true,
    rateCard: {
      postRate: 80,
      storyRate: 40,
      videoRate: 180,
      currency: 'USD'
    }
  },
  {
    userId: 'creator-3',
    name: 'Tinotenda Chipere',
    username: 'tino_tech',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    bio: 'Tech reviewer and programmer from Harare. I cover the latest gadgets available in Zimbabwe, mobile money innovations, and teach coding to aspiring developers.',
    location: 'Harare',
    category: 'Tech',
    isVerified: true,
    verificationDate: new Date('2023-09-22') as any,
    followers: [],
    followersCount: 12000,
    avgEngagementRate: 6.5,
    totalViews: 180000,
    totalCampaigns: 18,
    contentCategories: ['Tech', 'Education', 'Reviews'],
    primaryAudience: {
      ageRange: '20-40',
      gender: 'Male (65%)',
      location: ['Harare', 'Gweru', 'Mutare']
    },
    socialMediaHandles: {
      instagram: { username: '@tino_tech', followers: 12000, verified: true },
      twitter: { username: '@tinochipere', followers: 18500, verified: true },
      youtube: { channel: 'Tino Tech ZW', subscribers: 9200, verified: false }
    },
    status: 'active',
    availableForCampaigns: true,
    rateCard: {
      postRate: 120,
      storyRate: 60,
      videoRate: 250,
      currency: 'USD'
    }
  },
  {
    userId: 'creator-4',
    name: 'Rudo Makoni',
    username: 'rudo_fashions',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
    bio: 'Fashion stylist and designer promoting African prints and contemporary Zimbabwean fashion. Showcasing local designers and helping women feel confident and beautiful.',
    location: 'Harare',
    category: 'Fashion',
    isVerified: true,
    verificationDate: new Date('2023-05-10') as any,
    followers: [],
    followersCount: 22000,
    avgEngagementRate: 8.9,
    totalViews: 320000,
    totalCampaigns: 31,
    contentCategories: ['Fashion', 'Style', 'Beauty'],
    primaryAudience: {
      ageRange: '20-35',
      gender: 'Female (85%)',
      location: ['Harare', 'Bulawayo', 'Gweru']
    },
    socialMediaHandles: {
      instagram: { username: '@rudo_fashions', followers: 22000, verified: true },
      tiktok: { username: '@rudostyle', followers: 28500, verified: true },
      twitter: { username: '@rudomakoni', followers: 11200, verified: false }
    },
    status: 'active',
    availableForCampaigns: true,
    rateCard: {
      postRate: 200,
      storyRate: 100,
      videoRate: 350,
      currency: 'USD'
    }
  },
  {
    userId: 'creator-5',
    name: 'Kudzai Mhere',
    username: 'kudzai_music',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    bio: 'Musician, producer, and content creator promoting Zimbabwean music culture. From traditional mbira to modern afro-fusion, I celebrate our musical heritage.',
    location: 'Gweru',
    category: 'Music',
    isVerified: true,
    verificationDate: new Date('2023-07-08') as any,
    followers: [],
    followersCount: 35000,
    avgEngagementRate: 11.2,
    totalViews: 450000,
    totalCampaigns: 19,
    contentCategories: ['Music', 'Culture', 'Entertainment'],
    primaryAudience: {
      ageRange: '18-35',
      gender: 'Mixed (52% Male)',
      location: ['Gweru', 'Harare', 'Bulawayo', 'Mutare']
    },
    socialMediaHandles: {
      instagram: { username: '@kudzai_music', followers: 35000, verified: true },
      youtube: { channel: 'Kudzai Mhere Music', subscribers: 42000, verified: true },
      tiktok: { username: '@kudzaibeats', followers: 67000, verified: true },
      twitter: { username: '@kudzaimhere', followers: 19000, verified: true }
    },
    status: 'active',
    availableForCampaigns: true,
    rateCard: {
      postRate: 300,
      storyRate: 150,
      videoRate: 500,
      currency: 'USD'
    }
  }
];

// Realistic campaign data from Zimbabwean brands
export const SEED_CAMPAIGNS: Omit<CampaignDocument, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'EcoCash Digital Payment Revolution',
    brand: 'EcoCash',
    description: 'Promote digital payments and cashless transactions across Zimbabwe. Showcase how EcoCash makes daily transactions easier and more secure.',
    longDescription: 'We are looking for authentic creators to demonstrate the convenience and security of EcoCash digital payments. Show your audience how to pay bills, send money, and make purchases using mobile money. Content should highlight the ease of use and nationwide acceptance.',
    budget: '$800 - $1,500',
    budgetAmount: 1150,
    currency: 'USD',
    paymentTerms: '50% upfront, 50% on completion',
    deadline: '2024-03-15',
    campaignStartDate: new Date('2024-02-01') as any,
    campaignEndDate: new Date('2024-03-31') as any,
    applicationDeadline: new Date('2024-02-10') as any,
    category: 'Finance',
    subcategories: ['Mobile Money', 'FinTech', 'Digital Services'],
    targetAudience: {
      ageRange: ['18-35', '36-50'],
      gender: ['Male', 'Female'],
      location: ['Harare', 'Bulawayo', 'Gweru', 'Mutare'],
      interests: ['Technology', 'Finance', 'Convenience']
    },
    requirements: [
      'Must have 5K+ followers',
      'Previous experience with financial content preferred',
      'Must demonstrate actual EcoCash usage',
      'Content must be in English or Shona',
      'Professional content quality required'
    ],
    deliverables: [
      { type: 'post', platform: 'Instagram', quantity: 2, specifications: 'Feed posts with carousel images showing payment process' },
      { type: 'story', platform: 'Instagram', quantity: 3, specifications: 'Story highlights demonstrating different payment methods' },
      { type: 'video', platform: 'TikTok', quantity: 1, specifications: '30-60 second tutorial video' }
    ],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
    ],
    status: 'active',
    createdBy: 'brand-ecocash-1',
    managedBy: ['brand-ecocash-1', 'marketing-manager-1'],
    applications: [],
    selectedCreators: [],
    rejectedApplications: [],
    maxApplications: 50,
    savedBy: [],
    views: 1250,
    applicationsCount: 0
  },
  {
    title: 'Delta Beverages Summer Campaign',
    brand: 'Delta Corporation',
    description: 'Celebrate summer with Delta beverages! Feature our refreshing drinks perfect for Zimbabwe\'s hot season.',
    longDescription: 'Looking for lifestyle creators to showcase Delta beverages as the perfect companion for summer activities. Content should feel authentic and show real moments of enjoyment with friends and family.',
    budget: '$600 - $1,200',
    budgetAmount: 900,
    currency: 'USD',
    paymentTerms: 'Payment on completion and approval',
    deadline: '2024-04-20',
    campaignStartDate: new Date('2024-03-01') as any,
    campaignEndDate: new Date('2024-04-30') as any,
    applicationDeadline: new Date('2024-02-25') as any,
    category: 'Food & Beverage',
    subcategories: ['Beverages', 'Lifestyle', 'Summer'],
    targetAudience: {
      ageRange: ['18-40'],
      gender: ['Male', 'Female'],
      location: ['Harare', 'Bulawayo'],
      interests: ['Lifestyle', 'Social', 'Food & Drink']
    },
    requirements: [
      'Active on Instagram and TikTok',
      'Lifestyle or food content creators preferred',
      'Must be 18+ years old',
      'Based in Harare or Bulawayo',
      'Authentic and engaging content style'
    ],
    deliverables: [
      { type: 'post', platform: 'Instagram', quantity: 1, specifications: 'High-quality lifestyle post featuring product' },
      { type: 'story', platform: 'Instagram', quantity: 2, specifications: 'Behind-the-scenes content' },
      { type: 'video', platform: 'TikTok', quantity: 1, specifications: 'Creative video showing product enjoyment' }
    ],
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
    status: 'active',
    createdBy: 'brand-delta-1',
    managedBy: ['brand-delta-1'],
    applications: [],
    selectedCreators: [],
    rejectedApplications: [],
    maxApplications: 30,
    savedBy: [],
    views: 890,
    applicationsCount: 0
  },
  {
    title: 'OK Zimbabwe Fresh Produce Campaign',
    brand: 'OK Zimbabwe',
    description: 'Promote healthy eating with fresh, local produce from OK stores. Showcase the quality and variety of fresh fruits and vegetables.',
    longDescription: 'We want to highlight the freshness and quality of produce available at OK Zimbabwe stores. Looking for food creators and health enthusiasts to create content around healthy cooking and eating using our fresh produce.',
    budget: '$400 - $800',
    budgetAmount: 600,
    currency: 'USD',
    paymentTerms: '100% on completion',
    deadline: '2024-03-30',
    campaignStartDate: new Date('2024-02-15') as any,
    campaignEndDate: new Date('2024-04-15') as any,
    applicationDeadline: new Date('2024-02-20') as any,
    category: 'Food & Beverage',
    subcategories: ['Healthy Eating', 'Cooking', 'Retail'],
    targetAudience: {
      ageRange: ['25-55'],
      gender: ['Female'],
      location: ['Harare', 'Bulawayo', 'Gweru'],
      interests: ['Cooking', 'Health', 'Family', 'Nutrition']
    },
    requirements: [
      'Food or lifestyle content creators',
      'Minimum 3K followers',
      'Experience with recipe content',
      'Must shop at OK Zimbabwe for content',
      'Family-friendly content only'
    ],
    deliverables: [
      { type: 'post', platform: 'Instagram', quantity: 2, specifications: 'Recipe posts using OK produce with ingredient showcase' },
      { type: 'story', platform: 'Instagram', quantity: 3, specifications: 'Shopping journey and cooking process' }
    ],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    status: 'active',
    createdBy: 'brand-ok-1',
    managedBy: ['brand-ok-1'],
    applications: [],
    selectedCreators: [],
    rejectedApplications: [],
    savedBy: [],
    views: 645,
    applicationsCount: 0
  }
];

// Educational and cultural tips content
export const SEED_TIPS: Omit<TipDocument, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Building Authentic Engagement with Zimbabwean Audiences',
    content: 'Creating authentic connections with your Zimbabwean audience requires understanding our diverse culture and values. Here are key strategies: 1) Use local languages like Shona and Ndebele in your captions when appropriate. 2) Reference local landmarks, events, and cultural celebrations. 3) Collaborate with other Zimbabwean creators to build community. 4) Share your personal story and journey as a Zimbabwean creator. 5) Respond to comments in a genuine, conversational manner. Remember, authenticity resonates more than perfection with Zimbabwean audiences.',
    excerpt: 'Learn how to create authentic connections with Zimbabwean audiences through cultural understanding and genuine engagement.',
    category: 'Engagement',
    tags: ['engagement', 'zimbabwe', 'audience', 'culture', 'authenticity'],
    author: 'ZimBuzz Team',
    authorId: 'zimbuzz-admin',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop',
    likes: 324,
    likedBy: [],
    savedBy: [],
    shares: 45,
    comments: 28,
    views: 1850,
    status: 'published',
    featured: true,
    featuredUntil: new Date('2024-12-31') as any,
    keywords: ['zimbabwe creators', 'audience engagement', 'local content', 'cultural content'],
    moderationStatus: 'approved',
    moderatedBy: 'admin-1'
  },
  {
    title: 'Content Consistency: The Key to Growing Your Zimbabwe-Based Following',
    content: 'Consistency is crucial for growing your following as a Zimbabwean content creator. Here\'s your roadmap to success: 1) Post regularly - aim for at least 3-4 times per week across platforms. 2) Maintain a consistent visual style using colors inspired by our flag or natural landscapes. 3) Create content themes for each day (e.g., #MotivationMonday with Shona proverbs, #ThrowbackThursday with Zimbabwean history). 4) Use consistent hashtags including #Zimbabwe #ZimCreators #ProudlyZimbabwean. 5) Engage with your community at consistent times when your audience is most active. Track your analytics to find your optimal posting times.',
    excerpt: 'Master the art of consistency to grow your Zimbabwean following with strategic posting and authentic local themes.',
    category: 'Content Strategy',
    tags: ['consistency', 'growth', 'posting schedule', 'zimbabwe', 'content planning'],
    author: 'Tatenda Mukamuri',
    authorId: 'creator-1',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
    likes: 256,
    likedBy: [],
    savedBy: [],
    shares: 38,
    comments: 19,
    views: 1420,
    status: 'published',
    featured: false,
    keywords: ['content consistency', 'zimbabwe content', 'social media growth', 'posting strategy'],
    moderationStatus: 'approved',
    moderatedBy: 'admin-1'
  },
  {
    title: 'Collaborating with Zimbabwean Brands: A Creator\'s Guide',
    content: 'Working with local Zimbabwean brands can be incredibly rewarding. Here\'s how to build successful partnerships: 1) Research the brand\'s values and ensure alignment with your personal brand. 2) Showcase genuine use of products - Zimbabwean audiences can spot fake endorsements easily. 3) Negotiate fair rates based on your reach and engagement (typical rates: $50-200 for micro-influencers, $200-500 for macro-influencers). 4) Always disclose partnerships with #ad or #sponsored. 5) Deliver content that tells a story, not just shows a product. 6) Follow up with performance metrics to build long-term relationships. Popular brands to approach: Delta, EcoCash, OK Zimbabwe, Steward Bank, and local fashion brands.',
    excerpt: 'Navigate brand partnerships successfully with this comprehensive guide to working with Zimbabwean companies.',
    category: 'Partnerships',
    tags: ['brand partnerships', 'collaborations', 'zimbabwe brands', 'sponsorship', 'monetization'],
    author: 'Content Expert',
    authorId: 'expert-1',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop',
    likes: 189,
    likedBy: [],
    savedBy: [],
    shares: 52,
    comments: 31,
    views: 1650,
    status: 'published',
    featured: true,
    featuredUntil: new Date('2024-06-30') as any,
    keywords: ['brand partnerships', 'zimbabwe marketing', 'influencer rates', 'sponsored content'],
    moderationStatus: 'approved',
    moderatedBy: 'admin-1'
  },
  {
    title: 'Using Traditional Zimbabwean Elements in Modern Content',
    content: 'Incorporate Zimbabwe\'s rich cultural heritage into your modern content to stand out and educate your audience: 1) Feature traditional attire in fashion content - showcase chitenge, dhuku, and other cultural clothing. 2) Use traditional music (mbira, marimba) in your videos while respecting cultural protocols. 3) Share stories and legends passed down through generations. 4) Highlight traditional foods and cooking methods alongside modern recipes. 5) Feature local artisans and craftspeople in your content. 6) Use Shona and Ndebele proverbs to add wisdom to your captions. 7) Document cultural celebrations and ceremonies (with permission). Remember to always approach cultural content with respect and authenticity.',
    excerpt: 'Bridge tradition and modernity by incorporating authentic Zimbabwean cultural elements into your content strategy.',
    category: 'Culture',
    tags: ['culture', 'tradition', 'zimbabwe heritage', 'authentic content', 'cultural respect'],
    author: 'Cultural Consultant',
    authorId: 'cultural-expert',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    likes: 298,
    likedBy: [],
    savedBy: [],
    shares: 67,
    comments: 42,
    views: 2100,
    status: 'published',
    featured: true,
    featuredUntil: new Date('2024-08-31') as any,
    keywords: ['zimbabwe culture', 'traditional elements', 'cultural content', 'heritage'],
    moderationStatus: 'approved',
    moderatedBy: 'admin-1'
  },
  {
    title: 'Monetizing Your Content in the Zimbabwean Market',
    content: 'Turn your passion into profit with these monetization strategies for Zimbabwean creators: 1) Brand partnerships with local companies (rates: $30-100 for nano-influencers, $100-300 for micro-influencers). 2) Affiliate marketing with international programs that accept Zimbabwean creators. 3) Create and sell digital products (courses, presets, templates) priced in USD. 4) Offer services like photography, content creation, or consulting. 5) Develop merchandise featuring Zimbabwean themes or your personal brand. 6) Host paid workshops or webinars. 7) Create subscription content or Patreon-style support. 8) Leverage multiple platforms - don\'t rely on just one income stream. Start small, reinvest your earnings, and gradually scale your monetization efforts.',
    excerpt: 'Discover practical ways to monetize your content and build a sustainable income as a Zimbabwean creator.',
    category: 'Monetization',
    tags: ['monetization', 'income', 'zimbabwe creators', 'brand deals', 'digital products'],
    author: 'Business Strategist',
    authorId: 'business-expert',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
    likes: 412,
    likedBy: [],
    savedBy: [],
    shares: 89,
    comments: 56,
    views: 2850,
    status: 'published',
    featured: true,
    featuredUntil: new Date('2024-12-31') as any,
    keywords: ['content monetization', 'zimbabwe income', 'creator economy', 'brand partnerships'],
    moderationStatus: 'approved',
    moderatedBy: 'admin-1'
  }
];

// Data migration class
export class DataMigrationService {
  private static instance: DataMigrationService;

  static getInstance(): DataMigrationService {
    if (!this.instance) {
      this.instance = new DataMigrationService();
    }
    return this.instance;
  }

  private constructor() {}

  // Migrate all seed data
  async migrateAllData(): Promise<void> {
    console.log('🚀 Starting data migration...');
    
    try {
      await this.migrateCreators();
      await this.migrateCampaigns();
      await this.migrateTips();
      
      console.log('✅ Data migration completed successfully!');
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      throw error;
    }
  }

  // Migrate creators data
  async migrateCreators(): Promise<void> {
    console.log('📝 Migrating creators...');
    
    for (const creator of SEED_CREATORS) {
      const creatorDoc: CreatorDocument = {
        ...creator,
        id: `creator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(
        doc(db, COLLECTIONS.CREATORS, creatorDoc.id),
        creatorDoc
      );
    }
    
    console.log(`✅ Migrated ${SEED_CREATORS.length} creators`);
  }

  // Migrate campaigns data
  async migrateCampaigns(): Promise<void> {
    console.log('🎯 Migrating campaigns...');
    
    for (const campaign of SEED_CAMPAIGNS) {
      const campaignDoc: CampaignDocument = {
        ...campaign,
        id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(
        doc(db, COLLECTIONS.CAMPAIGNS, campaignDoc.id),
        campaignDoc
      );
    }
    
    console.log(`✅ Migrated ${SEED_CAMPAIGNS.length} campaigns`);
  }

  // Migrate tips data
  async migrateTips(): Promise<void> {
    console.log('💡 Migrating tips...');
    
    for (const tip of SEED_TIPS) {
      const tipDoc: TipDocument = {
        ...tip,
        id: `tip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(
        doc(db, COLLECTIONS.TIPS, tipDoc.id),
        tipDoc
      );
    }
    
    console.log(`✅ Migrated ${SEED_TIPS.length} tips`);
  }

  // Clear all data (for development/testing)
  async clearAllData(): Promise<void> {
    console.log('🗑️ Clearing all data...');
    // Note: In a real implementation, you'd need to query and delete documents
    // This is a placeholder for the clear functionality
    console.log('⚠️ Clear data functionality needs to be implemented based on your needs');
  }

  // Verify migration
  async verifyMigration(): Promise<{ creators: number; campaigns: number; tips: number }> {
    // This would query the collections and return counts
    return {
      creators: SEED_CREATORS.length,
      campaigns: SEED_CAMPAIGNS.length,
      tips: SEED_TIPS.length
    };
  }
}

export default DataMigrationService;