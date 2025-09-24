import { 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  collection, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { testDb, firebaseTest } from '../config/firebase.test';
import { AuthTestUtils } from './auth.test';
import { Campaign, Message, Contribution } from '../types';

describe('Firebase Firestore Tests', () => {
  let testUser1: User;
  let testUser2: User;
  let testCampaignId: string;
  let testConversationId: string;
  let unsubscribes: Unsubscribe[] = [];

  beforeAll(async () => {
    // Create test users
    testUser1 = await AuthTestUtils.createTestUserWithProfile(
      'testuser1@example.com', 
      'password123', 
      { displayName: 'Test User 1', isCreator: true }
    );
    
    testUser2 = await AuthTestUtils.createTestUserWithProfile(
      'testuser2@example.com', 
      'password123', 
      { displayName: 'Test User 2', isCreator: false }
    );
  });

  beforeEach(async () => {
    // Clear subscriptions before each test
    unsubscribes.forEach(unsub => unsub());
    unsubscribes = [];
  });

  afterEach(async () => {
    // Clean up subscriptions after each test
    unsubscribes.forEach(unsub => unsub());
    unsubscribes = [];
  });

  afterAll(async () => {
    await firebaseTest.cleanup();
  });

  describe('Campaign Management', () => {
    test('should create a new campaign', async () => {
      const campaignData: Partial<Campaign> = {
        title: 'Test Campaign',
        description: 'This is a test campaign for Firebase testing',
        category: 'technology',
        targetAmount: 10000,
        currentAmount: 0,
        createdBy: testUser1.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        visibility: 'public',
        images: ['https://example.com/image1.jpg'],
        tags: ['test', 'firebase'],
        location: 'Test City',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        moderators: [testUser1.uid],
        participantIds: [],
        contributorCount: 0,
        shareCount: 0,
        viewCount: 0,
      };

      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        ...campaignData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      testCampaignId = campaignRef.id;
      
      expect(campaignRef.id).toBeTruthy();
      
      // Verify campaign was saved
      const campaignDoc = await getDoc(campaignRef);
      expect(campaignDoc.exists()).toBe(true);
      
      const savedCampaign = campaignDoc.data();
      expect(savedCampaign.title).toBe(campaignData.title);
      expect(savedCampaign.createdBy).toBe(testUser1.uid);
    });

    test('should update campaign data', async () => {
      // First create a campaign
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Original Campaign',
        description: 'Original description',
        createdBy: testUser1.uid,
        currentAmount: 0,
        targetAmount: 5000,
        createdAt: serverTimestamp(),
      });

      // Update the campaign
      await updateDoc(campaignRef, {
        title: 'Updated Campaign Title',
        description: 'Updated description',
        currentAmount: 1500,
        updatedAt: serverTimestamp(),
      });

      // Verify update
      const updatedDoc = await getDoc(campaignRef);
      const updatedData = updatedDoc.data();
      
      expect(updatedData?.title).toBe('Updated Campaign Title');
      expect(updatedData?.currentAmount).toBe(1500);
    });

    test('should query campaigns by category', async () => {
      // Create multiple campaigns with different categories
      await addDoc(collection(testDb, 'campaigns'), {
        title: 'Tech Campaign',
        category: 'technology',
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
        status: 'active',
      });

      await addDoc(collection(testDb, 'campaigns'), {
        title: 'Health Campaign',
        category: 'health',
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
        status: 'active',
      });

      // Query for technology campaigns
      const techQuery = query(
        collection(testDb, 'campaigns'),
        where('category', '==', 'technology'),
        where('status', '==', 'active')
      );

      const techSnapshot = await getDocs(techQuery);
      expect(techSnapshot.size).toBe(1);
      
      const techCampaign = techSnapshot.docs[0].data();
      expect(techCampaign.title).toBe('Tech Campaign');
    });

    test('should listen to real-time campaign updates', async () => {
      // Create a campaign
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Real-time Test Campaign',
        currentAmount: 0,
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
      });

      let updateCount = 0;
      const updates: any[] = [];

      // Set up real-time listener
      const unsubscribe = onSnapshot(campaignRef, (doc) => {
        if (doc.exists()) {
          updateCount++;
          updates.push(doc.data());
        }
      });
      unsubscribes.push(unsubscribe);

      // Wait for initial snapshot
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the campaign
      await updateDoc(campaignRef, {
        currentAmount: 500,
        updatedAt: serverTimestamp(),
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update again
      await updateDoc(campaignRef, {
        currentAmount: 1000,
        updatedAt: serverTimestamp(),
      });

      // Wait for final update
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(updateCount).toBeGreaterThanOrEqual(2);
      expect(updates[updates.length - 1].currentAmount).toBe(1000);
    });

    test('should delete a campaign', async () => {
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Campaign to Delete',
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
      });

      // Verify it exists
      let campaignDoc = await getDoc(campaignRef);
      expect(campaignDoc.exists()).toBe(true);

      // Delete it
      await deleteDoc(campaignRef);

      // Verify it's deleted
      campaignDoc = await getDoc(campaignRef);
      expect(campaignDoc.exists()).toBe(false);
    });
  });

  describe('Messaging System', () => {
    beforeEach(async () => {
      // Create a test conversation
      const conversationRef = await addDoc(collection(testDb, 'conversations'), {
        participants: [testUser1.uid, testUser2.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTimestamp: null,
      });
      testConversationId = conversationRef.id;
    });

    test('should create a conversation', async () => {
      const conversationDoc = await getDoc(doc(testDb, 'conversations', testConversationId));
      expect(conversationDoc.exists()).toBe(true);
      
      const conversationData = conversationDoc.data();
      expect(conversationData?.participants).toContain(testUser1.uid);
      expect(conversationData?.participants).toContain(testUser2.uid);
    });

    test('should send and receive messages', async () => {
      // Send a message
      const messageData: Partial<Message> = {
        conversationId: testConversationId,
        senderId: testUser1.uid,
        text: 'Hello, this is a test message!',
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
      };

      const messageRef = await addDoc(
        collection(testDb, 'conversations', testConversationId, 'messages'),
        {
          ...messageData,
          timestamp: serverTimestamp(),
        }
      );

      // Verify message was created
      const messageDoc = await getDoc(messageRef);
      expect(messageDoc.exists()).toBe(true);
      
      const savedMessage = messageDoc.data();
      expect(savedMessage.text).toBe(messageData.text);
      expect(savedMessage.senderId).toBe(testUser1.uid);
    });

    test('should query messages in chronological order', async () => {
      // Send multiple messages
      const messages = [
        { text: 'First message', senderId: testUser1.uid },
        { text: 'Second message', senderId: testUser2.uid },
        { text: 'Third message', senderId: testUser1.uid },
      ];

      for (const msg of messages) {
        await addDoc(
          collection(testDb, 'conversations', testConversationId, 'messages'),
          {
            ...msg,
            conversationId: testConversationId,
            timestamp: serverTimestamp(),
            type: 'text',
            status: 'sent',
          }
        );
        // Small delay to ensure timestamp order
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Query messages in order
      const messagesQuery = query(
        collection(testDb, 'conversations', testConversationId, 'messages'),
        orderBy('timestamp', 'asc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const retrievedMessages = messagesSnapshot.docs.map(doc => doc.data());
      
      expect(retrievedMessages).toHaveLength(3);
      expect(retrievedMessages[0].text).toBe('First message');
      expect(retrievedMessages[1].text).toBe('Second message');
      expect(retrievedMessages[2].text).toBe('Third message');
    });

    test('should handle campaign sharing in messages', async () => {
      // First create a campaign to share
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Shared Campaign',
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
      });

      // Send a message with campaign share
      const shareMessageData = {
        conversationId: testConversationId,
        senderId: testUser1.uid,
        text: 'Check out this campaign!',
        type: 'campaign_share',
        sharedCampaignId: campaignRef.id,
        timestamp: serverTimestamp(),
        status: 'sent',
      };

      const messageRef = await addDoc(
        collection(testDb, 'conversations', testConversationId, 'messages'),
        shareMessageData
      );

      // Verify the share message
      const messageDoc = await getDoc(messageRef);
      const messageData = messageDoc.data();
      
      expect(messageData?.type).toBe('campaign_share');
      expect(messageData?.sharedCampaignId).toBe(campaignRef.id);
    });
  });

  describe('Contributions Management', () => {
    beforeEach(async () => {
      // Create a test campaign for contributions
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Contribution Test Campaign',
        targetAmount: 10000,
        currentAmount: 0,
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
      });
      testCampaignId = campaignRef.id;
    });

    test('should create a contribution', async () => {
      const contributionData: Partial<Contribution> = {
        campaignId: testCampaignId,
        contributorId: testUser2.uid,
        amount: 500,
        type: 'monetary',
        status: 'confirmed',
        message: 'Great cause!',
        createdAt: new Date(),
        isAnonymous: false,
      };

      const contributionRef = await addDoc(collection(testDb, 'contributions'), {
        ...contributionData,
        createdAt: serverTimestamp(),
      });

      // Verify contribution was created
      const contributionDoc = await getDoc(contributionRef);
      expect(contributionDoc.exists()).toBe(true);
      
      const savedContribution = contributionDoc.data();
      expect(savedContribution.amount).toBe(500);
      expect(savedContribution.contributorId).toBe(testUser2.uid);
    });

    test('should query contributions by campaign', async () => {
      // Create multiple contributions for different campaigns
      const campaignRef2 = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Another Campaign',
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
      });

      // Contribution for campaign 1
      await addDoc(collection(testDb, 'contributions'), {
        campaignId: testCampaignId,
        contributorId: testUser2.uid,
        amount: 300,
        createdAt: serverTimestamp(),
      });

      // Contribution for campaign 2
      await addDoc(collection(testDb, 'contributions'), {
        campaignId: campaignRef2.id,
        contributorId: testUser2.uid,
        amount: 200,
        createdAt: serverTimestamp(),
      });

      // Query contributions for campaign 1
      const contributionsQuery = query(
        collection(testDb, 'contributions'),
        where('campaignId', '==', testCampaignId)
      );

      const contributionsSnapshot = await getDocs(contributionsQuery);
      expect(contributionsSnapshot.size).toBe(1);
      
      const contribution = contributionsSnapshot.docs[0].data();
      expect(contribution.amount).toBe(300);
    });
  });

  describe('Real-time Data Subscriptions', () => {
    test('should receive real-time updates for campaign list', async () => {
      const updates: any[] = [];
      
      // Set up real-time listener for all campaigns
      const campaignsQuery = query(collection(testDb, 'campaigns'));
      const unsubscribe = onSnapshot(campaignsQuery, (snapshot) => {
        const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updates.push(campaigns);
      });
      unsubscribes.push(unsubscribe);

      // Wait for initial snapshot
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialCount = updates[0]?.length || 0;

      // Add a new campaign
      await addDoc(collection(testDb, 'campaigns'), {
        title: 'Real-time Campaign',
        createdBy: testUser1.uid,
        createdAt: serverTimestamp(),
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(updates.length).toBeGreaterThan(1);
      expect(updates[updates.length - 1]).toHaveLength(initialCount + 1);
    });

    test('should receive real-time message updates', async () => {
      // Create a conversation first
      const conversationRef = await addDoc(collection(testDb, 'conversations'), {
        participants: [testUser1.uid, testUser2.uid],
        createdAt: serverTimestamp(),
      });

      const messageUpdates: any[] = [];
      
      // Set up real-time listener for messages
      const messagesQuery = query(
        collection(testDb, 'conversations', conversationRef.id, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        messageUpdates.push(messages);
      });
      unsubscribes.push(unsubscribe);

      // Wait for initial snapshot
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send a message
      await addDoc(collection(testDb, 'conversations', conversationRef.id, 'messages'), {
        text: 'Real-time test message',
        senderId: testUser1.uid,
        timestamp: serverTimestamp(),
        type: 'text',
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(messageUpdates.length).toBeGreaterThan(1);
      const latestMessages = messageUpdates[messageUpdates.length - 1];
      expect(latestMessages.some((msg: any) => msg.text === 'Real-time test message')).toBe(true);
    });
  });
});

// Test utilities for Firestore operations
export const FirestoreTestUtils = {
  /**
   * Create a test campaign
   */
  async createTestCampaign(creatorId: string, data?: Partial<Campaign>): Promise<string> {
    const campaignData = {
      title: 'Test Campaign',
      description: 'Test description',
      category: 'technology',
      targetAmount: 10000,
      currentAmount: 0,
      createdBy: creatorId,
      status: 'active',
      visibility: 'public',
      createdAt: serverTimestamp(),
      ...data
    };

    const campaignRef = await addDoc(collection(testDb, 'campaigns'), campaignData);
    return campaignRef.id;
  },

  /**
   * Create a test conversation
   */
  async createTestConversation(participants: string[]): Promise<string> {
    const conversationRef = await addDoc(collection(testDb, 'conversations'), {
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return conversationRef.id;
  },

  /**
   * Send a test message
   */
  async sendTestMessage(conversationId: string, senderId: string, text: string): Promise<string> {
    const messageRef = await addDoc(
      collection(testDb, 'conversations', conversationId, 'messages'),
      {
        conversationId,
        senderId,
        text,
        type: 'text',
        timestamp: serverTimestamp(),
        status: 'sent',
      }
    );
    return messageRef.id;
  },

  /**
   * Create a test contribution
   */
  async createTestContribution(campaignId: string, contributorId: string, amount: number): Promise<string> {
    const contributionRef = await addDoc(collection(testDb, 'contributions'), {
      campaignId,
      contributorId,
      amount,
      type: 'monetary',
      status: 'confirmed',
      createdAt: serverTimestamp(),
      isAnonymous: false,
    });
    return contributionRef.id;
  }
};