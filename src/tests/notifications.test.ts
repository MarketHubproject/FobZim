import { User } from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { testDb, firebaseTest } from '../config/firebase.test';
import { AuthTestUtils } from './auth.test';
import pushNotificationService, { 
  NotificationPayload, 
  ScheduledNotification 
} from '../services/pushNotificationService';

// Mock expo-notifications for testing
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ 
    data: 'ExponentPushToken[test-token-123]' 
  }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(true),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(true),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  AndroidImportance: {
    MAX: 'max',
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
    MIN: 'min'
  }
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  deviceName: 'Test Device',
  modelName: 'Test Model'
}));

// Mock fetch for Expo push service
global.fetch = jest.fn();

describe('Push Notification Tests', () => {
  let testUser1: User;
  let testUser2: User;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeAll(async () => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    // Create test users
    testUser1 = await AuthTestUtils.createTestUserWithProfile(
      'notification-test1@example.com', 
      'password123', 
      { displayName: 'Notification Test User 1' }
    );
    
    testUser2 = await AuthTestUtils.createTestUserWithProfile(
      'notification-test2@example.com', 
      'password123', 
      { displayName: 'Notification Test User 2' }
    );
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful fetch responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ status: 'ok', id: 'message-id-123' }] })
    } as Response);
  });

  afterAll(async () => {
    await firebaseTest.cleanup();
  });

  describe('Push Token Management', () => {
    test('should initialize push notifications and register token', async () => {
      // Initialize the push notification service
      const success = await pushNotificationService.initialize();
      
      expect(success).toBe(true);
      
      // Verify token was registered in Firestore
      const tokenDoc = await getDoc(
        doc(testDb, 'pushTokens', `${testUser1.uid}_Test Device`)
      );
      
      expect(tokenDoc.exists()).toBe(true);
      const tokenData = tokenDoc.data();
      expect(tokenData?.token).toBe('ExponentPushToken[test-token-123]');
      expect(tokenData?.userId).toBe(testUser1.uid);
    });

    test('should unregister push token', async () => {
      // First register a token
      await setDoc(doc(testDb, 'pushTokens', `${testUser1.uid}_Test Device`), {
        token: 'ExponentPushToken[test-token-456]',
        userId: testUser1.uid,
        deviceType: 'ios',
        deviceId: 'Test Device',
        isActive: true,
      });

      // Unregister the token
      await pushNotificationService.unregisterToken();

      // Verify token was removed
      const tokenDoc = await getDoc(
        doc(testDb, 'pushTokens', `${testUser1.uid}_Test Device`)
      );
      
      expect(tokenDoc.exists()).toBe(false);
    });

    test('should clean up inactive tokens for user', async () => {
      // Create multiple tokens for the user
      await setDoc(doc(testDb, 'pushTokens', `${testUser1.uid}_Device1`), {
        token: 'token1',
        userId: testUser1.uid,
        deviceId: 'Device1',
        isActive: true,
      });

      await setDoc(doc(testDb, 'pushTokens', `${testUser1.uid}_Device2`), {
        token: 'token2',
        userId: testUser1.uid,
        deviceId: 'Device2',
        isActive: true,
      });

      // Clean up inactive tokens (should mark others as inactive)
      await pushNotificationService.cleanupInactiveTokens();

      // Current device should remain active, others should be inactive
      const currentDeviceToken = await getDoc(
        doc(testDb, 'pushTokens', `${testUser1.uid}_Test Device`)
      );
      const otherDeviceToken = await getDoc(
        doc(testDb, 'pushTokens', `${testUser1.uid}_Device1`)
      );

      if (currentDeviceToken.exists()) {
        expect(currentDeviceToken.data()?.isActive).toBe(true);
      }
      if (otherDeviceToken.exists()) {
        expect(otherDeviceToken.data()?.isActive).toBe(false);
      }
    });
  });

  describe('Sending Notifications', () => {
    beforeEach(async () => {
      // Set up push tokens for test users
      await setDoc(doc(testDb, 'pushTokens', `${testUser1.uid}_Device1`), {
        token: 'ExponentPushToken[user1-token]',
        userId: testUser1.uid,
        deviceType: 'ios',
        deviceId: 'Device1',
        isActive: true,
      });

      await setDoc(doc(testDb, 'pushTokens', `${testUser2.uid}_Device2`), {
        token: 'ExponentPushToken[user2-token]',
        userId: testUser2.uid,
        deviceType: 'android',
        deviceId: 'Device2',
        isActive: true,
      });
    });

    test('should send notification to specific users', async () => {
      const notification: NotificationPayload = {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { type: 'test', userId: testUser1.uid }
      };

      await pushNotificationService.sendNotificationToUsers(
        [testUser1.uid, testUser2.uid], 
        notification
      );

      // Verify fetch was called with correct payload
      expect(mockFetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Test Notification')
        })
      );

      // Check that the request body contains tokens for both users
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1]?.body as string);
      
      expect(requestBody).toHaveLength(2);
      expect(requestBody[0].to).toBe('ExponentPushToken[user1-token]');
      expect(requestBody[1].to).toBe('ExponentPushToken[user2-token]');
    });

    test('should send campaign notification to contributors', async () => {
      // Create a test campaign
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Test Campaign for Notifications',
        createdBy: testUser1.uid,
      });

      // Create contributions for the campaign
      await addDoc(collection(testDb, 'contributions'), {
        campaignId: campaignRef.id,
        contributorId: testUser2.uid,
        amount: 100,
        status: 'confirmed',
      });

      // Send campaign notification
      await pushNotificationService.sendCampaignNotification(
        campaignRef.id,
        'update',
        'Campaign Update',
        'Your supported campaign has been updated!'
      );

      // Verify notification was sent
      expect(mockFetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Campaign Update')
        })
      );
    });

    test('should send message notification', async () => {
      await pushNotificationService.sendMessageNotification(
        'conversation-123',
        testUser1.uid,
        'Test User 1',
        'Hello! This is a test message',
        [testUser1.uid, testUser2.uid] // Recipients include sender (will be filtered out)
      );

      // Verify notification was sent only to recipient (not sender)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New message from Test User 1')
        })
      );

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1]?.body as string);
      
      // Should only send to user2 (sender user1 filtered out)
      expect(requestBody).toHaveLength(1);
      expect(requestBody[0].to).toBe('ExponentPushToken[user2-token]');
    });

    test('should handle users with no valid tokens', async () => {
      // Try to send notification to user with no tokens
      const notification: NotificationPayload = {
        title: 'Test',
        body: 'Test notification'
      };

      // This should not throw an error, just log a warning
      await expect(
        pushNotificationService.sendNotificationToUsers(['nonexistent-user'], notification)
      ).resolves.not.toThrow();

      // Fetch should not be called since no valid tokens
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Scheduled Notifications', () => {
    test('should schedule a local notification', async () => {
      const scheduledNotification: ScheduledNotification = {
        id: 'test-scheduled-123',
        title: 'Scheduled Test',
        body: 'This is a scheduled notification',
        trigger: 60, // 60 seconds from now
        userId: testUser1.uid,
        type: 'campaign_reminder',
        data: { campaignId: 'campaign-123' }
      };

      const notificationId = await pushNotificationService.scheduleNotification(
        scheduledNotification
      );

      expect(notificationId).toBe('notification-id-123');

      // Verify scheduled notification was stored in Firestore
      const notificationDoc = await getDoc(
        doc(testDb, 'scheduledNotifications', notificationId)
      );
      
      expect(notificationDoc.exists()).toBe(true);
      const notificationData = notificationDoc.data();
      expect(notificationData?.title).toBe('Scheduled Test');
      expect(notificationData?.status).toBe('scheduled');
    });

    test('should cancel a scheduled notification', async () => {
      const notificationId = 'test-cancel-123';
      
      // Create a scheduled notification record
      await setDoc(doc(testDb, 'scheduledNotifications', notificationId), {
        title: 'Notification to Cancel',
        status: 'scheduled',
        userId: testUser1.uid,
      });

      // Cancel the notification
      await pushNotificationService.cancelScheduledNotification(notificationId);

      // Verify status was updated to cancelled
      const notificationDoc = await getDoc(
        doc(testDb, 'scheduledNotifications', notificationId)
      );
      
      expect(notificationDoc.exists()).toBe(true);
      const notificationData = notificationDoc.data();
      expect(notificationData?.status).toBe('cancelled');
    });
  });

  describe('Notification Listeners', () => {
    test('should set up notification listeners', () => {
      const listeners = pushNotificationService.setupNotificationListeners();

      expect(listeners.removeReceivedListener).toBeDefined();
      expect(listeners.removeResponseListener).toBeDefined();
      expect(typeof listeners.removeReceivedListener).toBe('function');
      expect(typeof listeners.removeResponseListener).toBe('function');

      // Clean up listeners
      listeners.removeReceivedListener();
      listeners.removeResponseListener();
    });
  });

  describe('Error Handling', () => {
    test('should handle failed push notification requests', async () => {
      // Mock failed fetch response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ['Invalid push token'] })
      } as Response);

      const notification: NotificationPayload = {
        title: 'Failed Notification',
        body: 'This should fail'
      };

      await expect(
        pushNotificationService.sendNotificationToUsers([testUser1.uid], notification)
      ).rejects.toThrow('Push notification failed');
    });

    test('should handle network errors gracefully', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const notification: NotificationPayload = {
        title: 'Network Error Test',
        body: 'This should handle network errors'
      };

      await expect(
        pushNotificationService.sendNotificationToUsers([testUser1.uid], notification)
      ).rejects.toThrow('Network error');
    });
  });

  describe('Convenience Functions', () => {
    test('should send campaign milestone notification', async () => {
      // Import convenience functions
      const { sendCampaignMilestoneNotification } = await import('../services/pushNotificationService');

      // Create a campaign with contributors
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Milestone Campaign',
        createdBy: testUser1.uid,
      });

      await addDoc(collection(testDb, 'contributions'), {
        campaignId: campaignRef.id,
        contributorId: testUser2.uid,
        amount: 1000,
        status: 'confirmed',
      });

      // Send milestone notification
      await sendCampaignMilestoneNotification(
        campaignRef.id,
        'Milestone Campaign',
        '$5,000'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          body: expect.stringContaining('Milestone Reached!')
        })
      );
    });

    test('should send campaign deadline notification', async () => {
      const { sendCampaignDeadlineNotification } = await import('../services/pushNotificationService');

      // Create a campaign with contributors
      const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
        title: 'Deadline Campaign',
        createdBy: testUser1.uid,
      });

      await addDoc(collection(testDb, 'contributions'), {
        campaignId: campaignRef.id,
        contributorId: testUser2.uid,
        amount: 500,
        status: 'confirmed',
      });

      // Send deadline notification
      await sendCampaignDeadlineNotification(campaignRef.id, 3);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          body: expect.stringContaining('Only 3 days left')
        })
      );
    });
  });
});

