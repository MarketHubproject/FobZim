"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateData = migrateData;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../config/firebase");
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
// Sample data for migration
const sampleCreators = [
    {
        userId: 'creator-1',
        name: 'Tatenda Mukamuri',
        username: 'tatenda_muke',
        email: 'tatenda@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        category: 'Lifestyle',
        description: 'Creating content about Zimbabwean culture and lifestyle. Passionate about showcasing the beauty of our traditions.',
        followers: 15000,
        following: 250,
        totalTips: 450000,
        location: 'Harare',
        isVerified: true,
        rating: 4.8,
        socialLinks: {
            instagram: '@tatenda_muke',
            tiktok: '@tatenda_muke',
            youtube: 'TatendaMuke'
        },
        portfolio: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
        ],
        rates: {
            post: 50000,
            story: 20000,
            video: 80000
        }
    },
    {
        userId: 'creator-2',
        name: 'Chipo Mutindi',
        username: 'chipo_recipes',
        email: 'chipo@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        category: 'Food',
        description: 'Traditional Zimbabwean recipes with a modern twist. Bringing sadza and relish to the digital age!',
        followers: 8200,
        following: 180,
        totalTips: 280000,
        location: 'Bulawayo',
        isVerified: false,
        rating: 4.6,
        socialLinks: {
            instagram: '@chipo_recipes',
            tiktok: '@chiporecipes'
        },
        portfolio: [
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300'
        ],
        rates: {
            post: 35000,
            story: 15000,
            video: 60000
        }
    },
    {
        userId: 'creator-3',
        name: 'Tinotenda Chipere',
        username: 'tino_tech',
        email: 'tino@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        category: 'Tech',
        description: 'Tech reviews and programming tutorials. Making technology accessible to everyone in Zimbabwe.',
        followers: 12000,
        following: 320,
        totalTips: 380000,
        location: 'Harare',
        isVerified: true,
        rating: 4.9,
        socialLinks: {
            instagram: '@tino_tech',
            youtube: 'TinoTech',
            twitter: '@tino_tech'
        },
        portfolio: [
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300',
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300'
        ],
        rates: {
            post: 45000,
            story: 18000,
            video: 75000
        }
    },
    {
        userId: 'creator-4',
        name: 'Rudo Makoni',
        username: 'rudo_style',
        email: 'rudo@example.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        category: 'Fashion',
        description: 'Fashion stylist showcasing African prints and modern wear. Celebrating Zimbabwean fashion heritage.',
        followers: 22000,
        following: 450,
        totalTips: 620000,
        location: 'Harare',
        isVerified: true,
        rating: 4.7,
        socialLinks: {
            instagram: '@rudo_style',
            tiktok: '@rudostyle',
            pinterest: 'RudoStyle'
        },
        portfolio: [
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300',
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300'
        ],
        rates: {
            post: 60000,
            story: 25000,
            video: 95000
        }
    },
    {
        userId: 'creator-5',
        name: 'Kudzai Mhere',
        username: 'kudzai_beats',
        email: 'kudzai@example.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        category: 'Music',
        description: 'Musician and content creator promoting Zimbabwean music. From traditional mbira to modern afro-pop.',
        followers: 35000,
        following: 180,
        totalTips: 890000,
        location: 'Gweru',
        isVerified: true,
        rating: 4.9,
        socialLinks: {
            instagram: '@kudzai_beats',
            youtube: 'KudzaiBeats',
            spotify: 'KudzaiMhere',
            soundcloud: 'kudzaibeats'
        },
        portfolio: [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300'
        ],
        rates: {
            post: 70000,
            story: 30000,
            video: 120000
        }
    }
];
const sampleCampaigns = [
    {
        brandId: 'brand-1',
        brandName: 'EcoCash',
        title: 'Digital Payments Awareness Campaign',
        description: 'Promote digital payment solutions across Zimbabwe. Show how EcoCash makes everyday transactions easier and safer.',
        budget: 800000,
        category: 'Finance',
        deadline: new Date('2024-03-15'),
        status: 'active',
        requirements: [
            'Minimum 10,000 followers',
            'Finance or lifestyle content niche',
            'Must be based in Zimbabwe',
            'Previous brand collaboration experience preferred'
        ],
        deliverables: [
            '2 feed posts showcasing EcoCash features',
            '4 Instagram stories demonstrating app usage',
            '1 video tutorial (30-60 seconds)'
        ],
        targetAudience: 'Young professionals aged 18-35',
        applicationCount: 45,
        tags: ['fintech', 'digital payments', 'convenience'],
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300'
    },
    {
        brandId: 'brand-2',
        brandName: 'Delta Corporation',
        title: 'Mazoe Orange Crush Summer Campaign',
        description: 'Celebrate summer with Mazoe Orange Crush. Show refreshing moments and family gatherings with our iconic orange drink.',
        budget: 1200000,
        category: 'Food & Beverage',
        deadline: new Date('2024-02-28'),
        status: 'active',
        requirements: [
            'Minimum 5,000 followers',
            'Family or lifestyle content',
            'Active engagement with audience',
            'Must showcase product authentically'
        ],
        deliverables: [
            '3 Instagram posts with Mazoe products',
            '6 Instagram stories showing consumption moments',
            '1 Reel showing recipe or creative use'
        ],
        targetAudience: 'Families and young adults',
        applicationCount: 67,
        tags: ['beverages', 'family', 'summer', 'refreshing'],
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300'
    },
    {
        brandId: 'brand-3',
        brandName: 'NetOne',
        title: 'OneFusion Data Bundles Promotion',
        description: 'Promote affordable data packages for young professionals and students. Highlight speed, reliability, and value.',
        budget: 900000,
        category: 'Telecommunications',
        deadline: new Date('2024-02-20'),
        status: 'active',
        requirements: [
            'Minimum 8,000 followers',
            'Tech or lifestyle content',
            'Young audience demographic',
            'Good engagement rate'
        ],
        deliverables: [
            '2 educational posts about data packages',
            '5 stories showing data usage scenarios',
            '1 video explaining OneFusion benefits'
        ],
        targetAudience: 'Students and young professionals aged 16-30',
        applicationCount: 78,
        tags: ['telecommunications', 'data', 'connectivity', 'youth'],
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'
    }
];
const sampleTips = [
    {
        title: 'Building Authentic Engagement with Zimbabwean Audiences',
        content: `Focus on creating genuine connections with your audience by responding to comments, asking questions, and sharing personal stories that resonate with Zimbabwean culture.

Key strategies:
• Use local languages (Shona, Ndebele) in your captions
• Reference local events and celebrations
• Share relatable everyday experiences
• Engage with followers' comments within 2 hours
• Ask questions about local preferences and experiences`,
        category: 'Engagement',
        author: 'ZimBuzz Team',
        likes: 324,
        views: 1200,
        tags: ['engagement', 'culture', 'authenticity']
    },
    {
        title: 'Content Consistency for Zimbabwean Creators',
        content: `Post regularly and maintain a consistent visual style that reflects Zimbabwean culture and values.

Tips for consistency:
• Create a content calendar with local holidays
• Use colors inspired by our flag and landscape
• Showcase Zimbabwe's natural beauty regularly
• Post at times when your Zimbabwean audience is active
• Develop signature hashtags for your brand`,
        category: 'Content Strategy',
        author: 'Tatenda M.',
        likes: 256,
        views: 980,
        tags: ['content', 'strategy', 'branding', 'zimbabwe']
    },
    {
        title: 'Collaborating with Local Zimbabwean Brands',
        content: `Reach out to Zimbabwean brands that align with your values. Show how their products fit into everyday Zimbabwean life for authentic partnerships.

Approach brands with:
• Media kit showing your local audience demographics
• Examples of previous brand collaborations
• Creative ideas specific to their products
• Understanding of their target market
• Professional communication and follow-up`,
        category: 'Partnerships',
        author: 'Content Expert',
        likes: 189,
        views: 750,
        tags: ['partnerships', 'brands', 'collaboration', 'business']
    },
    {
        title: 'Using Zimbabwean Culture in Your Content',
        content: `Incorporate elements of Zimbabwean culture authentically into your content to connect with local audiences and stand out globally.

Cultural elements to include:
• Traditional music and dances
• Local food and cooking methods
• Festivals and celebrations
• Landscapes and landmarks
• Traditional crafts and art
• Local wisdom and proverbs`,
        category: 'Cultural Content',
        author: 'Cultural Advisor',
        likes: 445,
        views: 1500,
        tags: ['culture', 'tradition', 'zimbabwe', 'authenticity']
    },
    {
        title: 'Monetization Strategies for Zimbabwean Creators',
        content: `Explore various revenue streams suitable for the Zimbabwean market and your audience size.

Monetization options:
• Brand partnerships with local companies
• Sponsored content for international brands
• Selling digital products or courses
• Affiliate marketing for relevant products
• Creating subscription-based content
• Offering services like photography or consulting`,
        category: 'Monetization',
        author: 'Business Development',
        likes: 378,
        views: 1100,
        tags: ['monetization', 'income', 'business', 'creators']
    }
];
async function migrateData() {
    try {
        console.log('🚀 Starting data migration...');
        // Enable Firestore network
        await (0, firestore_1.enableNetwork)(db);
        console.log('✅ Firestore network enabled');
        // Create batch writes for better performance
        const batch = (0, firestore_1.writeBatch)(db);
        // Migrate creators
        console.log('📝 Migrating creators...');
        for (let i = 0; i < sampleCreators.length; i++) {
            const creator = sampleCreators[i];
            const creatorId = `creator_${i + 1}`;
            const creatorDoc = (0, firestore_1.doc)((0, firestore_1.collection)(db, 'creators'), creatorId);
            const creatorData = {
                id: creatorId,
                ...creator,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            batch.set(creatorDoc, creatorData);
        }
        // Migrate campaigns
        console.log('📝 Migrating campaigns...');
        for (let i = 0; i < sampleCampaigns.length; i++) {
            const campaign = sampleCampaigns[i];
            const campaignId = `campaign_${i + 1}`;
            const campaignDoc = (0, firestore_1.doc)((0, firestore_1.collection)(db, 'campaigns'), campaignId);
            const campaignData = {
                id: campaignId,
                ...campaign,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            batch.set(campaignDoc, campaignData);
        }
        // Migrate tips
        console.log('📝 Migrating tips...');
        for (let i = 0; i < sampleTips.length; i++) {
            const tip = sampleTips[i];
            const tipId = `tip_${i + 1}`;
            const tipDoc = (0, firestore_1.doc)((0, firestore_1.collection)(db, 'tips'), tipId);
            const tipData = {
                id: tipId,
                ...tip,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            batch.set(tipDoc, tipData);
        }
        // Commit all writes
        await batch.commit();
        console.log('✅ All data migrated successfully!');
        // Summary
        console.log('\n📊 Migration Summary:');
        console.log(`• ${sampleCreators.length} creators migrated`);
        console.log(`• ${sampleCampaigns.length} campaigns migrated`);
        console.log(`• ${sampleTips.length} tips migrated`);
        console.log('\n🎉 Database is ready for the ZimBuzz app!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
// Run migration if this file is executed directly
if (require.main === module) {
    migrateData()
        .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}
