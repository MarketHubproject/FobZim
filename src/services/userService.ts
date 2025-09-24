import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  joinedDate: Date;
  isOnline: boolean;
  lastSeen?: Date;
  campaignCount: number;
  messageCount: number;
  followers: string[];
  following: string[];
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
}

interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  isOnline: boolean;
  mutualConnections: number;
}

interface UserPreferences {
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    messageNotifications: boolean;
    campaignUpdates: boolean;
    followNotifications: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    allowCampaignInvites: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: userId,
          displayName: userData.displayName || 'Unknown User',
          email: userData.email || '',
          photoURL: userData.photoURL,
          bio: userData.bio,
          location: userData.location,
          website: userData.website,
          phoneNumber: userData.phoneNumber,
          joinedDate: userData.createdAt?.toDate() || new Date(),
          isOnline: userData.isOnline || false,
          lastSeen: userData.lastSeen?.toDate(),
          campaignCount: userData.campaignCount || 0,
          messageCount: userData.messageCount || 0,
          followers: userData.followers || [],
          following: userData.following || [],
          privacy: userData.privacy || {
            profileVisible: true,
            showEmail: false,
            showPhone: false,
            allowMessages: true
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Update user avatar
   */
  async updateUserAvatar(userId: string, photoURL: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        photoURL,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user avatar:', error);
      throw error;
    }
  }

