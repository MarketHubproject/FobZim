#!/usr/bin/env node

/**
 * Firebase Integration Test Runner
 * 
 * This script starts Firebase emulators and runs the complete test suite
 * for Firebase integration testing.
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  emulatorPorts: {
    auth: 9099,
    firestore: 8080,
    storage: 9199,
    functions: 5001,
    ui: 4000
  },
  projectId: 'test-zimbuzz',
  timeout: 60000, // 60 seconds timeout for emulator startup
  testTimeout: 300000 // 5 minutes for full test suite
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  return new Promise((resolve, reject) => {
    exec('firebase --version', (error, stdout) => {
      if (error) {
        logError('Firebase CLI not found. Please install it with: npm install -g firebase-tools');
        reject(error);
      } else {
        logSuccess(`Firebase CLI installed: ${stdout.trim()}`);
        resolve();
      }
    });
  });
}

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'firebase.json',
    'firestore.rules',
    'storage.rules',
    'src/tests/auth.test.ts',
    'src/tests/firestore.test.ts',
    'src/tests/storage.test.ts',
    'src/tests/notifications.test.ts',
    'src/tests/integration.test.ts'
  ];

  logStep('SETUP', 'Checking required files...');
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      logError(`Required file missing: ${file}`);
      throw new Error(`Missing required file: ${file}`);
    }
  }
  
  logSuccess('All required files present');
}

// Check if ports are available
function checkPortAvailability(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

// Kill process on port
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti :${port}`;
    
    exec(command, (error, stdout) => {
      if (error || !stdout) {
        resolve(); // No process running on port
        return;
      }
      
      const killCommand = process.platform === 'win32'
        ? `taskkill /PID ${stdout.trim().split(/\s+/).pop()} /F`
        : `kill -9 ${stdout.trim()}`;
      
      exec(killCommand, () => resolve());
    });
  });
}

// Start Firebase emulators
function startEmulators() {
  return new Promise((resolve, reject) => {
    logStep('EMULATORS', 'Starting Firebase emulators...');
    
    const emulatorProcess = spawn('firebase', [
      'emulators:start',
      '--project', CONFIG.projectId,
      '--import', './firebase-data',
      '--export-on-exit'
    ], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    let startupComplete = false;
    const startupTimeout = setTimeout(() => {
      if (!startupComplete) {
        logError('Emulator startup timeout');
        emulatorProcess.kill();
        reject(new Error('Emulator startup timeout'));
      }
    }, CONFIG.timeout);

    emulatorProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      
      if (output.includes('All emulators ready')) {
        startupComplete = true;
        clearTimeout(startupTimeout);
        logSuccess('Firebase emulators started successfully');
        resolve(emulatorProcess);
      }
    });

    emulatorProcess.stderr.on('data', (data) => {
      const error = data.toString();
      
      // Don't log warning-level messages as errors
      if (!error.includes('Warning') && !error.includes('deprecated')) {
        process.stderr.write(`${colors.yellow}${error}${colors.reset}`);
      }
    });

    emulatorProcess.on('error', (error) => {
      logError(`Failed to start emulators: ${error.message}`);
      clearTimeout(startupTimeout);
      reject(error);
    });

    emulatorProcess.on('exit', (code) => {
      if (code !== 0 && !startupComplete) {
        logError(`Emulators exited with code ${code}`);
        clearTimeout(startupTimeout);
        reject(new Error(`Emulators failed to start (exit code: ${code})`));
      }
    });
  });
}

// Run test suite
function runTests() {
  return new Promise((resolve, reject) => {
    logStep('TESTS', 'Running Firebase integration tests...');
    
    const testProcess = spawn('npm', ['test', '--', '--coverage'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FIREBASE_USE_EMULATOR: 'true'
      }
    });

    const testTimeout = setTimeout(() => {
      logError('Test execution timeout');
      testProcess.kill();
      reject(new Error('Test execution timeout'));
    }, CONFIG.testTimeout);

    testProcess.on('close', (code) => {
      clearTimeout(testTimeout);
      
      if (code === 0) {
        logSuccess('All tests passed!');
        resolve();
      } else {
        logError(`Tests failed with exit code ${code}`);
        reject(new Error(`Tests failed (exit code: ${code})`));
      }
    });

    testProcess.on('error', (error) => {
      clearTimeout(testTimeout);
      logError(`Test execution error: ${error.message}`);
      reject(error);
    });
  });
}

// Cleanup function
async function cleanup(emulatorProcess) {
  logStep('CLEANUP', 'Shutting down emulators...');
  
  if (emulatorProcess && !emulatorProcess.killed) {
    emulatorProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await new Promise(resolve => {
      const timeout = setTimeout(() => {
        emulatorProcess.kill('SIGKILL');
        resolve();
      }, 10000);
      
      emulatorProcess.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }
  
  // Kill any remaining processes on emulator ports
  for (const port of Object.values(CONFIG.emulatorPorts)) {
    await killProcessOnPort(port);
  }
  
  logSuccess('Cleanup completed');
}

// Main execution function
async function main() {
  let emulatorProcess = null;
  
  try {
    // Print banner
    log(`\n${colors.magenta}╔══════════════════════════════════════╗${colors.reset}`);
    log(`${colors.magenta}║       Firebase Integration Tests    ║${colors.reset}`);
    log(`${colors.magenta}║            ZimBuzz App               ║${colors.reset}`);
    log(`${colors.magenta}╚══════════════════════════════════════╝${colors.reset}\n`);

    // Pre-flight checks
    logStep('PREFLIGHT', 'Running pre-flight checks...');
    await checkFirebaseCLI();
    checkRequiredFiles();

    // Check port availability and cleanup if needed
    logStep('PORTS', 'Checking port availability...');
    for (const [service, port] of Object.entries(CONFIG.emulatorPorts)) {
      const available = await checkPortAvailability(port);
      if (!available) {
        logWarning(`Port ${port} (${service}) in use, attempting cleanup...`);
        await killProcessOnPort(port);
      }
    }
    logSuccess('All ports ready');

    // Start emulators
    emulatorProcess = await startEmulators();
    
    // Wait a bit for emulators to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run tests
    await runTests();
    
    // Generate test report summary
    logStep('REPORT', 'Test execution completed');
    log(`${colors.green}📊 Coverage report: coverage/lcov-report/index.html${colors.reset}`);
    log(`${colors.green}📋 Test report: coverage/firebase-test-report.html${colors.reset}`);
    
    logSuccess('Firebase integration tests completed successfully! 🎉');
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  } finally {
    await cleanup(emulatorProcess);
  }
}

// Handle process interruption
process.on('SIGINT', async () => {
  log(`\n${colors.yellow}Received interrupt signal, cleaning up...${colors.reset}`);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  log(`\n${colors.yellow}Received termination signal, cleaning up...${colors.reset}`);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, CONFIG };