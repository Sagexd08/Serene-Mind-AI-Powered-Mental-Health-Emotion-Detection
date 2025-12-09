# Check pnpm and python availability
Write-Host "Checking for pnpm..."
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm is not installed. Please install pnpm first."
    exit 1
}
Write-Host "pnpm is installed." -ForegroundColor Green

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "python is not installed or not on PATH. Please install Python 3.9+."
    exit 1
}

# Run env scaffolding (does not overwrite existing files)
if (Test-Path "$PSScriptRoot\setup-livekit-env.ps1") {
    Write-Host "`nEnsuring .env files exist..."
    & "$PSScriptRoot\setup-livekit-env.ps1"
} else {
    Write-Host "`nsetup-livekit-env.ps1 not found; skipping env generation." -ForegroundColor Yellow
}

# Setup backend
Write-Host "`nSetting up backend..."
Push-Location backend
try {
    pnpm install
} finally {
    Pop-Location
}

# Setup Student_app
Write-Host "`nSetting up Student_app..."
Push-Location Student_app
try {
    pnpm install
} finally {
    Pop-Location
}

# Setup Admin
Write-Host "`nSetting up admin..."
Push-Location admin
try {
    pnpm install
} finally {
    Pop-Location
}

# Setup Counsellor Portal
Write-Host "`nSetting up counsellor_portal..."
Push-Location councellor_portal
try {
    pnpm install
} finally {
    Pop-Location
}

# Setup Emotion_Engine
Write-Host "`nSetting up Emotion_Engine..."
Push-Location Emotion_Engine
try {
    if (-not (Test-Path .venv)) {
        Write-Host "Creating virtual environment..."
        python -m venv .venv
    } else {
        Write-Host "Virtual environment already exists."
    }

    $pythonPath = ".\.venv\Scripts\python.exe"
    if (-not (Test-Path $pythonPath)) {
         $pythonPath = ".\.venv\bin\python"
    }
    
    if (Test-Path $pythonPath) {
        Write-Host "Installing requirements..."
        & $pythonPath -m pip install -r requirements.txt
    } else {
        Write-Error "Could not find python in virtual environment."
    }

} finally {
    Pop-Location
}

Write-Host "`nSetup complete!" -ForegroundColor Green

# Start all services automatically
Write-Host "`nStarting all services..." -ForegroundColor Yellow

# Backend (port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; pnpm dev"
Start-Sleep -Seconds 2

# Emotion Engine gRPC worker (port 50051)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Emotion_Engine'; .\.venv\Scripts\python.exe worker/service.py"
Start-Sleep -Seconds 2

# Student app (Expo) on port 8082
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Student_app'; $env:EXPO_PORT=8082; pnpm start"
Start-Sleep -Seconds 2

# Counsellor portal on port 3002
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\councellor_portal'; $env:PORT=3002; pnpm dev"
Start-Sleep -Seconds 2

# Admin dashboard on port 3001
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin'; $env:PORT=3001; pnpm dev"

Write-Host "`nAll services started!" -ForegroundColor Green
Write-Host "`nService URLs:`n" -ForegroundColor Cyan
Write-Host "  Backend API:    http://localhost:3000"
Write-Host "  Emotion gRPC:   127.0.0.1:50051"
Write-Host "  LiveKit Agent:  (not auto-started)"
Write-Host "  Student App:    Expo dev server (QR) on port 8082"
Write-Host "  Counsellor:     http://localhost:3002"
Write-Host "  Admin:          http://localhost:3001"
