// Load test environment variables
process.env.NODE_ENV = 'test';
process.env.FIREBASE_USE_EMULATOR = 'true';
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.FIREBASE_PROJECT_ID = 'test-zimbuzz';
process.env.FIREBASE_STORAGE_BUCKET = 'test-zimbuzz.appspot.com';
process.env.FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.FIREBASE_APP_ID = 'test-app-id';

// Emulator ports
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST = '127.0.0.1:5001';

// Test data
process.env.TEST_USER_EMAIL = 'test@zimbuzz.com';
process.env.TEST_USER_PASSWORD = 'TestPassword123!';
process.env.TEST_USER_DISPLAY_NAME = 'Test User';
process.env.TEST_CAMPAIGN_TITLE = 'Test Campaign';
process.env.TEST_CAMPAIGN_DESCRIPTION = 'This is a test campaign for Firebase integration testing';

// Expo test configuration
process.env.EXPO_PROJECT_ID = 'test-expo-project';

console.log('🔧 Test environment variables loaded');