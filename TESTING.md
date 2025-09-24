# Firebase Integration Testing Guide

This guide provides comprehensive instructions for testing your ZimBuzz Firebase integration. The test suite covers authentication, Firestore database, Firebase Storage, push notifications, and end-to-end integration testing.

## 📋 Prerequisites

Before running the tests, ensure you have the following installed:

### Required Tools
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase CLI** - Install globally: `npm install -g firebase-tools`
- **Java** (for Firestore emulator)

### Verify Installation
```bash
# Check Firebase CLI
firebase --version

# Check Node.js
node --version

# Check Java (required for Firestore emulator)
java -version
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install all dependencies including test dependencies
npm install
```

### 2. Run All Firebase Tests
```bash
# This command starts emulators and runs the complete test suite
npm run test:firebase
```

### 3. View Test Results
After running tests, open the generated reports:
- **Coverage Report**: `coverage/lcov-report/index.html`
- **Test Report**: `coverage/firebase-test-report.html`

## 🧪 Test Structure

The test suite is organized into several modules:

### Test Files
```
src/tests/
├── env.setup.ts              # Environment configuration
├── setupTests.ts              # Global test setup
├── auth.test.ts               # Authentication tests
├── firestore.test.ts          # Database tests
├── storage.test.ts            # File storage tests
├── notifications.test.ts      # Push notification tests
└── integration.test.ts        # End-to-end integration tests
```

### Configuration Files
```
├── .env.test                  # Test environment variables
├── firebase.json              # Firebase emulator configuration
├── firestore.rules            # Database security rules
├── storage.rules              # Storage security rules
├── jest.config.js             # Jest test configuration
└── scripts/test-firebase.js   # Test runner script
```

## 🔧 Running Tests

### Individual Test Suites
Run specific test modules independently:

```bash
# Authentication tests only
npm run test:auth

# Firestore database tests only
npm run test:firestore

# Firebase Storage tests only
npm run test:storage

# Push notification tests only
npm run test:notifications

# End-to-end integration tests only
npm run test:integration
```

### Test Modes
```bash
# Run tests once
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Full Firebase integration tests (with emulators)
npm run test:firebase
```

### Manual Emulator Control
```bash
# Start emulators manually
npm run emulator:start

# In another terminal, run tests
npm test

# Stop emulators
npm run emulator:stop
```

## 🏗️ Test Environment Setup

### Environment Variables
The test environment uses these variables (defined in `.env.test`):

```env
NODE_ENV=test
FIREBASE_USE_EMULATOR=true
FIREBASE_PROJECT_ID=test-zimbuzz
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

### Emulator Ports
- **Authentication**: 9099
- **Firestore**: 8080
- **Storage**: 9199
- **Functions**: 5001 (if used)
- **Emulator UI**: 4000

### Accessing Emulator UI
While tests are running, access the Firebase Emulator UI:
```
http://localhost:4000
```

## 📝 Test Coverage

### What's Tested

#### Authentication Tests (`auth.test.ts`)
- ✅ User registration with email/password
- ✅ User profile creation in Firestore
- ✅ Sign in with correct/incorrect credentials
- ✅ Sign out functionality
- ✅ Profile data updates
- ✅ Authentication state persistence

#### Firestore Tests (`firestore.test.ts`)
- ✅ Campaign CRUD operations
- ✅ Real-time data synchronization
- ✅ Complex queries and filtering
- ✅ Message creation and ordering
- ✅ Contribution management
- ✅ Campaign sharing in messages
- ✅ Real-time listeners and subscriptions

#### Storage Tests (`storage.test.ts`)
- ✅ Profile image uploads
- ✅ Campaign media uploads
- ✅ Message attachments
- ✅ File metadata management
- ✅ File deletion and cleanup
- ✅ Directory organization
- ✅ Concurrent upload handling

#### Notification Tests (`notifications.test.ts`)
- ✅ Push token registration/unregistration
- ✅ Sending notifications to specific users
- ✅ Campaign update notifications
- ✅ Message notifications
- ✅ Scheduled notifications
- ✅ Notification listeners
- ✅ Error handling and recovery

#### Integration Tests (`integration.test.ts`)
- ✅ Complete campaign workflow
- ✅ End-to-end messaging with attachments
- ✅ Multi-user concurrent interactions
- ✅ Error recovery and resilience
- ✅ Performance and batch operations

### Coverage Goals
- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

## 🔍 Test Scenarios

### Scenario 1: Complete Campaign Lifecycle
1. Creator uploads profile image
2. Creator creates campaign with banner image
3. Supporters register for notifications
4. Supporters make contributions
5. Campaign amount is updated
6. Creator posts update with images
7. Notifications sent to supporters
8. All data verified in database

### Scenario 2: Messaging Workflow
1. Users create conversation
2. Text messages exchanged
3. Image attachments uploaded and sent
4. Campaign links shared in messages
5. Push notifications delivered
6. All messages stored correctly

### Scenario 3: Multi-User Interactions
1. Multiple users upload files simultaneously
2. Concurrent campaign creation
3. Parallel contributions to campaigns
4. Multiple conversations active
5. Batch notifications sent
6. Data consistency verified

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on emulator ports (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Kill processes on emulator ports (Mac/Linux)
lsof -ti :8080 | xargs kill -9
```

