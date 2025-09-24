import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { imageUploadService } from './imageUploadService';
import { notificationService } from './notificationService';

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'campaign_reference' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    imageUrl?: string;
    campaignId?: string;
    campaignTitle?: string;
    [key: string]: any;
  };
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  editedAt?: Date | Timestamp;
  replyTo?: string; // Message ID being replied to
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  participantDetails: {
    [userId: string]: {
      name: string;
      avatar?: string;
      role?: 'creator' | 'brand' | 'user';
      lastSeen?: Date | Timestamp;
    };
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: string;
    timestamp: Date | Timestamp;
  };
  unreadCount: { [userId: string]: number };
  type: 'direct' | 'group' | 'campaign';
  campaignId?: string;
  campaignTitle?: string;
  isActive: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface MessageReaction {
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date | Timestamp;
}

export interface ConversationFilter {
  type?: 'direct' | 'group' | 'campaign';
  unreadOnly?: boolean;
  campaignId?: string;
  searchQuery?: string;
}

class MessagingService {
  /**
   * Create a new conversation between users
   */
  async createConversation(
    currentUserId: string,
    participantId: string,
    participantDetails: { name: string; avatar?: string; role?: string },
    initialMessage?: string,
    campaignId?: string,
    campaignTitle?: string
  ): Promise<string> {
    try {
      const conversationId = this.generateConversationId(currentUserId, participantId, campaignId);
      
      // Check if conversation already exists
      const existingConversation = await getDoc(doc(db, 'conversations', conversationId));
      
      if (existingConversation.exists()) {
        // Update existing conversation
        await updateDoc(doc(db, 'conversations', conversationId), {
          isActive: true,
          updatedAt: serverTimestamp()
        });
        
        if (initialMessage) {
          await this.sendMessage(conversationId, currentUserId, initialMessage);
        }
        
        return conversationId;
      }

      // Create new conversation
      const conversationData: Omit<Conversation, 'id'> = {
        participants: [currentUserId, participantId],
        participantDetails: {
          [currentUserId]: {
            name: 'You', // Will be updated with real name
            avatar: '',
            lastSeen: new Date()
          },
          [participantId]: participantDetails
        },
        unreadCount: {
          [currentUserId]: 0,
          [participantId]: 0
        },
        type: campaignId ? 'campaign' : 'direct',
        campaignId,
        campaignTitle,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'conversations', conversationId), {
        id: conversationId,
        ...conversationData
      });

      // Send initial message if provided
      if (initialMessage) {
        await this.sendMessage(conversationId, currentUserId, initialMessage);
      }

      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: Message['type'] = 'text',
    metadata?: Message['metadata'],
    replyTo?: string
  ): Promise<string> {
    try {
      const messageId = doc(collection(db, 'messages')).id;
      
      // Get sender details
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      
      // Get conversation details
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      const conversationData = conversationDoc.data() as Conversation;

      const messageData: Omit<Message, 'id'> = {
        conversationId,
        senderId,
        senderName: senderData?.displayName || 'Unknown',
        senderAvatar: senderData?.photoURL,
        recipientId: conversationData.participants.find(p => p !== senderId) || '',
        content,
        type,
        metadata,
        status: 'sending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replyTo
      };

      // Save message
      await setDoc(doc(db, 'messages', messageId), {
        id: messageId,
        ...messageData
      });

      // Update conversation with last message
      const otherParticipantId = conversationData.participants.find(p => p !== senderId);
      const updatedUnreadCount = {
        ...conversationData.unreadCount,
        [otherParticipantId!]: (conversationData.unreadCount[otherParticipantId!] || 0) + 1
      };

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          id: messageId,
          content: type === 'image' ? '📷 Image' : content,
          senderId,
          senderName: messageData.senderName,
          type,
          timestamp: serverTimestamp()
        },
        unreadCount: updatedUnreadCount,
        updatedAt: serverTimestamp()
      });

      // Update message status to sent
      setTimeout(async () => {
        await updateDoc(doc(db, 'messages', messageId), {
          status: 'sent',
          updatedAt: serverTimestamp()
        });
      }, 500);

      // Send push notification to recipient
      if (otherParticipantId) {
        await this.sendMessageNotification(
          otherParticipantId,
          messageData.senderName,
          content,
          type
        );
      }

      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send an image message
   */
  async sendImageMessage(
    conversationId: string,
    senderId: string,
    imageUri: string,
    caption?: string
  ): Promise<string> {
    try {
      // Upload image
      const uploadResult = await imageUploadService.uploadImageToFirebase(
        imageUri,
        'messages',
        `message_${Date.now()}`
      );

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }

      // Send message with image
      return await this.sendMessage(
        conversationId,
        senderId,
        caption || '',
        'image',
        {
          imageUrl: uploadResult.url,
          fileName: uploadResult.fileName
        }
      );
    } catch (error) {
      console.error('Error sending image message:', error);
      throw error;
    }
  }

  /**
   * Send a campaign reference message
   */
  async sendCampaignReference(
    conversationId: string,
    senderId: string,
    campaignId: string,
    campaignTitle: string,
    message?: string
  ): Promise<string> {
    try {
      const content = message || `Check out this campaign: ${campaignTitle}`;
      
      return await this.sendMessage(
        conversationId,
        senderId,
        content,
        'campaign_reference',
        {
          campaignId,
          campaignTitle
        }
      );
    } catch (error) {
      console.error('Error sending campaign reference:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read in a conversation
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Update conversation unread count
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0,
        [`participantDetails.${userId}.lastSeen`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update message statuses
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('status', '!=', 'read')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);

      messagesSnapshot.forEach((messageDoc) => {
        batch.update(messageDoc.ref, {
          status: 'read',
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Get user conversations with real-time updates
   */
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void,
    filter?: ConversationFilter
  ): () => void {
    try {
      let q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let conversations: Conversation[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as Conversation;
          
          // Apply filters
          if (filter) {
            if (filter.type && data.type !== filter.type) return;
            if (filter.unreadOnly && (data.unreadCount[userId] || 0) === 0) return;
            if (filter.campaignId && data.campaignId !== filter.campaignId) return;
            if (filter.searchQuery) {
              const searchLower = filter.searchQuery.toLowerCase();
              const otherParticipantId = data.participants.find(p => p !== userId);
              const otherParticipant = otherParticipantId ? data.participantDetails[otherParticipantId] : null;
              
              if (
                !otherParticipant?.name.toLowerCase().includes(searchLower) &&
                !data.lastMessage?.content.toLowerCase().includes(searchLower) &&
                !data.campaignTitle?.toLowerCase().includes(searchLower)
              ) {
                return;
              }
            }
          }
          
          conversations.push(data);
        });

        callback(conversations);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to conversations:', error);
      return () => {};
    }
  }

  /**
   * Get messages in a conversation with real-time updates
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ): () => void {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        
        snapshot.forEach((doc) => {
          messages.push(doc.data() as Message);
        });

        // Reverse to show oldest first
        callback(messages.reverse());
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return () => {};
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const messageDoc = await getDoc(doc(db, 'messages', messageId));
      const messageData = messageDoc.data() as Message;

      if (messageData.senderId !== userId) {
        throw new Error('You can only delete your own messages');
      }

      await updateDoc(doc(db, 'messages', messageId), {
        content: 'This message was deleted',
        type: 'system',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Search messages across conversations
   */
  async searchMessages(
    userId: string,
    searchQuery: string,
    conversationId?: string
  ): Promise<Message[]> {
    try {
      let q = query(
        collection(db, 'messages'),
        where('content', '>=', searchQuery),
        where('content', '<=', searchQuery + '\uf8ff'),
        orderBy('content'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      // Add conversation filter if specified
      if (conversationId) {
        q = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          where('content', '>=', searchQuery),
          where('content', '<=', searchQuery + '\uf8ff'),
          orderBy('content'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        const message = doc.data() as Message;
        // Only return messages where user is a participant
        if (message.senderId === userId || message.recipientId === userId) {
          messages.push(message);
        }
      });

      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const doc = await getDoc(doc(db, 'conversations', conversationId));
      return doc.exists() ? (doc.data() as Conversation) : null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Archive/Unarchive a conversation
   */
  async toggleArchiveConversation(conversationId: string, userId: string, archived: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`archived.${userId}`]: archived,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling archive conversation:', error);
      throw error;
    }
  }

  /**
   * Block/Unblock a user
   */
  async toggleBlockUser(userId: string, blockedUserId: string, blocked: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      if (blocked) {
        await updateDoc(userRef, {
          blockedUsers: arrayUnion(blockedUserId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(userRef, {
          blockedUsers: arrayRemove(blockedUserId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error toggling block user:', error);
      throw error;
    }
  }

  /**
   * Generate conversation ID
   */
  private generateConversationId(userId1: string, userId2: string, campaignId?: string): string {
    const sortedIds = [userId1, userId2].sort();
    const baseId = `${sortedIds[0]}_${sortedIds[1]}`;
    return campaignId ? `${baseId}_${campaignId}` : baseId;
  }

  /**
   * Send message notification
   */
  private async sendMessageNotification(
    recipientId: string,
    senderName: string,
    content: string,
    type: string
  ): Promise<void> {
    try {
      const template = notificationService.constructor.getNotificationTemplate('message_received', {
        senderName,
        preview: type === 'image' ? '📷 Image' : content.substring(0, 50)
      });

      await notificationService.sendPushNotification(
        recipientId,
        template.title,
        template.body,
        {
          type: 'message_received',
          senderName,
          priority: template.priority
        }
      );
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  /**
   * Get unread message count for user
   */
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(conversationsQuery);
      let totalUnread = 0;

      snapshot.forEach((doc) => {
        const conversation = doc.data() as Conversation;
        totalUnread += conversation.unreadCount[userId] || 0;
      });

      return totalUnread;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  /**
   * Update typing status
   */
  async updateTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const statusRef = doc(db, 'typingStatus', `${conversationId}_${userId}`);
      
      if (isTyping) {
        await setDoc(statusRef, {
          conversationId,
          userId,
          isTyping: true,
          timestamp: serverTimestamp()
        }, { merge: true });
        
        // Auto-clear typing status after 3 seconds
        setTimeout(async () => {
          await setDoc(statusRef, {
            isTyping: false,
            timestamp: serverTimestamp()
          }, { merge: true });
        }, 3000);
      } else {
        await setDoc(statusRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }

  /**
   * Subscribe to typing status
   */
  subscribeToTypingStatus(
    conversationId: string,
    userId: string,
    callback: (isTyping: boolean, typingUserId?: string) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'typingStatus'),
        where('conversationId', '==', conversationId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let isTyping = false;
        let typingUserId: string | undefined;

        snapshot.forEach((doc) => {
          const status = doc.data();
          if (status.userId !== userId && status.isTyping) {
            isTyping = true;
            typingUserId = status.userId;
          }
        });

        callback(isTyping, typingUserId);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to typing status:', error);
      return () => {};
    }
  }
}

// Create singleton instance
export const messagingService = new MessagingService();
export default messagingService;