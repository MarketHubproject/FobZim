module.exports = {
  preset: 'react-native',
  
  // Test environment setup
  testEnvironment: 'node',
  
  // Setup files to run before each test suite
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/tests/**/*.test.ts',
    '<rootDir>/src/tests/**/*.test.tsx'
  ],
  
  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files with TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/tests/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  
  // Coverage thresholds (disabled for initial testing)
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },
  
  // Test timeout (30 seconds for Firebase operations)
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Run tests in sequence for Firebase emulator stability
  maxWorkers: 1,
  
  // Disable collecting coverage by default for faster testing
  collectCoverage: false,
  
  // Global test setup
  globalSetup: '<rootDir>/src/tests/globalSetup.ts',
  globalTeardown: '<rootDir>/src/tests/globalTeardown.ts',
  
  // Environment variables for tests
  setupFiles: ['<rootDir>/src/tests/env.setup.ts'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
    '<rootDir>/.expo/',
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Reporter configuration (simplified)
  reporters: ['default'],
};