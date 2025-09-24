import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Test Firebase configuration
const testFirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'test-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'test-zimbuzz',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'test-zimbuzz.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || 'test-app-id',
};

class FirebaseTestConfig {
  public app: FirebaseApp;
  public auth: Auth;
  public db: Firestore;
  public storage: FirebaseStorage;
  private isEmulatorConnected = false;

  constructor() {
    // Initialize Firebase app
    this.app = initializeApp(testFirebaseConfig, 'test-app');
    
    // Initialize services
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);

    // Connect to emulators in test environment
    this.connectToEmulators();
  }

  private connectToEmulators() {
    if (process.env.FIREBASE_USE_EMULATOR === 'true' && !this.isEmulatorConnected) {
      try {
        // Connect Auth emulator
        const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
        const [authIp, authPort] = authHost.split(':');
        connectAuthEmulator(this.auth, `http://${authIp}:${authPort}`);
        
        // Connect Firestore emulator
        const firestoreHost = process.env.FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
        const [firestoreIp, firestorePort] = firestoreHost.split(':');
        connectFirestoreEmulator(this.db, firestoreIp, parseInt(firestorePort));
        
        // Connect Storage emulator
        const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
        const [storageIp, storagePort] = storageHost.split(':');
        connectStorageEmulator(this.storage, storageIp, parseInt(storagePort));

        this.isEmulatorConnected = true;
        console.log('🔧 Connected to Firebase emulators for testing');
      } catch (error) {
        console.warn('Failed to connect to emulators:', error);
        console.log('Make sure Firebase emulators are running: firebase emulators:start');
      }
    }
  }

  /**
   * Reset emulator data for clean testing
   */
  async resetEmulatorData() {
    if (process.env.FIREBASE_USE_EMULATOR !== 'true') {
      console.warn('Cannot reset data - not using emulators');
      return;
    }

    try {
      // Clear Auth users
      await fetch('http://localhost:9099/emulator/v1/projects/test-zimbuzz/accounts', {
        method: 'DELETE'
      });

      // Clear Firestore data
      await fetch('http://localhost:8080/emulator/v1/projects/test-zimbuzz/databases/(default)/documents', {
        method: 'DELETE'
      });

      // Clear Storage files
      await fetch('http://localhost:9199/storage/v1/b/test-zimbuzz.appspot.com/o', {
        method: 'DELETE'
      });

      console.log('🧹 Emulator data reset complete');
    } catch (error) {
      console.error('Failed to reset emulator data:', error);
    }
  }

  /**
   * Cleanup Firebase connections
   */
  async cleanup() {
    // Clear any active listeners
    // Additional cleanup logic can be added here
    console.log('🧽 Firebase test cleanup complete');
  }
}

// Export singleton instance for testing
export const firebaseTest = new FirebaseTestConfig();

// Export individual services for convenience
export const { app: testApp, auth: testAuth, db: testDb, storage: testStorage } = firebaseTest;

// Test utilities
export const testConfig = {
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@zimbuzz.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    displayName: process.env.TEST_USER_DISPLAY_NAME || 'Test User',
  },
  testCampaign: {
    title: process.env.TEST_CAMPAIGN_TITLE || 'Test Campaign',
    description: process.env.TEST_CAMPAIGN_DESCRIPTION || 'This is a test campaign for Firebase integration testing',
  },
};

export default firebaseTest;