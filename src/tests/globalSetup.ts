// Global setup for all tests
export default async function globalSetup() {
  console.log('🔧 Global test setup started');
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.FIREBASE_USE_EMULATOR = 'true';
  
  console.log('✅ Global test setup completed');
}