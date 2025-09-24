import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// Note: getReactNativePersistence may not be available in all Firebase versions
// import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo Firebase configuration for testing
// Note: Replace with your actual Firebase config from Firebase Console for production
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "zimbuzz-demo.firebaseapp.com",
  projectId: "demo-project-id",
  storageBucket: "zimbabuzz-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo-app-id",
  measurementId: "G-DEMO123456"
};

// For demo purposes, we'll disable actual Firebase initialization
// and work with mock authentication. In production, you'd configure real Firebase.

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
let auth;
try {
  // For migration service, we don't need React Native specific persistence
  auth = initializeAuth(app);
} catch (error) {
  // If already initialized, get the existing auth instance
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// For development, you can connect to emulators
// Uncomment these lines if you want to use Firebase emulators for development
/*
if (__DEV__) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}
*/

export { auth, db, storage, firebaseConfig };
export default app;

// Firebase configuration instructions for users:
/*
To set up Firebase for your project:

1. Go to https://console.firebase.google.com/
2. Create a new project or select existing project
3. Add a web app to your project
4. Copy the configuration object and replace the firebaseConfig above
5. Enable Authentication and Firestore in the Firebase Console
6. Set up authentication methods (Email/Password, Google, etc.)
7. Create Firestore security rules for your collections

Sample Firestore Security Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read creators and campaigns
    match /creators/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /campaigns/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /tips/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
*/