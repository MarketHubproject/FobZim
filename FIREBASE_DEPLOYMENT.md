# Firebase Production Deployment Guide for ZimBuzz

This guide walks you through deploying your ZimBuzz app to production Firebase, including security rules, environment configuration, and initial data setup.

## Prerequisites

1. **Firebase CLI** installed and authenticated:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Firebase Project** created in the Firebase Console
3. **Environment variables** set up (see `.env.template`)

## Step 1: Initialize Firebase in Your Project

Run this in your project root:

```bash
firebase init
```

Select the following services:
- ☑️ Firestore: Deploy rules and create indexes
- ☑️ Storage: Deploy rules
- ☑️ Functions: Deploy Cloud Functions (if using)
- ☑️ Hosting: Deploy hosting (if deploying web version)

When prompted:
- **Firestore rules file**: Choose `firestore.rules`
- **Storage rules file**: Choose `storage.rules`
- **Public directory**: Choose `dist` or `build` (if using hosting)

## Step 2: Configure Environment Variables

1. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```

2. Fill in your Firebase project credentials in `.env`:
   ```env
   # Firebase Configuration
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   
   # Optional: Measurement ID for Analytics
   FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Environment
   NODE_ENV=production
   FIREBASE_USE_EMULATOR=false
   ```

3. Get your Firebase config from:
   - Firebase Console → Project Settings → General Tab → Your apps → Config

## Step 3: Deploy Security Rules

Deploy Firestore and Storage security rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage:rules

# Or deploy both at once
firebase deploy --only firestore:rules,storage:rules
```

## Step 4: Set up Firestore Indexes

Create necessary indexes for optimal query performance:

```bash
# This file should be auto-generated during firebase init
# But you can also create custom indexes in Firebase Console
firebase deploy --only firestore:indexes
```

### Required Indexes

Add these composite indexes in Firebase Console or `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "campaigns",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "campaigns", 
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "category", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "campaigns",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "visibility", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "conversationId", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "contributions",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "campaignId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

## Step 5: Set up Authentication

### Enable Auth Providers

In Firebase Console → Authentication → Sign-in method, enable:
- ☑️ Email/Password
- ☑️ Google (recommended)
- ☑️ Phone (optional)
- ☑️ Anonymous (optional, for guest features)

### Configure Auth Settings

1. **Authorized domains**: Add your domains (for web deployment)
2. **Email templates**: Customize verification and password reset emails
3. **User account settings**: Configure password requirements

## Step 6: Initialize Database Collections

Run this setup script to create initial admin accounts and collections:

```bash
# Create a setup script
node scripts/initializeDatabase.js
```

Create `scripts/initializeDatabase.js`:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id-default-rtdb.firebaseio.com',
  storageBucket: 'your-project-id.appspot.com'
});

const db = admin.firestore();

async function initializeDatabase() {
  try {
    // Create admin user (replace with your actual admin UID)
    const adminUID = 'YOUR_ADMIN_USER_UID';
    await db.collection('admins').doc(adminUID).set({
      email: 'admin@zimbuzz.com',
      role: 'super_admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create sample tips
    const tips = [
      {
        id: 'tip1',
        title: 'Building Trust with Supporters',
        content: 'Regular updates and transparency build lasting relationships with your campaign supporters.',
        category: 'engagement',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'tip2', 
        title: 'Effective Campaign Messaging',
        content: 'Clear, compelling messages that explain your cause and impact drive better contribution rates.',
        category: 'messaging',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const tip of tips) {
      await db.collection('tips').doc(tip.id).set(tip);
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
```

## Step 7: Configure Cloud Storage

Set up storage buckets and CORS if needed:

```bash
# Install gsutil if not already installed
# Configure CORS for your storage bucket
gsutil cors set cors.json gs://your-project-id.appspot.com
```

Create `cors.json`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

## Step 8: Set up Cloud Functions (Optional)

If you have serverless functions for notifications, analytics, etc.:

```bash
# Deploy functions
firebase deploy --only functions

# Or specific functions
firebase deploy --only functions:sendNotification,functions:updateAnalytics
```

## Step 9: Configure Push Notifications

### For iOS (APNs):
1. Generate APNs certificates in Apple Developer Console
2. Upload to Firebase Console → Cloud Messaging → Apple app configuration

### For Android (FCM):
1. Download `google-services.json` from Firebase Console
2. Place in your `android/app/` directory

## Step 10: Set up Monitoring & Analytics

### Enable Firebase Analytics
```bash
firebase deploy --only analytics
```

### Set up Crashlytics
```bash
# Install Crashlytics in your app
npm install @react-native-firebase/crashlytics
```

### Configure Performance Monitoring
```bash
# Enable in Firebase Console
# Add Performance SDK to your app
npm install @react-native-firebase/perf
```

## Step 11: Test Your Production Setup

1. **Test Authentication**:
   ```bash
   # Use your production config to test login/signup
   ```

2. **Test Database Operations**:
   ```bash
   # Create, read, update campaigns
   # Test security rules with different user roles
   ```

3. **Test File Uploads**:
   ```bash
   # Upload profile pictures, campaign images
   # Verify security rules are working
   ```

## Step 12: Deploy Your App

### For Mobile (React Native):
```bash
# Build for production
npx react-native build --variant=release

# Upload to App Store / Play Store
```

### For Web (if applicable):
```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Step 13: Production Checklist

- [ ] Environment variables configured
- [ ] Security rules deployed and tested
- [ ] Indexes created for optimal queries
- [ ] Authentication providers enabled
- [ ] Admin accounts created
- [ ] Initial data seeded
- [ ] Push notifications configured
- [ ] Analytics and monitoring enabled
- [ ] CORS configured for storage
- [ ] App deployed to stores/hosting
- [ ] Domain configured (if web)
- [ ] SSL certificates configured
- [ ] Backup strategy implemented

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use security rules** - don't rely only on client-side validation
3. **Regular backups** of Firestore data
4. **Monitor usage** and set up billing alerts
5. **Review security rules** periodically
6. **Use least privilege** principle for user permissions
7. **Enable audit logging** for sensitive operations

## Monitoring & Maintenance

1. **Set up alerts** in Firebase Console for:
   - High error rates
   - Unusual usage patterns
   - Security rule violations

2. **Regular tasks**:
   - Review analytics data
   - Update security rules as needed
   - Monitor performance metrics
   - Update Firebase SDK versions

## Backup Strategy

Set up automated backups:

```bash
# Install backup tool
npm install -g @google-cloud/firestore

# Create backup script
gcloud firestore export gs://your-backup-bucket/backups/$(date +%Y%m%d_%H%M%S)
```

## Support & Resources

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Status: https://status.firebase.google.com
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: firebase + react-native tags

---

## Quick Commands Reference

```bash
# Deploy everything
firebase deploy

# Deploy only rules
firebase deploy --only firestore:rules,storage:rules

# Deploy specific functions
firebase deploy --only functions:functionName

# View deployment status
firebase projects:list

# Switch between projects
firebase use project-id

# View current project
firebase use
```

Happy deploying! 🚀