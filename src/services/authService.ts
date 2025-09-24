import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import MockAuthService, { MockUser, MockUserProfile } from './mockAuthService';

// Use mock service for demo purposes
const USE_MOCK_AUTH = true;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  isCreator: boolean;
  createdAt: any;
  updatedAt: any;
  // Creator-specific fields
  category?: string;
  socialMediaHandles?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  // Statistics
  followersCount: number;
  followingCount: number;
  campaignsCompleted: number;
  isVerified: boolean;
}

export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    if (USE_MOCK_AUTH) {
      try {
        const mockProfile = await MockAuthService.signUp(email, password, displayName);
        return {
          ...mockProfile,
          createdAt: mockProfile.createdAt,
          updatedAt: mockProfile.updatedAt
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        photoURL: user.photoURL,
        isCreator: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        followersCount: 0,
        followingCount: 0,
        campaignsCompleted: 0,
        isVerified: false
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return userProfile;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<UserProfile> {
    if (USE_MOCK_AUTH) {
      try {
        const mockProfile = await MockAuthService.signIn(email, password);
        return {
          ...mockProfile,
          createdAt: mockProfile.createdAt,
          updatedAt: mockProfile.updatedAt
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(user.uid);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp()
      });

      return userProfile;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    if (USE_MOCK_AUTH) {
      try {
        await MockAuthService.signOut();
      } catch (error: any) {
        throw new Error('Failed to sign out');
      }
      return;
    }

    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update Firestore document
      await updateDoc(doc(db, 'users', uid), updateData);

      // Update Auth profile if display name or photo changed
      if (auth.currentUser && (updates.displayName || updates.photoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL
        });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Become a creator
  static async becomeCreator(uid: string, creatorData: {
    category: string;
    bio: string;
    location: string;
    socialMediaHandles?: UserProfile['socialMediaHandles'];
  }): Promise<void> {
    if (USE_MOCK_AUTH) {
      try {
        await MockAuthService.becomeCreator(uid, creatorData);
      } catch (error: any) {
        throw new Error('Failed to become creator');
      }
      return;
    }

    try {
      const updates = {
        isCreator: true,
        category: creatorData.category,
        bio: creatorData.bio,
        location: creatorData.location,
        socialMediaHandles: creatorData.socialMediaHandles || {},
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', uid), updates);

      // Also add to creators collection for easy querying
      const creatorProfile = await this.getUserProfile(uid);
      if (creatorProfile) {
        await setDoc(doc(db, 'creators', uid), {
          ...creatorProfile,
          ...updates
        });
      }
    } catch (error: any) {
      console.error('Become creator error:', error);
      throw new Error('Failed to become creator');
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (USE_MOCK_AUTH) {
      return MockAuthService.onAuthStateChanged(callback as any);
    }
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Helper method to get user-friendly error messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/operation-not-allowed':
        return 'Email/password sign in is not enabled';
      case 'auth/requires-recent-login':
        return 'Please log in again to complete this action';
      default:
        return 'An error occurred. Please try again';
    }
  }
}

// Auth context helper types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  becomeCreator: (creatorData: {
    category: string;
    bio: string;
    location: string;
    socialMediaHandles?: UserProfile['socialMediaHandles'];
  }) => Promise<void>;
}