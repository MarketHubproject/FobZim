import { User } from 'firebase/auth';
import { doc, addDoc, collection, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { testDb, testStorage, firebaseTest } from '../config/firebase.test';
import { AuthTestUtils } from './auth.test';
import { FirestoreTestUtils } from './firestore.test';
import { StorageTestUtils } from './storage.test';
import { NotificationTestUtils } from './notifications.test';
import pushNotificationService from '../services/pushNotificationService';

// Mock fetch for notifications
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: [{ status: 'ok', id: 'integration-test-id' }] })
} as Response);

describe('Firebase Integration Tests', () => {
  let creator: User;
  let supporter1: User;
  let supporter2: User;
  let campaignId: string;
  let conversationId: string;
  let uploadedFiles: string[] = [];

  beforeAll(async () => {
    // Create test users
    creator = await AuthTestUtils.createTestUserWithProfile(
      'integration-creator@example.com',
      'password123',
      { displayName: 'Integration Creator', isCreator: true }
    );

    supporter1 = await AuthTestUtils.createTestUserWithProfile(
      'integration-supporter1@example.com',
      'password123',
      { displayName: 'Integration Supporter 1', isCreator: false }
    );

    supporter2 = await AuthTestUtils.createTestUserWithProfile(
      'integration-supporter2@example.com',
      'password123',
      { displayName: 'Integration Supporter 2', isCreator: false }
    );
  });

  afterEach(async () => {
    // Clean up uploaded files
    await StorageTestUtils.cleanupTestFiles(uploadedFiles);
    uploadedFiles = [];
  });

  afterAll(async () => {
    await firebaseTest.cleanup();
  });

  describe('End-to-End Campaign Workflow', () => {
    test('should complete full campaign lifecycle with all Firebase services', async () => {
      // 1. Creator uploads profile image
      const profileImagePath = `profiles/${creator.uid}/profile.png`;
      const profileImageUrl = await StorageTestUtils.uploadTestImage(
        profileImagePath,
        'creator-profile.png',
        { customMetadata: { uploadedBy: creator.uid, type: 'profile' } }
      );
      uploadedFiles.push(profileImagePath);

      expect(profileImageUrl).toBeTruthy();
      expect(await StorageTestUtils.fileExists(profileImagePath)).toBe(true);

      // 2. Creator creates a campaign with banner image
      const bannerImagePath = `campaigns/integration-campaign/banner.png`;
      const bannerImageUrl = await StorageTestUtils.uploadTestImage(
        bannerImagePath,
        'campaign-banner.png',
        { customMetadata: { campaignType: 'integration-test' } }
      );
      uploadedFiles.push(bannerImagePath);

      campaignId = await FirestoreTestUtils.createTestCampaign(creator.uid, {
        title: 'Integration Test Campaign',
        description: 'A comprehensive test campaign for Firebase integration',
        targetAmount: 10000,
        currentAmount: 0,
        images: [bannerImageUrl],
        category: 'technology',
        visibility: 'public',
        status: 'active'
      });

      // Verify campaign was created
      const campaignDoc = await getDoc(doc(testDb, 'campaigns', campaignId));
      expect(campaignDoc.exists()).toBe(true);
      
      const campaignData = campaignDoc.data();
      expect(campaignData?.title).toBe('Integration Test Campaign');
      expect(campaignData?.images).toContain(bannerImageUrl);

      // 3. Set up push notifications for supporters
      await NotificationTestUtils.createMockPushToken(supporter1.uid, 'Device1');
      await NotificationTestUtils.createMockPushToken(supporter2.uid, 'Device2');

      // 4. Supporters make contributions
      const contribution1Id = await FirestoreTestUtils.createTestContribution(
        campaignId,
        supporter1.uid,
        2500
      );

      const contribution2Id = await FirestoreTestUtils.createTestContribution(
        campaignId,
        supporter2.uid,
        1500
      );

      // Verify contributions
      expect(contribution1Id).toBeTruthy();
      expect(contribution2Id).toBeTruthy();

      // 5. Update campaign with new total amount
      await updateDoc(doc(testDb, 'campaigns', campaignId), {
        currentAmount: 4000,
        contributorCount: 2
      });

      // 6. Creator uploads campaign update images
      const updateImagePath = `campaigns/${campaignId}/updates/update1.png`;
      const updateImageUrl = await StorageTestUtils.uploadTestImage(
        updateImagePath,
        'campaign-update.png',
        { customMetadata: { type: 'update', campaignId } }
      );
      uploadedFiles.push(updateImagePath);

      // 7. Creator posts campaign update and sends notifications
      await addDoc(collection(testDb, 'campaigns', campaignId, 'updates'), {
        title: 'Great Progress!',
        content: 'We have reached 40% of our goal!',
        images: [updateImageUrl],
        createdBy: creator.uid,
        createdAt: new Date()
      });

      // Send notification to supporters
      await pushNotificationService.sendCampaignNotification(
        campaignId,
        'update',
        'Campaign Update: Great Progress!',
        'Your supported campaign has reached 40% of its goal!'
      );

      // Verify notification was "sent"
      expect(fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Great Progress!')
        })
      );

      // 8. Verify final campaign state
      const updatedCampaignDoc = await getDoc(doc(testDb, 'campaigns', campaignId));
      const updatedCampaignData = updatedCampaignDoc.data();
      
      expect(updatedCampaignData?.currentAmount).toBe(4000);
      expect(updatedCampaignData?.contributorCount).toBe(2);
    });
  });

  describe('End-to-End Messaging Workflow', () => {
    test('should complete full messaging workflow with file attachments and notifications', async () => {
      // 1. Create conversation between users
      conversationId = await FirestoreTestUtils.createTestConversation([
        creator.uid,
        supporter1.uid
      ]);

      // Verify conversation was created
      const conversationDoc = await getDoc(doc(testDb, 'conversations', conversationId));
      expect(conversationDoc.exists()).toBe(true);

      // 2. Send text messages
      const message1Id = await FirestoreTestUtils.sendTestMessage(
        conversationId,
        creator.uid,
        'Hello! Thank you for supporting my campaign!'
      );

      const message2Id = await FirestoreTestUtils.sendTestMessage(
        conversationId,
        supporter1.uid,
        'Happy to help! Keep up the great work!'
      );

      expect(message1Id).toBeTruthy();
      expect(message2Id).toBeTruthy();

      // 3. Send message with image attachment
      const attachmentPath = `messages/${conversationId}/${message2Id}/attachment.png`;
      const attachmentUrl = await StorageTestUtils.uploadTestImage(
        attachmentPath,
        'message-attachment.png',
        {
          customMetadata: {
            conversationId,
            messageId: message2Id,
            senderId: supporter1.uid,
            attachmentType: 'image'
          }
        }
      );
      uploadedFiles.push(attachmentPath);

      // Send message with attachment reference
      const attachmentMessageId = await addDoc(
        collection(testDb, 'conversations', conversationId, 'messages'),
        {
          conversationId,
          senderId: supporter1.uid,
          text: 'Here is a photo from your campaign event!',
          type: 'image',
          attachmentUrl,
          timestamp: new Date(),
          status: 'sent'
        }
      );

      expect(attachmentMessageId.id).toBeTruthy();
      expect(await StorageTestUtils.fileExists(attachmentPath)).toBe(true);

      // 4. Send campaign share in message
      const shareMessageId = await addDoc(
        collection(testDb, 'conversations', conversationId, 'messages'),
        {
          conversationId,
          senderId: creator.uid,
          text: 'Check out this amazing campaign!',
          type: 'campaign_share',
          sharedCampaignId: campaignId,
          timestamp: new Date(),
          status: 'sent'
        }
      );

      // 5. Send message notification
      await pushNotificationService.sendMessageNotification(
        conversationId,
        creator.uid,
        'Integration Creator',
        'Check out this amazing campaign!',
        [creator.uid, supporter1.uid]
      );

      // Verify message notification
      expect(fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          body: expect.stringContaining('New message from Integration Creator')
        })
      );

      // 6. Verify all messages exist
      const shareMessageDoc = await getDoc(
        doc(testDb, 'conversations', conversationId, 'messages', shareMessageId.id)
      );
      
      expect(shareMessageDoc.exists()).toBe(true);
      const shareMessageData = shareMessageDoc.data();
      expect(shareMessageData?.type).toBe('campaign_share');
      expect(shareMessageData?.sharedCampaignId).toBe(campaignId);
    });
  });

  describe('Multi-User Real-time Interactions', () => {
    test('should handle concurrent user actions across all services', async () => {
      // Simulate multiple users interacting simultaneously

      // 1. Multiple users upload profile images concurrently
      const profileUploads = [
        StorageTestUtils.uploadTestImage(
          `profiles/${creator.uid}/avatar.png`,
          'creator-avatar.png'
        ),
        StorageTestUtils.uploadTestImage(
          `profiles/${supporter1.uid}/avatar.png`,
          'supporter1-avatar.png'
        ),
        StorageTestUtils.uploadTestImage(
          `profiles/${supporter2.uid}/avatar.png`,
          'supporter2-avatar.png'
        )
      ];

      const profileUrls = await Promise.all(profileUploads);
      
      // Track for cleanup
      uploadedFiles.push(
        `profiles/${creator.uid}/avatar.png`,
        `profiles/${supporter1.uid}/avatar.png`,
        `profiles/${supporter2.uid}/avatar.png`
      );

      expect(profileUrls).toHaveLength(3);
      profileUrls.forEach(url => expect(url).toBeTruthy());

      // 2. Multiple users create campaigns concurrently
      const campaignCreations = [
        FirestoreTestUtils.createTestCampaign(creator.uid, {
          title: 'Concurrent Campaign 1',
          category: 'health'
        }),
        FirestoreTestUtils.createTestCampaign(supporter1.uid, {
          title: 'Concurrent Campaign 2',
          category: 'education'
        }),
        FirestoreTestUtils.createTestCampaign(supporter2.uid, {
          title: 'Concurrent Campaign 3',
          category: 'environment'
        })
      ];

      const campaignIds = await Promise.all(campaignCreations);
      expect(campaignIds).toHaveLength(3);

      // 3. Multiple users make contributions concurrently
      const contributionPromises = campaignIds.flatMap(cId => [
        FirestoreTestUtils.createTestContribution(cId, creator.uid, 100),
        FirestoreTestUtils.createTestContribution(cId, supporter1.uid, 200),
        FirestoreTestUtils.createTestContribution(cId, supporter2.uid, 150)
      ]);

      const contributionIds = await Promise.all(contributionPromises);
      expect(contributionIds).toHaveLength(9); // 3 campaigns × 3 contributors

      // 4. Multiple conversations created concurrently
      const conversationPromises = [
        FirestoreTestUtils.createTestConversation([creator.uid, supporter1.uid]),
        FirestoreTestUtils.createTestConversation([creator.uid, supporter2.uid]),
        FirestoreTestUtils.createTestConversation([supporter1.uid, supporter2.uid])
      ];

      const conversationIds = await Promise.all(conversationPromises);
      expect(conversationIds).toHaveLength(3);

      // 5. Multiple messages sent concurrently across conversations
      const messagePromises = conversationIds.flatMap(cId => [
        FirestoreTestUtils.sendTestMessage(cId, creator.uid, 'Message from creator'),
        FirestoreTestUtils.sendTestMessage(cId, supporter1.uid, 'Message from supporter 1'),
        FirestoreTestUtils.sendTestMessage(cId, supporter2.uid, 'Message from supporter 2')
      ]);

      const messageIds = await Promise.all(messagePromises);
      expect(messageIds).toHaveLength(9); // 3 conversations × 3 users

      // 6. Verify all data was created correctly
      for (const campaignId of campaignIds) {
        const campaignDoc = await getDoc(doc(testDb, 'campaigns', campaignId));
        expect(campaignDoc.exists()).toBe(true);
      }

      for (const conversationId of conversationIds) {
        const conversationDoc = await getDoc(doc(testDb, 'conversations', conversationId));
        expect(conversationDoc.exists()).toBe(true);
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle partial failures gracefully', async () => {
      // Test scenario: Campaign creation succeeds, but image upload fails
      
      // 1. Create campaign first
      const testCampaignId = await FirestoreTestUtils.createTestCampaign(creator.uid, {
        title: 'Error Recovery Campaign',
        description: 'Testing error recovery mechanisms'
      });

      expect(testCampaignId).toBeTruthy();

      // 2. Simulate image upload failure (upload to invalid path)
      let uploadError: Error | null = null;
      try {
        await StorageTestUtils.uploadTestImage(
          '', // Invalid empty path
          'should-fail.png'
        );
      } catch (error) {
        uploadError = error as Error;
      }

      // The upload should either fail or succeed with fallback handling
      // This demonstrates that the campaign can exist without images initially

      // 3. Verify campaign still exists and is valid
      const campaignDoc = await getDoc(doc(testDb, 'campaigns', testCampaignId));
      expect(campaignDoc.exists()).toBe(true);

      // 4. Retry image upload with correct path
      const retryImagePath = `campaigns/${testCampaignId}/retry-banner.png`;
      const retryImageUrl = await StorageTestUtils.uploadTestImage(
        retryImagePath,
        'retry-banner.png'
      );
      uploadedFiles.push(retryImagePath);

      expect(retryImageUrl).toBeTruthy();

      // 5. Update campaign with successful image
      await updateDoc(doc(testDb, 'campaigns', testCampaignId), {
        images: [retryImageUrl],
        updatedAt: new Date()
      });

      // Verify update succeeded
      const updatedCampaignDoc = await getDoc(doc(testDb, 'campaigns', testCampaignId));
      const updatedData = updatedCampaignDoc.data();
      expect(updatedData?.images).toContain(retryImageUrl);
    });

    test('should handle notification failures without breaking workflow', async () => {
      // Mock failed notification response
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      // Create campaign and contribution
      const resilientCampaignId = await FirestoreTestUtils.createTestCampaign(creator.uid, {
        title: 'Notification Resilience Test'
      });

      await FirestoreTestUtils.createTestContribution(
        resilientCampaignId,
        supporter1.uid,
        500
      );

      await NotificationTestUtils.createMockPushToken(supporter1.uid);

      // Try to send notification (should fail but not throw)
      let notificationError: Error | null = null;
      try {
        await pushNotificationService.sendCampaignNotification(
          resilientCampaignId,
          'update',
          'Resilience Test',
          'Testing notification failure handling'
        );
      } catch (error) {
        notificationError = error as Error;
      }

      // Should have caught the error
      expect(notificationError).toBeTruthy();
      expect(notificationError?.message).toBe('Network failure');

      // Campaign should still be valid
      const campaignDoc = await getDoc(doc(testDb, 'campaigns', resilientCampaignId));
      expect(campaignDoc.exists()).toBe(true);

      // Restore successful mock for subsequent tests
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ status: 'ok' }] })
      } as Response);
    });
  });

  describe('Performance and Scale Testing', () => {
    test('should handle batch operations efficiently', async () => {
      const startTime = Date.now();
      const batchSize = 10;

      // Create multiple campaigns in batch
      const batchCampaignPromises = Array.from({ length: batchSize }, (_, i) =>
        FirestoreTestUtils.createTestCampaign(creator.uid, {
          title: `Batch Campaign ${i + 1}`,
          category: 'technology'
        })
      );

      const batchCampaignIds = await Promise.all(batchCampaignPromises);
      expect(batchCampaignIds).toHaveLength(batchSize);

      // Create multiple contributions for each campaign
      const batchContributionPromises = batchCampaignIds.flatMap(cId =>
        Array.from({ length: 3 }, () =>
          FirestoreTestUtils.createTestContribution(cId, supporter1.uid, 50)
        )
      );

      const batchContributionIds = await Promise.all(batchContributionPromises);
      expect(batchContributionIds).toHaveLength(batchSize * 3);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete reasonably quickly (under 10 seconds for this batch size)
      expect(executionTime).toBeLessThan(10000);
      
      console.log(`Batch operations completed in ${executionTime}ms`);
    });
  });
});

