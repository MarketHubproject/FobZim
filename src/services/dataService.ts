import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Creator, Campaign, Tip } from '../store/AppState';
import { SEED_CREATORS, SEED_CAMPAIGNS, SEED_TIPS } from './dataMigration';

// Use mock data for demo purposes since we don't have real Firebase yet
const USE_MOCK_DATA = true;

export interface FirebaseCreator extends Omit<Creator, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string; // Link to user profile
}

export interface FirebaseCampaign extends Omit<Campaign, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID of campaign creator
  status: 'active' | 'paused' | 'completed' | 'expired';
  applications: string[]; // Array of user IDs who applied
  savedBy: string[]; // Array of user IDs who saved this campaign
}

export interface FirebaseTip extends Omit<Tip, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID of tip creator
  likedBy: string[]; // Array of user IDs who liked this tip
  savedBy: string[]; // Array of user IDs who saved this tip
}

export class DataService {
  // CREATORS
  static async getCreators(
    lastDoc?: DocumentSnapshot,
    limitCount: number = 20,
    filters?: {
      category?: string;
      location?: string;
      verified?: boolean;
    }
  ): Promise<{ creators: Creator[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, 'creators'),
        orderBy('followersCount', 'desc'),
        limit(limitCount)
      );

      // Apply filters
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.location) {
        q = query(q, where('location', '==', filters.location));
      }
      if (filters?.verified !== undefined) {
        q = query(q, where('isVerified', '==', filters.verified));
      }

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const creators: Creator[] = [];
      let lastDocument: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        creators.push({
          id: doc.id,
          ...doc.data()
        } as Creator);
        lastDocument = doc;
      });

      return { creators, lastDoc: querySnapshot.docs.length > 0 ? lastDocument : null };
    } catch (error) {
      console.error('Get creators error:', error);
      throw new Error('Failed to fetch creators');
    }
  }

  static async getCreatorById(id: string): Promise<Creator | null> {
    try {
      const docSnapshot = await getDoc(doc(db, 'creators', id));
      if (docSnapshot.exists()) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data()
        } as Creator;
      }
      return null;
    } catch (error) {
      console.error('Get creator error:', error);
      return null;
    }
  }

  static async followCreator(userId: string, creatorId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Add to user's following list
      batch.update(doc(db, 'users', userId), {
        following: arrayUnion(creatorId),
        followingCount: increment(1)
      });

      // Add to creator's followers list and increment count
      batch.update(doc(db, 'creators', creatorId), {
        followers: arrayUnion(userId),
        followersCount: increment(1)
      });

      // Also update user document if they're a creator
      batch.update(doc(db, 'users', creatorId), {
        followersCount: increment(1)
      });

      await batch.commit();
    } catch (error) {
      console.error('Follow creator error:', error);
      throw new Error('Failed to follow creator');
    }
  }

  static async unfollowCreator(userId: string, creatorId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Remove from user's following list
      batch.update(doc(db, 'users', userId), {
        following: arrayRemove(creatorId),
        followingCount: increment(-1)
      });

      // Remove from creator's followers list and decrement count
      batch.update(doc(db, 'creators', creatorId), {
        followers: arrayRemove(userId),
        followersCount: increment(-1)
      });

      // Also update user document if they're a creator
      batch.update(doc(db, 'users', creatorId), {
        followersCount: increment(-1)
      });

      await batch.commit();
    } catch (error) {
      console.error('Unfollow creator error:', error);
      throw new Error('Failed to unfollow creator');
    }
  }

  // CAMPAIGNS
  static async getCampaigns(
    lastDoc?: DocumentSnapshot,
    limitCount: number = 20,
    filters?: {
      category?: string;
      status?: string;
      minBudget?: number;
      maxBudget?: number;
    }
  ): Promise<{ campaigns: Campaign[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, 'campaigns'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Apply filters
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const campaigns: Campaign[] = [];
      let lastDocument: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseCampaign;
        campaigns.push({
          id: doc.id,
          title: data.title,
          brand: data.brand,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline,
          category: data.category,
          requirements: data.requirements,
          applicants: data.applications.length,
          image: data.image
        });
        lastDocument = doc;
      });

      return { campaigns, lastDoc: querySnapshot.docs.length > 0 ? lastDocument : null };
    } catch (error) {
      console.error('Get campaigns error:', error);
      throw new Error('Failed to fetch campaigns');
    }
  }

  static async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const docSnapshot = await getDoc(doc(db, 'campaigns', id));
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as FirebaseCampaign;
        return {
          id: docSnapshot.id,
          title: data.title,
          brand: data.brand,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline,
          category: data.category,
          requirements: data.requirements,
          applicants: data.applications.length,
          image: data.image
        };
      }
      return null;
    } catch (error) {
      console.error('Get campaign error:', error);
      return null;
    }
  }

  static async saveCampaign(userId: string, campaignId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Add to user's saved campaigns
      batch.update(doc(db, 'users', userId), {
        savedCampaigns: arrayUnion(campaignId)
      });

      // Add user to campaign's savedBy list
      batch.update(doc(db, 'campaigns', campaignId), {
        savedBy: arrayUnion(userId)
      });

      await batch.commit();
    } catch (error) {
      console.error('Save campaign error:', error);
      throw new Error('Failed to save campaign');
    }
  }

  static async unsaveCampaign(userId: string, campaignId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Remove from user's saved campaigns
      batch.update(doc(db, 'users', userId), {
        savedCampaigns: arrayRemove(campaignId)
      });

      // Remove user from campaign's savedBy list
      batch.update(doc(db, 'campaigns', campaignId), {
        savedBy: arrayRemove(userId)
      });

      await batch.commit();
    } catch (error) {
      console.error('Unsave campaign error:', error);
      throw new Error('Failed to unsave campaign');
    }
  }

  static async applyToCampaign(userId: string, campaignId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Add to user's applied campaigns
      batch.update(doc(db, 'users', userId), {
        appliedCampaigns: arrayUnion(campaignId)
      });

      // Add user to campaign's applications
      batch.update(doc(db, 'campaigns', campaignId), {
        applications: arrayUnion(userId)
      });

      await batch.commit();
    } catch (error) {
      console.error('Apply to campaign error:', error);
      throw new Error('Failed to apply to campaign');
    }
  }

  // TIPS
  static async getTips(
    lastDoc?: DocumentSnapshot,
    limitCount: number = 20,
    filters?: {
      category?: string;
    }
  ): Promise<{ tips: Tip[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, 'tips'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Apply filters
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const tips: Tip[] = [];
      let lastDocument: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseTip;
        tips.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          category: data.category,
          author: data.author,
          likes: data.likedBy.length,
          date: data.createdAt.toDate().toISOString()
        });
        lastDocument = doc;
      });

      return { tips, lastDoc: querySnapshot.docs.length > 0 ? lastDocument : null };
    } catch (error) {
      console.error('Get tips error:', error);
      throw new Error('Failed to fetch tips');
    }
  }

  static async saveTip(userId: string, tipId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Add to user's saved tips
      batch.update(doc(db, 'users', userId), {
        savedTips: arrayUnion(tipId)
      });

      // Add user to tip's savedBy list
      batch.update(doc(db, 'tips', tipId), {
        savedBy: arrayUnion(userId)
      });

      await batch.commit();
    } catch (error) {
      console.error('Save tip error:', error);
      throw new Error('Failed to save tip');
    }
  }

  static async unsaveTip(userId: string, tipId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Remove from user's saved tips
      batch.update(doc(db, 'users', userId), {
        savedTips: arrayRemove(tipId)
      });

      // Remove user from tip's savedBy list
      batch.update(doc(db, 'tips', tipId), {
        savedBy: arrayRemove(userId)
      });

      await batch.commit();
    } catch (error) {
      console.error('Unsave tip error:', error);
      throw new Error('Failed to unsave tip');
    }
  }

  static async likeTip(userId: string, tipId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'tips', tipId), {
        likedBy: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Like tip error:', error);
      throw new Error('Failed to like tip');
    }
  }

  static async unlikeTip(userId: string, tipId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'tips', tipId), {
        likedBy: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Unlike tip error:', error);
      throw new Error('Failed to unlike tip');
    }
  }

  // FILE UPLOAD
  static async uploadFile(
    file: Blob,
    path: string,
    userId: string
  ): Promise<string> {
    try {
      const fileRef = ref(storage, `${userId}/${path}/${Date.now()}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload file error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Delete file error:', error);
      throw new Error('Failed to delete file');
    }
  }

  // REAL-TIME LISTENERS
  static subscribeToCreators(
    callback: (creators: Creator[]) => void,
    filters?: { category?: string; location?: string }
  ): () => void {
    let q = query(
      collection(db, 'creators'),
      orderBy('followersCount', 'desc'),
      limit(50)
    );

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.location) {
      q = query(q, where('location', '==', filters.location));
    }

    return onSnapshot(q, (snapshot) => {
      const creators: Creator[] = [];
      snapshot.forEach((doc) => {
        creators.push({
          id: doc.id,
          ...doc.data()
        } as Creator);
      });
      callback(creators);
    });
  }

  static subscribeToCampaigns(
    callback: (campaigns: Campaign[]) => void,
    filters?: { category?: string }
  ): () => void {
    let q = query(
      collection(db, 'campaigns'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    return onSnapshot(q, (snapshot) => {
      const campaigns: Campaign[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirebaseCampaign;
        campaigns.push({
          id: doc.id,
          title: data.title,
          brand: data.brand,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline,
          category: data.category,
          requirements: data.requirements,
          applicants: data.applications.length,
          image: data.image
        });
      });
      callback(campaigns);
    });
  }

  static subscribeToTips(
    callback: (tips: Tip[]) => void,
    filters?: { category?: string }
  ): () => void {
    let q = query(
      collection(db, 'tips'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    return onSnapshot(q, (snapshot) => {
      const tips: Tip[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirebaseTip;
        tips.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          category: data.category,
          author: data.author,
          likes: data.likedBy.length,
          date: data.createdAt.toDate().toISOString()
        });
      });
      callback(tips);
    });
  }
}