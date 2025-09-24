"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
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
if ((0, app_1.getApps)().length === 0) {
    app = (0, app_1.initializeApp)(firebaseConfig);
}
else {
    app = (0, app_1.getApps)()[0];
}
// Initialize Auth with AsyncStorage persistence
let auth;
try {
    exports.auth = auth = (0, auth_1.initializeAuth)(app, {
        persistence: (0, auth_1.getReactNativePersistence)(async_storage_1.default),
    });
}
catch (error) {
    // If already initialized, get the existing auth instance
    exports.auth = auth = (0, auth_1.getAuth)(app);
}
// Initialize Firestore
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
// Initialize Storage
const storage = (0, storage_1.getStorage)(app);
exports.storage = storage;
exports.default = app;
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
