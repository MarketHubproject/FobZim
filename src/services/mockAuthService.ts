// Mock authentication service for demo purposes
// This simulates Firebase auth functionality without requiring a real Firebase project

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface MockUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  isCreator: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  socialMediaHandles?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  followersCount: number;
  followingCount: number;
  campaignsCompleted: number;
  isVerified: boolean;
}

class MockAuthService {
  private static currentUser: MockUser | null = null;
  private static userProfile: MockUserProfile | null = null;
  private static authStateListeners: ((user: MockUser | null) => void)[] = [];

  // Demo users for testing
  private static demoUsers: Map<string, { user: MockUser; profile: MockUserProfile }> = new Map([
    ['demo@zimbuzz.com', {
      user: {
        uid: 'demo-user-1',
        email: 'demo@zimbuzz.com',
        displayName: 'Demo User',
        photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
      },
      profile: {
        uid: 'demo-user-1',
        email: 'demo@zimbuzz.com',
        displayName: 'Demo User',
        photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        bio: 'Demo user for testing ZimBuzz',
        location: 'Harare',
        isCreator: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        followersCount: 0,
        followingCount: 0,
        campaignsCompleted: 0,
        isVerified: false
      }
    }],
    ['creator@zimbuzz.com', {
      user: {
        uid: 'demo-creator-1',
        email: 'creator@zimbuzz.com',
        displayName: 'Demo Creator',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      profile: {
        uid: 'demo-creator-1',
        email: 'creator@zimbuzz.com',
        displayName: 'Demo Creator',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        bio: 'Demo creator showcasing Zimbabwean lifestyle and culture',
        location: 'Harare',
        isCreator: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: 'Lifestyle',
        socialMediaHandles: {
          instagram: '@democreator',
          twitter: '@democreator'
        },
        followersCount: 1500,
        followingCount: 245,
        campaignsCompleted: 12,
        isVerified: true
      }
    }]
  ]);

  static async signUp(email: string, password: string, displayName: string): Promise<MockUserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.demoUsers.has(email)) {
      throw new Error('An account already exists with this email address');
    }

    // Create new mock user
    const uid = `user-${Date.now()}`;
    const user: MockUser = {
      uid,
      email,
      displayName,
      photoURL: undefined
    };

    const profile: MockUserProfile = {
      uid,
      email,
      displayName,
      photoURL: undefined,
      isCreator: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      followersCount: 0,
      followingCount: 0,
      campaignsCompleted: 0,
      isVerified: false
    };

    // Store the new user
    this.demoUsers.set(email, { user, profile });
    
    // Set as current user
    this.currentUser = user;
    this.userProfile = profile;
    
    // Notify listeners
    this.notifyAuthStateListeners();

    return profile;
  }

  static async signIn(email: string, password: string): Promise<MockUserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const userData = this.demoUsers.get(email);
    if (!userData) {
      throw new Error('No account found with this email address');
    }

    if (password !== 'demo123') {
      throw new Error('Incorrect password');
    }

    this.currentUser = userData.user;
    this.userProfile = userData.profile;
    
    // Notify listeners
    this.notifyAuthStateListeners();

    return userData.profile;
  }

  static async signOut(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    this.currentUser = null;
    this.userProfile = null;
    
    // Notify listeners
    this.notifyAuthStateListeners();
  }

  static async getUserProfile(uid: string): Promise<MockUserProfile | null> {
    // Find user by uid
    for (const [email, userData] of this.demoUsers) {
      if (userData.user.uid === uid) {
        return userData.profile;
      }
    }
    return null;
  }

  static async updateUserProfile(uid: string, updates: Partial<MockUserProfile>): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find and update user
    for (const [email, userData] of this.demoUsers) {
      if (userData.user.uid === uid) {
        Object.assign(userData.profile, updates, { updatedAt: new Date() });
        if (this.userProfile?.uid === uid) {
          Object.assign(this.userProfile, updates, { updatedAt: new Date() });
        }
        break;
      }
    }
  }

  static async becomeCreator(uid: string, creatorData: {
    category: string;
    bio: string;
    location: string;
    socialMediaHandles?: MockUserProfile['socialMediaHandles'];
  }): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    await this.updateUserProfile(uid, {
      isCreator: true,
      category: creatorData.category,
      bio: creatorData.bio,
      location: creatorData.location,
      socialMediaHandles: creatorData.socialMediaHandles
    });
  }

  static onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  static getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  private static notifyAuthStateListeners(): void {
    this.authStateListeners.forEach(callback => callback(this.currentUser));
  }

  static getAuthErrorMessage(errorCode: string): string {
    return errorCode || 'An error occurred. Please try again';
  }
}

export default MockAuthService;