// Global test setup
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native modules
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return {
    ...ReactNative,
    Platform: {
      ...ReactNative.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    manifest: {},
  },
}));

// Increase timeout for Firebase operations
jest.setTimeout(30000);

// Console setup
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress specific warnings during tests
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Firebase emulator') ||
       args[0].includes('expo-notifications'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillMount') ||
       args[0].includes('componentWillReceiveProps') ||
       args[0].includes('Firebase emulator'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  console.log('🧪 Test setup completed');
});

afterAll(() => {
  // Restore console methods
  console.error = originalError;
  console.warn = originalWarn;
  
  console.log('🧹 Test cleanup completed');
});