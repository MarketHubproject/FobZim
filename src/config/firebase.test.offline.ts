/**
 * Firebase Test Configuration - Offline/Mock Mode
 * This configuration allows tests to run without Firebase emulators
 * by using mocks and local state simulation.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  getStorage, 
  Storage, 
  connectStorageEmulator,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

interface TestUser {
  email: string;
  password: string;
  displayName: string;
  uid?: string;
}

interface FirebaseTestConfigOffline {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: Storage;
  testUser: TestUser;
  emulatorsEnabled: boolean;
  connectToEmulators(): Promise<void>;
  resetEmulatorData(): Promise<void>;
  cleanup(): Promise<void>;
  checkEmulatorConnection(): Promise<boolean>;
}

class OfflineFirebaseTestConfig implements FirebaseTestConfigOffline {
  public app: FirebaseApp;
  public auth: Auth;
  public db: Firestore;
  public storage: Storage;
  public emulatorsEnabled: boolean = false;

  public testUser: TestUser = {
    email: `test-${Date.now()}@zimbuzz.test`,
    password: 'TestPassword123!',
    displayName: 'Test User'
  };

  constructor() {
    // Initialize Firebase app for testing
    this.app = initializeApp({
      projectId: 'demo-zimbuzz',
      apiKey: 'demo-api-key',
      authDomain: 'demo-zimbuzz.firebaseapp.com',
      storageBucket: 'demo-zimbuzz.appspot.com'
    });

    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  async checkEmulatorConnection(): Promise<boolean> {
    try {
      // Try to connect to auth emulator
      const response = await fetch('http://127.0.0.1:9099/');
      return response.ok;
    } catch (error) {
      console.log('🔍 Emulators not running, using offline mode');
      return false;
    }
  }

  async connectToEmulators(): Promise<void> {
    const emulatorsRunning = await this.checkEmulatorConnection();
    
    if (emulatorsRunning) {
      try {
        // Connect to emulators if they're running
        if (!this.auth.config.emulator) {
          connectAuthEmulator(this.auth, 'http://127.0.0.1:9099');
        }
        if (!(this.db as any)._delegate._settings?.host?.includes('127.0.0.1')) {
          connectFirestoreEmulator(this.db, '127.0.0.1', 8080);
        }
        if (!(this.storage as any)._delegate.host.includes('127.0.0.1')) {
          connectStorageEmulator(this.storage, '127.0.0.1', 9199);
        }
        
        this.emulatorsEnabled = true;
        console.log('🔧 Connected to Firebase emulators for testing');
      } catch (error) {
        console.log('⚠️ Failed to connect to emulators, falling back to mock mode');
        this.emulatorsEnabled = false;
      }
    } else {
      console.log('🎭 Using offline mock mode - emulators not available');
      this.emulatorsEnabled = false;
    }
  }

  async resetEmulatorData(): Promise<void> {
    if (!this.emulatorsEnabled) {
      console.log('🎭 Skipping emulator reset in offline mode');
      return;
    }

    try {
      // Only attempt to reset if emulators are actually running
      const promises = [
        // Clear Auth emulator
        fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-zimbuzz/accounts', {
          method: 'DELETE'
        }),
        // Clear Firestore emulator  
        fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-zimbuzz/databases/(default)/documents', {
          method: 'DELETE'
        }),
        // Clear Storage emulator
        fetch('http://127.0.0.1:9199/internal/reset', {
          method: 'POST'
        })
      ];

      await Promise.all(promises);
      console.log('🧽 Firebase emulator data reset complete');
    } catch (error) {
      console.log('⚠️ Failed to reset emulator data, continuing with offline mode');
      this.emulatorsEnabled = false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.emulatorsEnabled) {
      try {
        await signOut(this.auth);
        console.log('🧽 Firebase test cleanup complete');
      } catch (error) {
        console.log('⚠️ Cleanup warning (emulator mode):', error);
      }
    } else {
      console.log('🧽 Offline mode cleanup complete');
    }
  }
}

// Export singleton instance
export const offlineTestConfig = new OfflineFirebaseTestConfig();

// Export types for tests
export type { TestUser, FirebaseTestConfigOffline };

/**
 * Utility function to create mock user credential for offline tests
 */
export function createMockUserCredential(user: Partial<User>): UserCredential {
  const mockUser: User = {
    uid: user.uid || `mock-uid-${Date.now()}`,
    email: user.email || 'test@example.com',
    emailVerified: user.emailVerified || false,
    displayName: user.displayName || 'Test User',
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => Promise.resolve(),
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
      token: 'mock-id-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      claims: {}
    }),
    reload: async () => Promise.resolve(),
    toJSON: () => ({ uid: user.uid, email: user.email }),
    providerId: 'firebase',
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };

  return {
    user: mockUser,
    operationType: 'signIn',
    providerId: 'password'
  };
}

/**
 * Check if we should use emulators or offline mode
 */
export async function shouldUseEmulators(): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:9099/', { 
      method: 'GET',
      signal: AbortSignal.timeout(1000) // 1 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}