  /**
   * Search for users
   */
  async searchUsers(searchQuery: string, currentUserId: string, limitCount: number = 20): Promise<UserSearchResult[]> {
    try {
      const searchLower = searchQuery.toLowerCase();
      
      // Search by display name
      const nameQuery = query(
        collection(db, 'users'),
        where('displayNameLower', '>=', searchLower),
        where('displayNameLower', '<=', searchLower + '\uf8ff'),
        where('privacy.profileVisible', '==', true),
        limit(limitCount)
      );
      
      const nameSnapshot = await getDocs(nameQuery);
      const results: UserSearchResult[] = [];
      
      nameSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (doc.id !== currentUserId) { // Exclude current user
          results.push({
            uid: doc.id,
            displayName: userData.displayName || 'Unknown User',
            photoURL: userData.photoURL,
            bio: userData.bio,
            location: userData.location,
            isOnline: userData.isOnline || false,
            mutualConnections: 0 // TODO: Calculate mutual connections
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Follow/Unfollow a user
   */
  async toggleFollow(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', targetUserId);
      
      const currentUserDoc = await getDoc(currentUserRef);
      const targetUserDoc = await getDoc(targetUserRef);
      
      if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentUserData = currentUserDoc.data();
      const targetUserData = targetUserDoc.data();
      
      const currentUserFollowing = currentUserData.following || [];
      const targetUserFollowers = targetUserData.followers || [];
      
      const isFollowing = currentUserFollowing.includes(targetUserId);
      const batch = writeBatch(db);
      
      if (isFollowing) {
        // Unfollow
        batch.update(currentUserRef, {
          following: currentUserFollowing.filter((id: string) => id !== targetUserId),
          updatedAt: serverTimestamp()
        });
        
        batch.update(targetUserRef, {
          followers: targetUserFollowers.filter((id: string) => id !== currentUserId),
          updatedAt: serverTimestamp()
        });
        
        await batch.commit();
        return false;
      } else {
        // Follow
        batch.update(currentUserRef, {
          following: [...currentUserFollowing, targetUserId],
          updatedAt: serverTimestamp()
        });
        
        batch.update(targetUserRef, {
          followers: [...targetUserFollowers, currentUserId],
          updatedAt: serverTimestamp()
        });
        
        await batch.commit();
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }

  /**
   * Block/Unblock a user
   */
  async toggleBlock(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', currentUserId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const blockedUsers = userData.blockedUsers || [];
      const isBlocked = blockedUsers.includes(targetUserId);
      
      if (isBlocked) {
        // Unblock
        await updateDoc(userRef, {
          blockedUsers: blockedUsers.filter((id: string) => id !== targetUserId),
          updatedAt: serverTimestamp()
        });
        return false;
      } else {
        // Block (and unfollow if following)
        const following = userData.following || [];
        await updateDoc(userRef, {
          blockedUsers: [...blockedUsers, targetUserId],
          following: following.filter((id: string) => id !== targetUserId),
          updatedAt: serverTimestamp()
        });
        
        // Also remove from target's followers
        const targetRef = doc(db, 'users', targetUserId);
        const targetDoc = await getDoc(targetRef);
        if (targetDoc.exists()) {
          const targetData = targetDoc.data();
          const followers = targetData.followers || [];
          await updateDoc(targetRef, {
            followers: followers.filter((id: string) => id !== currentUserId),
            updatedAt: serverTimestamp()
          });
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling block:', error);
      throw error;
    }
  }

  /**
   * Update user online status
   */
  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData: any = {
        isOnline,
        updatedAt: serverTimestamp()
      };
      
      if (!isOnline) {
        updateData.lastSeen = serverTimestamp();
      }
      
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const prefsDoc = await getDoc(doc(db, 'userPreferences', userId));
      
      if (prefsDoc.exists()) {
        return prefsDoc.data() as UserPreferences;
      }
      
      // Return default preferences if none exist
      return {
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          messageNotifications: true,
          campaignUpdates: true,
          followNotifications: true
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          showPhone: false,
          allowMessages: true,
          allowCampaignInvites: true
        },
        theme: 'system',
        language: 'en'
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const prefsRef = doc(db, 'userPreferences', userId);
      await setDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(userId: string): Promise<UserSearchResult[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return [];
      }
      
      const followers = userDoc.data().followers || [];
      
      if (followers.length === 0) {
        return [];
      }
      
      const followerProfiles: UserSearchResult[] = [];
      
      // Get follower profiles (batch processing would be better for large numbers)
      for (const followerId of followers) {
        const followerDoc = await getDoc(doc(db, 'users', followerId));
        if (followerDoc.exists()) {
          const followerData = followerDoc.data();
          followerProfiles.push({
            uid: followerId,
            displayName: followerData.displayName || 'Unknown User',
            photoURL: followerData.photoURL,
            bio: followerData.bio,
            location: followerData.location,
            isOnline: followerData.isOnline || false,
            mutualConnections: 0
          });
        }
      }
      
      return followerProfiles;
    } catch (error) {
      console.error('Error getting user followers:', error);
      throw error;
    }
  }

  /**
   * Get users that current user is following
   */
  async getUserFollowing(userId: string): Promise<UserSearchResult[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return [];
      }
      
      const following = userDoc.data().following || [];
      
      if (following.length === 0) {
        return [];
      }
      
      const followingProfiles: UserSearchResult[] = [];
      
      // Get following profiles
      for (const followingId of following) {
        const followingDoc = await getDoc(doc(db, 'users', followingId));
        if (followingDoc.exists()) {
          const followingData = followingDoc.data();
          followingProfiles.push({
            uid: followingId,
            displayName: followingData.displayName || 'Unknown User',
            photoURL: followingData.photoURL,
            bio: followingData.bio,
            location: followingData.location,
            isOnline: followingData.isOnline || false,
            mutualConnections: 0
          });
        }
      }
      
      return followingProfiles;
    } catch (error) {
      console.error('Error getting user following:', error);
      throw error;
    }
  }

  /**
   * Report a user
   */
  async reportUser(reporterId: string, reportedUserId: string, reason: string, details?: string): Promise<void> {
    try {
      const reportRef = doc(collection(db, 'userReports'));
      await setDoc(reportRef, {
        reporterId,
        reportedUserId,
        reason,
        details: details || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export { UserProfile, UserSearchResult, UserPreferences };