// Notification test utilities
export const NotificationTestUtils = {
  /**
   * Create a mock push token for testing
   */
  async createMockPushToken(userId: string, deviceId: string = 'TestDevice'): Promise<void> {
    await setDoc(doc(testDb, 'pushTokens', `${userId}_${deviceId}`), {
      token: `ExponentPushToken[${userId}-${deviceId}]`,
      userId,
      deviceType: 'ios',
      deviceId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  /**
   * Create a mock campaign with contributors for notification testing
   */
  async createMockCampaignWithContributors(
    creatorId: string, 
    contributorIds: string[]
  ): Promise<string> {
    // Create campaign
    const campaignRef = await addDoc(collection(testDb, 'campaigns'), {
      title: 'Mock Campaign for Notifications',
      createdBy: creatorId,
    });

    // Create contributions
    for (const contributorId of contributorIds) {
      await addDoc(collection(testDb, 'contributions'), {
        campaignId: campaignRef.id,
        contributorId,
        amount: 100,
        status: 'confirmed',
      });
    }

    return campaignRef.id;
  },

  /**
   * Mock successful notification response
   */
  mockSuccessfulNotificationResponse(): void {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ status: 'ok', id: 'success-id' }] })
    } as Response);
  },

  /**
   * Mock failed notification response
   */
  mockFailedNotificationResponse(): void {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ errors: ['Mock error'] })
    } as Response);
  }
};