# Firebase Emulator Startup Script for ZimBuzz
# This script attempts to start Firebase emulators with proper authentication handling

Write-Host "🚀 ZimBuzz Firebase Emulator Setup" -ForegroundColor Green
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
Write-Host "🔍 Checking Firebase authentication..." -ForegroundColor Blue

try {
    $authStatus = firebase projects:list --format=json 2>$null
    if ($authStatus) {
        Write-Host "✅ Firebase CLI is authenticated" -ForegroundColor Green
        $useAuth = $true
    } else {
        throw "Not authenticated"
    }
} catch {
    Write-Host "⚠️ Firebase CLI is not authenticated" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You have two options:" -ForegroundColor Yellow
    Write-Host "1. Authenticate with Firebase (required for production deployment)" -ForegroundColor Yellow
    Write-Host "2. Use demo mode (for local development only)" -ForegroundColor Yellow
    Write-Host ""
    
    $choice = Read-Host "Enter 1 to authenticate or 2 for demo mode (recommended for now)"
    
    if ($choice -eq "1") {
        Write-Host "🔐 Starting Firebase authentication..." -ForegroundColor Blue
        firebase login
        $useAuth = $true
    } else {
        Write-Host "🎭 Using demo mode" -ForegroundColor Blue
        $useAuth = $false
    }
}

# Set environment variables for emulators
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199"

Write-Host ""
Write-Host "📍 Emulator Configuration:" -ForegroundColor Cyan
Write-Host "   Auth Emulator: http://localhost:9099" -ForegroundColor Gray
Write-Host "   Firestore Emulator: http://localhost:8080" -ForegroundColor Gray
Write-Host "   Storage Emulator: http://localhost:9199" -ForegroundColor Gray
Write-Host "   Emulator UI: http://localhost:4000" -ForegroundColor Gray
Write-Host ""

# Create basic emulator configuration if it doesn't exist
$iniPath = ".\.firebaserc"
if (!(Test-Path $iniPath)) {
    Write-Host "📝 Creating .firebaserc file..." -ForegroundColor Blue
    @"
{
  "projects": {
    "default": "demo-zimbuzz"
  }
}
"@ | Out-File -FilePath $iniPath -Encoding utf8
}

# Try to start emulators
Write-Host "🚀 Starting Firebase emulators..." -ForegroundColor Green
Write-Host ""

try {
    if ($useAuth) {
        # Start with authenticated project
        firebase emulators:start --project=default --only=auth,firestore,storage
    } else {
        # Start with demo project (should work without authentication)
        firebase emulators:start --project=demo-zimbuzz --only=auth,firestore,storage
    }
} catch {
    Write-Host "❌ Failed to start emulators" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting options:" -ForegroundColor Yellow
    Write-Host "1. Run tests in mock mode: npm run test:firebase:mock" -ForegroundColor Gray
    Write-Host "2. Try authentication: firebase login" -ForegroundColor Gray
    Write-Host "3. Check if ports are available (9099, 8080, 9199, 4000)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 For now, use the mock tests which work without emulators:" -ForegroundColor Green
    Write-Host "   npm run test:firebase:mock" -ForegroundColor Cyan
    
    exit 1
}