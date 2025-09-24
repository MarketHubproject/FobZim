import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { testAuth, testDb, firebaseTest, testConfig } from '../config/firebase.test';

describe('Firebase Authentication Tests', () => {
  let testUser: User | null = null;

  beforeEach(async () => {
    // Reset emulator data before each test
    await firebaseTest.resetEmulatorData();
  });

  afterEach(async () => {
    // Clean up after each test
    if (testUser) {
      try {
        await signOut(testAuth);
        testUser = null;
      } catch (error) {
        console.warn('Error signing out test user:', error);
      }
    }
  });

  afterAll(async () => {
    await firebaseTest.cleanup();
  });

  describe('User Registration', () => {
    test('should create a new user with email and password', async () => {
      const { email, password, displayName } = testConfig.testUser;
      
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      
      testUser = userCredential.user;
      
      expect(testUser).toBeTruthy();
      expect(testUser.email).toBe(email);
      expect(testUser.uid).toBeTruthy();
      expect(testUser.emailVerified).toBe(false); // New users aren't verified by default
    });

    test('should update user profile after registration', async () => {
      const { email, password, displayName } = testConfig.testUser;
      
      const userCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      
      testUser = userCredential.user;
      
      await updateProfile(testUser, {
        displayName: displayName
      });
      
      // Refresh user data
      await testUser.reload();
      
      expect(testUser.displayName).toBe(displayName);
    });

    test('should create user profile in Firestore', async () => {
      const { email, password, displayName } = testConfig.testUser;
      
      const userCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      
      testUser = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        uid: testUser.uid,
        email: testUser.email,
        displayName: displayName,
        bio: '',
        location: '',
        profileImageUrl: '',
        isCreator: false,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(testDb, 'users', testUser.uid), userProfile);
      
      // Verify profile was created
      const profileDoc = await getDoc(doc(testDb, 'users', testUser.uid));
      expect(profileDoc.exists()).toBe(true);
      
      const savedProfile = profileDoc.data();
      expect(savedProfile?.email).toBe(email);
      expect(savedProfile?.displayName).toBe(displayName);
    });

    test('should fail with invalid email', async () => {
      await expect(
        createUserWithEmailAndPassword(testAuth, 'invalid-email', 'password123')
      ).rejects.toThrow();
    });

    test('should fail with weak password', async () => {
      await expect(
        createUserWithEmailAndPassword(testAuth, 'test@example.com', '123')
      ).rejects.toThrow();
    });
  });

  describe('User Sign In', () => {
    beforeEach(async () => {
      // Create a test user for sign-in tests
      const { email, password } = testConfig.testUser;
      const userCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      testUser = userCredential.user;
      
      // Sign out to test sign in
      await signOut(testAuth);
    });

    test('should sign in with correct credentials', async () => {
      const { email, password } = testConfig.testUser;
      
      const userCredential = await signInWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      
      expect(userCredential.user).toBeTruthy();
      expect(userCredential.user.email).toBe(email);
      expect(testAuth.currentUser).toBeTruthy();
    });

    test('should fail with incorrect password', async () => {
      const { email } = testConfig.testUser;
      
      await expect(
        signInWithEmailAndPassword(testAuth, email, 'wrongpassword')
      ).rejects.toThrow();
    });

    test('should fail with non-existent email', async () => {
      await expect(
        signInWithEmailAndPassword(testAuth, 'nonexistent@example.com', 'password')
      ).rejects.toThrow();
    });
  });

  describe('User Sign Out', () => {
    beforeEach(async () => {
      // Sign in a test user
      const { email, password } = testConfig.testUser;
      const userCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      testUser = userCredential.user;
    });

    test('should sign out successfully', async () => {
      expect(testAuth.currentUser).toBeTruthy();
      
      await signOut(testAuth);
      
      expect(testAuth.currentUser).toBeNull();
    });
  });

  describe('Authentication State Persistence', () => {
    test('should maintain auth state across app restarts', async () => {
      // This test would typically involve restarting the app
      // For now, we'll test that the current user persists
      const { email, password } = testConfig.testUser;
      
      const userCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      testUser = userCredential.user;
      
      expect(testAuth.currentUser?.uid).toBe(testUser.uid);
    });
  });

  describe('Profile Management', () => {
    beforeEach(async () => {
      const { email, password } = testConfig.testUser;
      const userCredential = await createUserWithEmailAndPassword(
        testAuth, 
        email, 
        password
      );
      testUser = userCredential.user;
    });

    test('should update user profile data', async () => {
      const updatedProfile = {
        uid: testUser!.uid,
        email: testUser!.email,
        displayName: 'Updated Display Name',
        bio: 'Updated bio',
        location: 'Test City',
        profileImageUrl: 'https://example.com/image.jpg',
        isCreator: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(testDb, 'users', testUser!.uid), updatedProfile);
      
      const profileDoc = await getDoc(doc(testDb, 'users', testUser!.uid));
      const savedProfile = profileDoc.data();
      
      expect(savedProfile?.displayName).toBe('Updated Display Name');
      expect(savedProfile?.bio).toBe('Updated bio');
      expect(savedProfile?.isCreator).toBe(true);
    });
  });
});

// Utility functions for testing
export const AuthTestUtils = {
  /**
   * Create a test user and return the user object
   */
  async createTestUser(email?: string, password?: string): Promise<User> {
    const testEmail = email || `test-${Date.now()}@example.com`;
    const testPassword = password || 'TestPassword123!';
    
    const userCredential = await createUserWithEmailAndPassword(
      testAuth, 
      testEmail, 
      testPassword
    );
    
    return userCredential.user;
  },

  /**
   * Create a test user with profile data
   */
  async createTestUserWithProfile(
    email?: string, 
    password?: string, 
    profileData?: Partial<any>
  ): Promise<User> {
    const user = await this.createTestUser(email, password);
    
    const defaultProfile = {
      uid: user.uid,
      email: user.email,
      displayName: 'Test User',
      bio: '',
      location: '',
      profileImageUrl: '',
      isCreator: false,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...profileData
    };
    
    await setDoc(doc(testDb, 'users', user.uid), defaultProfile);
    
    return user;
  },

  /**
   * Sign out current user
   */
  async signOutCurrentUser(): Promise<void> {
    if (testAuth.currentUser) {
      await signOut(testAuth);
    }
  }
};