#### Firebase CLI Not Found
```bash
npm install -g firebase-tools
firebase login
```

#### Java Not Found (for Firestore)
- **Windows**: Install OpenJDK or Oracle JDK
- **Mac**: `brew install openjdk`
- **Linux**: `sudo apt-get install openjdk-11-jdk`

#### Tests Timeout
- Increase timeout in `jest.config.js`:
```javascript
testTimeout: 60000 // 60 seconds
```

#### Emulator Won't Start
1. Check if ports are available
2. Clear Firebase cache: `firebase emulators:stop --project test-zimbuzz`
3. Delete `firebase-debug.log`
4. Restart with fresh data: Remove `firebase-data` directory

### Debug Mode
Run tests with additional logging:
```bash
DEBUG=* npm run test:firebase
```

### Manual Testing
For manual testing during development:
```bash
# Start emulators in background
npm run emulator:start &

# Run specific tests
jest src/tests/auth.test.ts --verbose

# Clean up
npm run emulator:stop
```

## 🎯 Best Practices

### Writing New Tests
1. **Use test utilities**: Import helpers from existing test files
2. **Clean up resources**: Always clean up files and data
3. **Mock external services**: Use Jest mocks for external APIs
4. **Test error conditions**: Include negative test cases
5. **Use descriptive names**: Make test descriptions clear

### Test Data Management
- Use unique identifiers (timestamps) to avoid collisions
- Clean up test data after each test
- Use emulator data export/import for consistent test states
- Don't rely on external data or services

### Performance Considerations
- Run tests in sequence (`maxWorkers: 1`) for emulator stability
- Use timeouts appropriate for Firebase operations
- Clean up listeners and subscriptions to prevent memory leaks
- Use batch operations where possible

## 📊 Continuous Integration

### GitHub Actions Example
```yaml
name: Firebase Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - uses: actions/setup-java@v2
      with:
        distribution: 'adopt'
        java-version: '11'
    
    - run: npm ci
    - run: npm install -g firebase-tools
    - run: npm run test:firebase
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## 📈 Monitoring and Metrics

### Test Metrics
- **Test execution time**: Monitor for performance regression
- **Coverage percentage**: Maintain high coverage
- **Success rate**: Track test stability
- **Firebase emulator performance**: Monitor startup and response times

### Alerts
Set up alerts for:
- Test failures in CI/CD
- Coverage drops below threshold
- Long test execution times
- Emulator startup failures

## 🔗 Additional Resources

- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

## 📞 Support

If you encounter issues with the test setup:
1. Check this troubleshooting guide
2. Review the Firebase documentation
3. Check emulator logs in `firebase-debug.log`
4. Verify all prerequisites are installed

---

Happy testing! 🧪✨