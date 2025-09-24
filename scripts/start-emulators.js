#!/usr/bin/env node
/**
 * Firebase Emulator Startup Script
 * Alternative approach to start Firebase emulators without CLI authentication
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables for emulators
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

console.log('🚀 Starting Firebase Emulators for ZimBuzz...');
console.log('📍 Auth Emulator: http://localhost:9099');
console.log('📍 Firestore Emulator: http://localhost:8080');
console.log('📍 Storage Emulator: http://localhost:9199');
console.log('📍 Emulator UI: http://localhost:4000');
console.log('');

// Try to start emulators with demo project
const emulatorProcess = spawn('firebase', [
  'emulators:start',
  '--project=demo-zimbuzz',
  '--only=auth,firestore,storage'
], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

emulatorProcess.on('error', (error) => {
  console.error('❌ Failed to start emulators:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting steps:');
  console.log('1. Make sure Firebase CLI is installed: npm install -g firebase-tools');
  console.log('2. Try running: firebase login');
  console.log('3. Or use the mock tests instead: npm run test:firebase:mock');
  process.exit(1);
});

emulatorProcess.on('close', (code) => {
  console.log(`\n🛑 Emulators stopped with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down emulators...');
  emulatorProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down emulators...');
  emulatorProcess.kill('SIGTERM');
});