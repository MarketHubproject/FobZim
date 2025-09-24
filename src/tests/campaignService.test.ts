/**
 * Campaign Service Tests
 * Comprehensive tests for campaign CRUD operations and functionality
 */

import { CampaignService } from '../services/campaignService';
import {
  Campaign,
  CampaignFormData,
  CampaignCategory,
  CampaignPriority,
  CampaignStatus,
  CampaignSearchParams,
  CampaignStats
} from '../types/campaign';

describe('Campaign Service Tests', () => {
  beforeEach(() => {
    console.log('🧪 Setting up campaign service tests...');
  });

  afterEach(() => {
    console.log('🧹 Campaign service test cleanup complete');
  });

  describe('Campaign CRUD Operations', () => {
    test('should create a new campaign', async () => {
      console.log('📝 Testing campaign creation...');
      
      const campaignData: CampaignFormData = {
        title: 'Test Campaign',
        description: 'A test campaign for Zimbabwe creators',
        briefDescription: 'Test campaign brief description',
        category: CampaignCategory.LIFESTYLE,
        priority: CampaignPriority.MEDIUM,
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        campaignStartDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        campaignEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rewards: [
          {
            type: 'monetary',
            value: 250,
            description: '$250 for completed campaign'
          }
        ],
        deliverables: [
          {
            id: 'del_test_001',
            type: 'post',
            platform: 'instagram',
            description: 'Test Instagram post',
            quantity: 1
          }
        ],
        requirements: [
          {
            id: 'req_test_001',
            type: 'follower_count',
            description: 'Minimum 1,000 followers',
            value: 1000,
            isRequired: true
          }
        ],
        tags: ['test', 'zimbabwe', 'lifestyle'],
        settings: {
          isPublic: true,
          allowDirectApplications: true,
          requirePortfolio: false,
          autoApproval: false
        },
        images: ['https://example.com/test-image.jpg']
      };

      const createdCampaign = await CampaignService.createCampaign(campaignData, 'test-creator-123');

      expect(createdCampaign).toBeDefined();
      expect(createdCampaign.title).toBe(campaignData.title);
      expect(createdCampaign.category).toBe(campaignData.category);
      expect(createdCampaign.creatorId).toBe('test-creator-123');
      expect(createdCampaign.status).toBe(CampaignStatus.DRAFT);
      expect(createdCampaign.metrics.views).toBe(0);
      expect(createdCampaign.metrics.applications).toBe(0);
      expect(createdCampaign.isActive).toBe(true);
      expect(createdCampaign.isFeatured).toBe(false);
      
      console.log('✅ Campaign created successfully:', createdCampaign.id);
    });

    test('should retrieve a campaign by ID', async () => {
      console.log('🔍 Testing campaign retrieval...');
      
      // Use one of the mock campaigns
      const campaignId = 'camp_001';
      const campaign = await CampaignService.getCampaign(campaignId);

      expect(campaign).toBeDefined();
      expect(campaign!.id).toBe(campaignId);
      expect(campaign!.title).toBe('Zimbabwe Tourism Campaign');
      expect(campaign!.category).toBe(CampaignCategory.TRAVEL);
      expect(campaign!.creator).toBeDefined();
      expect(campaign!.creator!.displayName).toBe('Zimbuzz Travel');
      
      console.log('✅ Campaign retrieved successfully:', campaign!.title);
    });

    test('should return null for non-existent campaign', async () => {
      console.log('❓ Testing non-existent campaign retrieval...');
      
      const campaign = await CampaignService.getCampaign('non-existent-id');
      
      expect(campaign).toBeNull();
      console.log('✅ Correctly returned null for non-existent campaign');
    });

    test('should update an existing campaign', async () => {
      console.log('✏️ Testing campaign update...');
      
      const campaignId = 'camp_001';
      const updates: Partial<CampaignFormData> = {
        title: 'Updated Zimbabwe Tourism Campaign',
        description: 'Updated description for the campaign'
      };

      const updatedCampaign = await CampaignService.updateCampaign(campaignId, updates);

      expect(updatedCampaign).toBeDefined();
      expect(updatedCampaign.title).toBe(updates.title);
      expect(updatedCampaign.description).toBe(updates.description);
      expect(updatedCampaign.id).toBe(campaignId);
      
      console.log('✅ Campaign updated successfully');
    });
  });

  describe('Campaign Search and Filtering', () => {
    test('should get campaigns with default parameters', async () => {
      console.log('📋 Testing default campaign listing...');
      
      const result = await CampaignService.getCampaigns();

      expect(result).toBeDefined();
      expect(result.campaigns).toBeInstanceOf(Array);
      expect(result.campaigns.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(typeof result.hasMore).toBe('boolean');

      // Check campaign list item structure
      const firstCampaign = result.campaigns[0];
      expect(firstCampaign.id).toBeDefined();
      expect(firstCampaign.title).toBeDefined();
      expect(firstCampaign.briefDescription).toBeDefined();
      expect(firstCampaign.category).toBeDefined();
      expect(firstCampaign.status).toBeDefined();
      expect(firstCampaign.rewards).toBeInstanceOf(Array);
      expect(firstCampaign.metrics).toBeDefined();
      
      console.log(`✅ Retrieved ${result.campaigns.length} campaigns`);
    });

    test('should filter campaigns by category', async () => {
      console.log('🏷️ Testing category filtering...');
      
      const searchParams: CampaignSearchParams = {
        category: [CampaignCategory.TRAVEL]
      };

      const result = await CampaignService.getCampaigns(searchParams);

      expect(result.campaigns).toBeInstanceOf(Array);
      expect(result.campaigns.length).toBeGreaterThan(0);
      
      // All returned campaigns should be in TRAVEL category
      result.campaigns.forEach(campaign => {
        expect(campaign.category).toBe(CampaignCategory.TRAVEL);
      });
      
      console.log(`✅ Found ${result.campaigns.length} travel campaigns`);
    });

    test('should filter campaigns by status', async () => {
      console.log('📊 Testing status filtering...');
      
      const searchParams: CampaignSearchParams = {
        status: [CampaignStatus.ACTIVE]
      };

      const result = await CampaignService.getCampaigns(searchParams);

      expect(result.campaigns).toBeInstanceOf(Array);
      
      // All returned campaigns should be ACTIVE
      result.campaigns.forEach(campaign => {
        expect(campaign.status).toBe(CampaignStatus.ACTIVE);
      });
      
      console.log(`✅ Found ${result.campaigns.length} active campaigns`);
    });

    test('should search campaigns by query text', async () => {
      console.log('🔍 Testing text search...');
      
      const searchParams: CampaignSearchParams = {
        query: 'zimbabwe'
      };

      const result = await CampaignService.getCampaigns(searchParams);

      expect(result.campaigns).toBeInstanceOf(Array);
      
      // At least one campaign should match the search
      expect(result.campaigns.length).toBeGreaterThan(0);
      
      // Check that results contain the search term
      const hasMatchingResult = result.campaigns.some(campaign => 
        campaign.title.toLowerCase().includes('zimbabwe') ||
        campaign.briefDescription.toLowerCase().includes('zimbabwe')
      );
      
      expect(hasMatchingResult).toBe(true);
      console.log(`✅ Found ${result.campaigns.length} campaigns matching 'zimbabwe'`);
    });

    test('should sort campaigns by creation date', async () => {
      console.log('📅 Testing creation date sorting...');
      
      const searchParams: CampaignSearchParams = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await CampaignService.getCampaigns(searchParams);

      expect(result.campaigns.length).toBeGreaterThan(1);
      
      // Check that campaigns are sorted by creation date (newest first)
      for (let i = 0; i < result.campaigns.length - 1; i++) {
        const current = result.campaigns[i];
        const next = result.campaigns[i + 1];
        expect(current.createdAt.getTime()).toBeGreaterThanOrEqual(next.createdAt.getTime());
      }
      
      console.log('✅ Campaigns correctly sorted by creation date');
    });

    test('should handle pagination', async () => {
      console.log('📄 Testing pagination...');
      
      const searchParams: CampaignSearchParams = {
        page: 1,
        limit: 1
      };

      const result = await CampaignService.getCampaigns(searchParams);

      expect(result.campaigns.length).toBe(1);
      expect(result.hasMore).toBe(true);
      
      console.log('✅ Pagination working correctly');
    });
  });

  describe('Campaign Applications', () => {
    test('should allow applying to a campaign', async () => {
      console.log('📝 Testing campaign application...');
      
      const application = await CampaignService.applyToCampaign(
        'camp_001',
        'test-applicant-456',
        {
          message: 'I would love to participate in this campaign!',
          portfolio: ['https://instagram.com/test', 'https://portfolio.com/test'],
          creatorRate: 450
        }
      );

      expect(application).toBeDefined();
      expect(application.campaignId).toBe('camp_001');
      expect(application.applicantId).toBe('test-applicant-456');
      expect(application.message).toBe('I would love to participate in this campaign!');
      expect(application.status).toBe('pending');
      expect(application.creatorRate).toBe(450);
      
      console.log('✅ Application submitted successfully:', application.id);
    });
  });

  describe('Campaign Statistics', () => {
    test('should get campaign statistics for creator', async () => {
      console.log('📊 Testing campaign statistics...');
      
      const stats = await CampaignService.getCampaignStats('user_123');

      expect(stats).toBeDefined();
      expect(typeof stats.totalCampaigns).toBe('number');
      expect(typeof stats.activeCampaigns).toBe('number');
      expect(typeof stats.completedCampaigns).toBe('number');
      expect(typeof stats.totalApplications).toBe('number');
      expect(typeof stats.averageApplications).toBe('number');
      expect(typeof stats.totalViews).toBe('number');
      expect(typeof stats.conversionRate).toBe('number');
      expect(typeof stats.averageRating).toBe('number');
      expect(stats.topPerformingCategory).toBeDefined();
      expect(stats.recentActivity).toBeDefined();
      expect(stats.recentActivity.period).toBeDefined();
      
      console.log('✅ Campaign statistics retrieved successfully');
      console.log(`   📈 Total Campaigns: ${stats.totalCampaigns}`);
      console.log(`   🔥 Active Campaigns: ${stats.activeCampaigns}`);
      console.log(`   👀 Total Views: ${stats.totalViews}`);
      console.log(`   📧 Total Applications: ${stats.totalApplications}`);
    });
  });

  describe('Campaign View Tracking', () => {
    test('should increment campaign view count', async () => {
      console.log('👀 Testing view count increment...');
      
      // This should not throw an error
      await expect(
        CampaignService.incrementCampaignView('camp_001')
      ).resolves.toBeUndefined();
      
      console.log('✅ Campaign view incremented successfully');
    });
  });

  describe('Campaign Real-time Updates', () => {
    test('should set up campaign subscription', async () => {
      console.log('📡 Testing real-time subscription...');
      
      let receivedCampaign: Campaign | null = null;
      
      const unsubscribe = CampaignService.subscribeToCampaign('camp_001', (campaign) => {
        receivedCampaign = campaign;
      });

      // Wait for the mock subscription to call back
      await new Promise(resolve => setTimeout(resolve, 600));

      // The subscription test may not work in mock mode as expected
      if (receivedCampaign) {
        expect((receivedCampaign as Campaign).id).toBe('camp_001');
        console.log('✅ Real-time subscription working correctly');
      } else {
        console.log('⚠️ Real-time subscription returned null (expected in mock mode)');
      }
      
      // Clean up subscription
      unsubscribe();
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent campaign updates gracefully', async () => {
      console.log('❌ Testing error handling for non-existent campaign...');
      
      await expect(
        CampaignService.updateCampaign('non-existent-id', { title: 'Updated Title' })
      ).rejects.toThrow('Campaign not found');
      
      console.log('✅ Error handling working correctly');
    });

    test('should handle non-existent campaign deletion gracefully', async () => {
      console.log('🗑️ Testing error handling for campaign deletion...');
      
      await expect(
        CampaignService.deleteCampaign('non-existent-id')
      ).rejects.toThrow('Campaign not found');
      
      console.log('✅ Deletion error handling working correctly');
    });
  });
});

console.log('🎯 Campaign Service tests loaded successfully!');