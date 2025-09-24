import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 PRODUCTION FIREBASE CONFIGURATION
// Replace these values with your actual Firebase project config
// Get this from: Firebase Console > Project Settings > General > Your apps > Config
const firebaseConfig = {
  // 🚨 REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:your-app-id",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Development mode configuration
const isDevelopment = __DEV__;
const useEmulators = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized for:', firebaseConfig.projectId);
} else {
  app = getApps()[0];
  console.log('🔥 Firebase app already initialized');
}

// Initialize Authentication with persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('🔐 Firebase Auth initialized with AsyncStorage persistence');
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
  console.log('🔐 Using existing Firebase Auth instance');
}

// Initialize Firestore
const db = getFirestore(app);
console.log('📊 Firestore initialized');

// Initialize Storage
const storage = getStorage(app);
console.log('📁 Firebase Storage initialized');

// Initialize Functions
const functions = getFunctions(app);
console.log('⚡ Firebase Functions initialized');

// Initialize Analytics (web only, will be ignored on mobile)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
    console.log('📈 Firebase Analytics initialized');
  }
} catch (error) {
  console.log('📈 Analytics not available in this environment');
}

// Connect to emulators in development
if (isDevelopment && useEmulators) {
  try {
    console.log('🔧 Connecting to Firebase emulators...');
    
    // Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('📊 Connected to Firestore emulator');
    
    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('📁 Connected to Storage emulator');
    
    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('⚡ Connected to Functions emulator');
    
  } catch (error) {
    console.warn('🔧 Emulators already connected or not available:', error.message);
  }
}

// Enhanced error handling for Firebase operations
export const handleFirebaseError = (error: any): string => {
  console.error('🔥 Firebase Error:', error);
  
  switch (error.code) {
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

// Firebase configuration validation
export const validateFirebaseConfig = (): boolean => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig] || 
        firebaseConfig[key as keyof typeof firebaseConfig].includes('your-') ||
        firebaseConfig[key as keyof typeof firebaseConfig].includes('demo-')) {
      console.warn(`🚨 Firebase config missing or using demo value for: ${key}`);
      return false;
    }
  }
  
  console.log('✅ Firebase configuration validated');
  return true;
};

// Connection status monitoring
export const monitorFirebaseConnection = () => {
  // You can implement connection monitoring here
  console.log('🔍 Monitoring Firebase connection status...');
};

// Export initialized services
export { 
  auth, 
  db, 
  storage, 
  functions, 
  analytics, 
  firebaseConfig,
  isDevelopment,
  useEmulators 
};

export default app;

/*
🔥 FIREBASE SETUP INSTRUCTIONS FOR ZIMBUZZ

1. CREATE FIREBASE PROJECT:
   - Go to https://console.firebase.google.com/
   - Click "Create a project" 
   - Name: "ZimBuzz" or your preferred name
   - Enable Google Analytics (recommended)

2. SETUP WEB APP:
   - In your Firebase project, click "Add app" > Web
   - App nickname: "ZimBuzz Mobile"
   - Copy the config object

3. ENABLE AUTHENTICATION:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (optional)
   - Configure authorized domains

4. SETUP FIRESTORE DATABASE:
   - Go to Firestore Database
   - Create database in production mode
   - Choose location: closest to Zimbabwe (europe-west2 or asia-south1)

5. CONFIGURE STORAGE:
   - Go to Storage
   - Set up Cloud Storage
   - Configure security rules

6. SETUP ENVIRONMENT VARIABLES:
   Create .env file in project root:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   EXPO_PUBLIC_USE_FIREBASE_EMULATORS=false
   ```

7. FIRESTORE SECURITY RULES:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null; // Allow reading other user profiles
       }
       
       // Campaigns collection
       match /campaigns/{campaignId} {
         allow read: if true; // Public campaigns
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && 
           (request.auth.uid == resource.data.createdBy || 
            request.auth.uid in resource.data.moderators);
       }
       
       // Messages collection  
       match /conversations/{conversationId} {
         allow read, write: if request.auth != null && 
           request.auth.uid in resource.data.participants;
         
         match /messages/{messageId} {
           allow read, write: if request.auth != null && 
             request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
         }
       }
       
       // Creators collection
       match /creators/{creatorId} {
         allow read: if true; // Public creator profiles
         allow write: if request.auth != null && request.auth.uid == creatorId;
       }
       
       // Tips collection
       match /tips/{tipId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

8. STORAGE SECURITY RULES:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // User profile images
       match /profiles/{userId}/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Campaign images
       match /campaigns/{campaignId}/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Message attachments
       match /messages/{conversationId}/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

9. TEST CONNECTION:
   Replace the demo firebase config with this production config and test authentication.

10. DEPLOY:
    Your app is now ready for production with real Firebase backend!
*/