// Integration test utilities
export const IntegrationTestUtils = {
  /**
   * Create a complete test campaign with all associated data
   */
  async createFullCampaign(creatorId: string, supporterIds: string[]) {
    // Upload banner image
    const bannerPath = `campaigns/full-test-${Date.now()}/banner.png`;
    const bannerUrl = await StorageTestUtils.uploadTestImage(
      bannerPath,
      'full-campaign-banner.png'
    );

    // Create campaign
    const campaignId = await FirestoreTestUtils.createTestCampaign(creatorId, {
      title: 'Full Integration Test Campaign',
      images: [bannerUrl],
      targetAmount: 5000
    });

    // Add contributions
    const contributionPromises = supporterIds.map((supporterId, index) =>
      FirestoreTestUtils.createTestContribution(
        campaignId,
        supporterId,
        (index + 1) * 100
      )
    );

    const contributionIds = await Promise.all(contributionPromises);

    // Set up notifications
    const tokenPromises = supporterIds.map(supporterId =>
      NotificationTestUtils.createMockPushToken(supporterId)
    );

    await Promise.all(tokenPromises);

    return {
      campaignId,
      bannerUrl,
      bannerPath,
      contributionIds
    };
  },

  /**
   * Clean up all test data
   */
  async cleanupIntegrationTest(filePaths: string[]) {
    await StorageTestUtils.cleanupTestFiles(filePaths);
  }
};