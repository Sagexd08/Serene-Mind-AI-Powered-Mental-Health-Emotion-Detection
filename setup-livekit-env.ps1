# setup-livekit-env.ps1 - Setup LiveKit environment variables for Windows

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  LiveKit Emotion Recognition Model - Environment Setup    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# LiveKit Configuration
$LIVEKIT_URL = "wss://emotech-38dj94si.livekit.cloud"
$LIVEKIT_API_KEY = "APISsXCJFjf8JW4"
$LIVEKIT_API_SECRET = "a4p9grtgakKGIqJqeMDGcSocsVVHeifYh53QMqzG00RA"

Write-Host "✓ LiveKit Credentials" -ForegroundColor Green
Write-Host "  URL: $LIVEKIT_URL"
Write-Host "  API Key: $LIVEKIT_API_KEY"
Write-Host "  API Secret: [CONFIGURED]"
Write-Host ""

# Create backend .env
$backendEnvPath = "backend\.env"
if (-not (Test-Path $backendEnvPath)) {
  Write-Host "Creating $backendEnvPath" -ForegroundColor Yellow
  
  $backendEnvContent = @"
# Server
PORT=3000

# Database (SQLite)
DB_DRIVER=sqlite
SQLITE_PATH=./database.sqlite

# Redis (for job queue - optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# LiveKit Configuration
LIVEKIT_URL=$LIVEKIT_URL
LIVEKIT_API_KEY=$LIVEKIT_API_KEY
LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET

# Database URL
DATABASE_URL=sqlite://./database.sqlite

# Node Environment
NODE_ENV=development
"@
  
  Set-Content -Path $backendEnvPath -Value $backendEnvContent -Encoding UTF8
  Write-Host "✓ Created $backendEnvPath" -ForegroundColor Green
} else {
  Write-Host "⚠ $backendEnvPath already exists" -ForegroundColor Yellow
}

Write-Host ""

# Create Emotion Engine .env
$emotionEnvPath = "Emotion_Engine\.env"
if (-not (Test-Path $emotionEnvPath)) {
  Write-Host "Creating $emotionEnvPath" -ForegroundColor Yellow
  
  $emotionEnvContent = @"
# LiveKit Configuration
LIVEKIT_URL=$LIVEKIT_URL
LIVEKIT_API_KEY=$LIVEKIT_API_KEY
LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET

# Google Gemini API
GOOGLE_API_KEY=your-google-api-key

# Logging
LOG_LEVEL=INFO

# Python Environment
PYTHONUNBUFFERED=1
"@
  
  Set-Content -Path $emotionEnvPath -Value $emotionEnvContent -Encoding UTF8
  Write-Host "✓ Created $emotionEnvPath" -ForegroundColor Green
} else {
  Write-Host "⚠ $emotionEnvPath already exists" -ForegroundColor Yellow
}

Write-Host ""

# Create Student App .env
$studentAppEnvPath = "Student_app\.env.local"
if (-not (Test-Path $studentAppEnvPath)) {
  Write-Host "Creating $studentAppEnvPath" -ForegroundColor Yellow
  
  $studentAppEnvContent = @"
# LiveKit API Configuration
EXPO_PUBLIC_LIVEKIT_API_URL=http://localhost:3000/api/livekit

# Backend API URL
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000

# Google Gemini API
EXPO_PUBLIC_GOOGLE_API_KEY=your-google-api-key

# Feature Flags
EXPO_PUBLIC_ENABLE_VOICE_CHAT=true
EXPO_PUBLIC_ENABLE_MOOD_TRACKING=true
EXPO_PUBLIC_ENABLE_HUMAN_HANDOFF=true
"@
  
  Set-Content -Path $studentAppEnvPath -Value $studentAppEnvContent -Encoding UTF8
  Write-Host "✓ Created $studentAppEnvPath" -ForegroundColor Green
} else {
  Write-Host "⚠ $studentAppEnvPath already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Environment Setup Complete!                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update GOOGLE_API_KEY in all .env files"
Write-Host "2. Start services:"
Write-Host "   - Backend:  cd backend; pnpm dev"
Write-Host "   - Agent:    cd Emotion_Engine; python -m livekit.agents"
Write-Host "   - App:      cd Student_app; npx expo start"
Write-Host ""

Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "  LiveKit Server: $LIVEKIT_URL"
Write-Host "  API Key: $LIVEKIT_API_KEY"
Write-Host "  Backend Port: 3000"
Write-Host "  Student App: Expo dev server"
Write-Host ""

Write-Host "Environment files created in:" -ForegroundColor Cyan
Write-Host "  ✓ backend\.env"
Write-Host "  ✓ Emotion_Engine\.env"
Write-Host "  ✓ Student_app\.env.local"
Write-Host ""
