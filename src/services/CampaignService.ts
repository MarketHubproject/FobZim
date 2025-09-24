/**
 * Campaign Service for ZimBuzz
 * Handles all campaign-related operations with Firestore integration
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  QueryConstraint,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Campaign,
  CampaignListItem,
  CampaignFormData,
  CampaignSearchParams,
  CampaignStats,
  CampaignApplication,
  CampaignActivity,
  CampaignStatus,
  CampaignCategory,
  ApplicationStatus
} from '../types/campaign';
import { UserProfile } from './authService';

// Use mock service for demo purposes
const USE_MOCK_CAMPAIGN_SERVICE = true;

// Mock data for demonstration
class MockCampaignService {
  private campaigns: Campaign[] = [
    {
      id: 'camp_001',
      title: 'Zimbabwe Tourism Campaign',
      description: 'Promote beautiful destinations across Zimbabwe through engaging content. We\'re looking for travel enthusiasts and lifestyle creators to showcase the hidden gems of our beautiful country.',
      briefDescription: 'Showcase Zimbabwe\'s hidden gems through engaging travel content',
      creatorId: 'user_123',
      creator: {
        uid: 'user_123',
        email: 'creator@zimbuzz.com',
        displayName: 'Zimbuzz Travel',
        photoURL: 'https://via.placeholder.com/150',
        isCreator: true,
        isVerified: true,
        followersCount: 50000,
        followingCount: 500,
        campaignsCompleted: 25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      brandName: 'Zimbabwe Tourism Board',
      category: CampaignCategory.TRAVEL,
      status: CampaignStatus.ACTIVE,
      priority: 'high' as any,
      deliverables: [
        {
          id: 'del_001',
          type: 'post',
          platform: 'instagram',
          description: '3 Instagram posts featuring different destinations',
          quantity: 3,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          specifications: {
            hashtags: ['#VisitZimbabwe', '#ZimbabweTourism', '#BeautifulZim'],
            mentions: ['@zimbabwe_tourism'],
            customInstructions: 'Include location tags and encourage tourism'
          }
        }
      ],
      requirements: [
        {
          id: 'req_001',
          type: 'follower_count',
          description: 'Minimum 5,000 followers',
          value: 5000,
          isRequired: true
        }
      ],
      rewards: [
        {
          type: 'monetary',
          value: 500,
          description: '$500 USD for completed campaign'
        }
      ],
      budget: {
        min: 500,
        max: 500,
        currency: 'USD'
      },
      applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      location: {
        country: 'Zimbabwe',
        city: 'Harare',
        region: 'Harare Province',
        isRemote: false
      },
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800'
      ],
      metrics: {
        views: 1250,
        applications: 8,
        shares: 25,
        saves: 45,
        clicks: 120
      },
      settings: {
        isPublic: true,
        allowDirectApplications: true,
        requirePortfolio: true,
        autoApproval: false,
        maxApplicants: 10
      },
      tags: ['travel', 'zimbabwe', 'tourism', 'lifestyle'],
      keywords: ['zimbabwe', 'travel', 'tourism', 'destinations'],
      isActive: true,
      isFeatured: true,
      isPromoted: false
    },
    {
      id: 'camp_002',
      title: 'Local Fashion Brand Collaboration',
      description: 'Partner with emerging Zimbabwean fashion designers to create stunning lookbooks and promote local fashion talent.',
      briefDescription: 'Promote emerging Zimbabwean fashion through creative content',
      creatorId: 'user_456',
      creator: {
        uid: 'user_456',
        email: 'fashion@zimbuzz.com',
        displayName: 'ZimStyle Collective',
        photoURL: 'https://via.placeholder.com/150',
        isCreator: true,
        isVerified: true,
        followersCount: 25000,
        followingCount: 300,
        campaignsCompleted: 15,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      category: CampaignCategory.FASHION,
      status: CampaignStatus.ACTIVE,
      priority: 'medium' as any,
      deliverables: [
        {
          id: 'del_002',
          type: 'post',
          platform: 'instagram',
          description: 'Fashion lookbook posts featuring local designs',
          quantity: 5,
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        }
      ],
      requirements: [
        {
          id: 'req_002',
          type: 'location',
          description: 'Must be based in Zimbabwe',
          value: 'Zimbabwe',
          isRequired: true
        }
      ],
      rewards: [
        {
          type: 'product',
          description: 'Free clothing pieces worth $200 + $300 cash',
          quantity: 5
        }
      ],
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      location: {
        country: 'Zimbabwe',
        isRemote: true
      },
      images: [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'
      ],
      metrics: {
        views: 850,
        applications: 12,
        shares: 18,
        saves: 32,
        clicks: 85
      },
      settings: {
        isPublic: true,
        allowDirectApplications: true,
        requirePortfolio: false,
        autoApproval: false
      },
      tags: ['fashion', 'zimbabwe', 'local', 'designers'],
      keywords: ['fashion', 'style', 'zimbabwe', 'local'],
      isActive: true,
      isFeatured: false,
      isPromoted: true
    }
  ];

  private applications: CampaignApplication[] = [
    {
      id: 'app_001',
      campaignId: 'camp_001',
      applicantId: 'user_789',
      status: ApplicationStatus.PENDING,
      applicationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      message: 'I\'m excited to showcase Zimbabwe\'s beautiful destinations!',
      portfolio: ['https://instagram.com/zimtravel', 'https://example.com/portfolio'],
      creatorRate: 500,
      // New required fields
      creatorId: 'user_789',
      creatorName: 'Travel Creator',
      creatorEmail: 'creator@example.com',
      creatorPhoto: 'https://via.placeholder.com/48'
    }
  ];

  async createCampaign(campaignData: CampaignFormData, creatorId: string): Promise<Campaign> {
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      ...campaignData,
      creatorId,
      status: CampaignStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        views: 0,
        applications: 0,
        shares: 0,
        saves: 0,
        clicks: 0
      },
      isActive: true,
      isFeatured: false,
      isPromoted: false,
      keywords: campaignData.tags,
      images: campaignData.images as string[]
    };

    this.campaigns.push(campaign);
    return campaign;
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return this.campaigns.find(c => c.id === campaignId) || null;
  }

  async getCampaigns(params: CampaignSearchParams = {}): Promise<{
    campaigns: CampaignListItem[];
    hasMore: boolean;
    total: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredCampaigns = [...this.campaigns];
    
    // Apply filters
    if (params.category?.length) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        params.category!.includes(c.category)
      );
    }
    
    if (params.status?.length) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        params.status!.includes(c.status)
      );
    }
    
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    
    filteredCampaigns.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'createdAt':
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
          break;
        case 'deadline':
          aVal = a.applicationDeadline.getTime();
          bVal = b.applicationDeadline.getTime();
          break;
        case 'applications':
          aVal = a.metrics.applications;
          bVal = b.metrics.applications;
          break;
        default:
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Paginate
    const page = params.page || 1;
    const limitNum = params.limit || 10;
    const startIndex = (page - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    
    // Convert to list items
    const campaignListItems: CampaignListItem[] = paginatedCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      briefDescription: campaign.briefDescription,
      category: campaign.category,
      status: campaign.status,
      creator: campaign.creator ? {
        displayName: campaign.creator.displayName,
        photoURL: campaign.creator.photoURL,
        isVerified: campaign.creator.isVerified
      } : undefined,
      rewards: campaign.rewards.map(r => ({
        type: r.type,
        value: r.value,
        description: r.description
      })),
      applicationDeadline: campaign.applicationDeadline,
      location: campaign.location ? {
        city: campaign.location.city,
        country: campaign.location.country,
        isRemote: campaign.location.isRemote
      } : undefined,
      images: campaign.images.slice(0, 1), // Just first image for list
      metrics: {
        views: campaign.metrics.views,
        applications: campaign.metrics.applications
      },
      createdAt: campaign.createdAt,
      isFeatured: campaign.isFeatured
    }));

    return {
      campaigns: campaignListItems,
      hasMore: endIndex < filteredCampaigns.length,
      total: filteredCampaigns.length
    };
  }

  async updateCampaign(campaignId: string, updates: Partial<CampaignFormData>): Promise<Campaign> {
    const campaignIndex = this.campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    this.campaigns[campaignIndex] = {
      ...this.campaigns[campaignIndex],
      ...updates,
      updatedAt: new Date(),
      images: updates.images ? updates.images as string[] : this.campaigns[campaignIndex].images
    };

    return this.campaigns[campaignIndex];
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    const campaignIndex = this.campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }
    this.campaigns.splice(campaignIndex, 1);
  }

  async applyToCampaign(campaignId: string, applicantId: string, applicationData: {
    message?: string;
    portfolio?: string[];
    creatorRate?: number;
  }): Promise<CampaignApplication> {
    const application: CampaignApplication = {
      id: `app_${Date.now()}`,
      campaignId,
      applicantId,
      status: ApplicationStatus.PENDING,
      applicationDate: new Date(),
      creatorId: applicantId,
      creatorName: 'Mock Creator',
      creatorEmail: 'creator@example.com',
      message: applicationData.message || '',
      ...applicationData
    };

    this.applications.push(application);
    
    // Update campaign metrics
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.metrics.applications++;
    }

    return application;
  }

  async getCampaignStats(creatorId: string): Promise<CampaignStats> {
    const userCampaigns = this.campaigns.filter(c => c.creatorId === creatorId);
    const totalApplications = this.applications.filter(app => 
      userCampaigns.some(c => c.id === app.campaignId)
    ).length;

    return {
      totalCampaigns: userCampaigns.length,
      activeCampaigns: userCampaigns.filter(c => c.status === CampaignStatus.ACTIVE).length,
      completedCampaigns: userCampaigns.filter(c => c.status === CampaignStatus.COMPLETED).length,
      totalApplications,
      averageApplications: userCampaigns.length > 0 ? totalApplications / userCampaigns.length : 0,
      totalViews: userCampaigns.reduce((sum, c) => sum + c.metrics.views, 0),
      conversionRate: 0.065, // Mock conversion rate
      averageRating: 4.8,
      topPerformingCategory: CampaignCategory.TRAVEL,
      recentActivity: {
        newApplications: 3,
        newViews: 125,
        period: 'week'
      }
    };
  }

  // Get campaign applications
  async getCampaignApplications(campaignId: string): Promise<CampaignApplication[]> {
    return this.applications.filter(app => app.campaignId === campaignId);
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    const application = this.applications.find(app => app.id === applicationId);
    if (application) {
      application.status = status;
    }
  }

  // Submit application
  async submitApplication(application: Omit<CampaignApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newApplication: CampaignApplication = {
      ...application,
      id: applicationId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.applications.push(newApplication);
    
    // Update campaign metrics
    const campaign = this.campaigns.find(c => c.id === application.campaignId);
    if (campaign) {
      campaign.metrics.applications++;
    }
    
    return applicationId;
  }
}

export class CampaignService {
  private static mockService = new MockCampaignService();

  // Create new campaign
  static async createCampaign(campaignData: CampaignFormData): Promise<string> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      const campaign = await this.mockService.createCampaign(campaignData, campaignData.creatorId || 'unknown');
      return campaign.id;
    }

    try {
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const campaign: Campaign = {
        id: campaignId,
        ...campaignData,
        creatorId: campaignData.creatorId || 'unknown',
        status: CampaignStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          views: 0,
          applications: 0,
          shares: 0,
          saves: 0,
          clicks: 0
        },
        isActive: true,
        isFeatured: false,
        isPromoted: false,
        keywords: campaignData.tags,
        images: campaignData.images as string[]
      };

      await setDoc(doc(db, 'campaigns', campaignId), {
        ...campaign,
        createdAt: Timestamp.fromDate(campaign.createdAt),
        updatedAt: Timestamp.fromDate(campaign.updatedAt),
        applicationDeadline: Timestamp.fromDate(campaign.applicationDeadline),
        campaignStartDate: Timestamp.fromDate(campaign.campaignStartDate),
        campaignEndDate: Timestamp.fromDate(campaign.campaignEndDate)
      });

      return campaign.id;
    } catch (error) {
      console.error('Create campaign error:', error);
      throw new Error('Failed to create campaign');
    }
  }

  // Get single campaign by ID
  static async getCampaign(campaignId: string): Promise<Campaign | null> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.getCampaign(campaignId);
    }

    try {
      const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
      
      if (!campaignDoc.exists()) {
        return null;
      }

      const data = campaignDoc.data();
      
      // Convert Timestamps back to Dates
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        applicationDeadline: data.applicationDeadline.toDate(),
        campaignStartDate: data.campaignStartDate.toDate(),
        campaignEndDate: data.campaignEndDate.toDate()
      } as Campaign;
    } catch (error) {
      console.error('Get campaign error:', error);
      return null;
    }
  }

  // Get campaigns with search and filtering
  static async getCampaigns(params: CampaignSearchParams = {}): Promise<{
    campaigns: CampaignListItem[];
    hasMore: boolean;
    total: number;
  }> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.getCampaigns(params);
    }

    try {
      const constraints: QueryConstraint[] = [];
      
      // Add filters
      if (params.category?.length) {
        constraints.push(where('category', 'in', params.category));
      }
      
      if (params.status?.length) {
        constraints.push(where('status', 'in', params.status));
      }
      
      if (params.creatorId) {
        constraints.push(where('creatorId', '==', params.creatorId));
      }

      // Add sorting
      const sortBy = params.sortBy || 'createdAt';
      const sortOrder = params.sortOrder || 'desc';
      constraints.push(orderBy(sortBy, sortOrder));

      // Add pagination
      const limitNum = params.limit || 10;
      constraints.push(limit(limitNum));

      const q = query(collection(db, 'campaigns'), ...constraints);
      const querySnapshot = await getDocs(q);

      const campaigns: CampaignListItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        campaigns.push({
          id: doc.id,
          title: data.title,
          briefDescription: data.briefDescription,
          category: data.category,
          status: data.status,
          creator: data.creator,
          rewards: data.rewards,
          applicationDeadline: data.applicationDeadline.toDate(),
          location: data.location,
          images: data.images?.slice(0, 1) || [],
          metrics: {
            views: data.metrics.views,
            applications: data.metrics.applications
          },
          createdAt: data.createdAt.toDate(),
          isFeatured: data.isFeatured
        });
      });

      return {
        campaigns,
        hasMore: campaigns.length === limitNum,
        total: campaigns.length // This would need a separate count query for exact total
      };
    } catch (error) {
      console.error('Get campaigns error:', error);
      throw new Error('Failed to fetch campaigns');
    }
  }

  // Update existing campaign
  static async updateCampaign(campaignId: string, updates: Partial<CampaignFormData>): Promise<Campaign> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.updateCampaign(campaignId, updates);
    }

    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(doc(db, 'campaigns', campaignId), updateData);
      
      // Return updated campaign
      const updatedCampaign = await this.getCampaign(campaignId);
      if (!updatedCampaign) {
        throw new Error('Campaign not found after update');
      }
      
      return updatedCampaign;
    } catch (error) {
      console.error('Update campaign error:', error);
      throw new Error('Failed to update campaign');
    }
  }

  // Delete campaign
  static async deleteCampaign(campaignId: string): Promise<void> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.deleteCampaign(campaignId);
    }

    try {
      await deleteDoc(doc(db, 'campaigns', campaignId));
    } catch (error) {
      console.error('Delete campaign error:', error);
      throw new Error('Failed to delete campaign');
    }
  }

  // Apply to campaign
  static async applyToCampaign(
    campaignId: string, 
    applicantId: string, 
    applicationData: {
      message?: string;
      portfolio?: string[];
      creatorRate?: number;
    }
  ): Promise<CampaignApplication> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.applyToCampaign(campaignId, applicantId, applicationData);
    }

    try {
      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const application: CampaignApplication = {
        id: applicationId,
        campaignId,
        applicantId,
        status: ApplicationStatus.PENDING,
        applicationDate: new Date(),
        creatorId: applicantId,
        creatorName: 'Creator Name',
        creatorEmail: 'creator@example.com',
        message: applicationData.message || '',
        ...applicationData
      };

      // Add application document
      await setDoc(doc(db, 'applications', applicationId), {
        ...application,
        applicationDate: Timestamp.fromDate(application.applicationDate!)
      });

      // Update campaign metrics
      await updateDoc(doc(db, 'campaigns', campaignId), {
        'metrics.applications': increment(1)
      });

      return application;
    } catch (error) {
      console.error('Apply to campaign error:', error);
      throw new Error('Failed to apply to campaign');
    }
  }

  // Get campaign statistics for creator dashboard
  static async getCampaignStats(creatorId: string): Promise<CampaignStats> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.getCampaignStats(creatorId);
    }

    try {
      // Get creator's campaigns
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('creatorId', '==', creatorId)
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      
      let totalCampaigns = 0;
      let activeCampaigns = 0;
      let completedCampaigns = 0;
      let totalViews = 0;
      let totalApplications = 0;

      campaignsSnapshot.forEach((doc) => {
        const campaign = doc.data();
        totalCampaigns++;
        totalViews += campaign.metrics.views;
        totalApplications += campaign.metrics.applications;
        
        if (campaign.status === CampaignStatus.ACTIVE) {
          activeCampaigns++;
        } else if (campaign.status === CampaignStatus.COMPLETED) {
          completedCampaigns++;
        }
      });

      return {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalApplications,
        averageApplications: totalCampaigns > 0 ? totalApplications / totalCampaigns : 0,
        totalViews,
        conversionRate: totalViews > 0 ? totalApplications / totalViews : 0,
        averageRating: 4.5, // This would come from a ratings collection
        topPerformingCategory: CampaignCategory.LIFESTYLE, // Would be calculated
        recentActivity: {
          newApplications: 0,
          newViews: 0,
          period: 'week'
        }
      };
    } catch (error) {
      console.error('Get campaign stats error:', error);
      throw new Error('Failed to fetch campaign statistics');
    }
  }

  // Real-time campaign updates
  static subscribeToCampaign(campaignId: string, callback: (campaign: Campaign | null) => void): () => void {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      // Mock subscription - call callback immediately with campaign data
      setTimeout(() => {
        this.mockService.getCampaign(campaignId).then(callback);
      }, 10);
      return () => {}; // Mock unsubscribe
    }

    return onSnapshot(doc(db, 'campaigns', campaignId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const campaign: Campaign = {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          applicationDeadline: data.applicationDeadline.toDate(),
          campaignStartDate: data.campaignStartDate.toDate(),
          campaignEndDate: data.campaignEndDate.toDate()
        } as Campaign;
        callback(campaign);
      } else {
        callback(null);
      }
    });
  }

  // Increment campaign view count
  static async incrementCampaignView(campaignId: string): Promise<void> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      // Mock implementation - find and increment
      const campaign = await this.mockService.getCampaign(campaignId);
      if (campaign) {
        campaign.metrics.views++;
      }
      return;
    }

    try {
      await updateDoc(doc(db, 'campaigns', campaignId), {
        'metrics.views': increment(1)
      });
    } catch (error) {
      console.error('Increment view error:', error);
    }
  }

  // Get applications for a campaign
  static async getCampaignApplications(campaignId: string): Promise<CampaignApplication[]> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.getCampaignApplications(campaignId);
    }

    try {
      const q = query(
        collection(db, 'applications'),
        where('campaignId', '==', campaignId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const applications: CampaignApplication[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          applicationDate: data.applicationDate?.toDate()
        } as CampaignApplication);
      });
      
      return applications;
    } catch (error) {
      console.error('Error getting campaign applications:', error);
      throw error;
    }
  }

  // Update application status
  static async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.updateApplicationStatus(applicationId, status);
    }

    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Submit application for a campaign
  static async submitApplication(application: Omit<CampaignApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (USE_MOCK_CAMPAIGN_SERVICE) {
      return this.mockService.submitApplication(application);
    }

    try {
      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const applicationDoc = {
        ...application,
        id: applicationId,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      await setDoc(doc(db, 'applications', applicationId), applicationDoc);
      
      // Update campaign metrics
      await updateDoc(doc(db, 'campaigns', application.campaignId), {
        'metrics.applications': increment(1)
      });
      
      return applicationId;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  // Get campaign by ID with alias for backward compatibility
  static async getCampaignById(campaignId: string): Promise<Campaign | null> {
    return this.getCampaign(campaignId);
  }
}

export default CampaignService;