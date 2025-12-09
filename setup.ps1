# Check if pnpm is installed
Write-Host "Checking for pnpm..."
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm is not installed. Please install pnpm first."
    exit 1
}
Write-Host "pnpm is installed." -ForegroundColor Green

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

    # Activate venv and install requirements
    # We use the python executable in the venv to run pip module. This is robust.
    
    $pythonPath = ".\.venv\Scripts\python.exe"
    if (-not (Test-Path $pythonPath)) {
         # Fallback for non-windows
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

# Ask if user wants to start services
Write-Host "`nWould you like to start all services? (Y/N)" -ForegroundColor Cyan
$response = Read-Host
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "`nStarting services..." -ForegroundColor Yellow
    
    # Start backend
    Write-Host "Starting backend (port 3000)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; pnpm dev"
    Start-Sleep -Seconds 2
    
    # Start Student app
    Write-Host "Starting Student app (Expo on port 8082)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Student_app'; `$env:EXPO_PORT=8082; pnpm start"
    Start-Sleep -Seconds 2
    
    # Start Counsellor portal
    Write-Host "Starting Counsellor portal (port 3001)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\councellor_portal'; pnpm dev"
    Start-Sleep -Seconds 2
    
    # Start Admin dashboard
    Write-Host "Starting Admin dashboard..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin'; pnpm install; pnpm dev"
    
    Write-Host "`nAll services started!" -ForegroundColor Green
    Write-Host "`nService URLs:`n" -ForegroundColor Cyan
    Write-Host "  Backend API: http://192.168.1.6:3000"
    Write-Host "  Student App: http://192.168.1.6:8082"
    Write-Host "  Counsellor Portal: http://localhost:3001"
    Write-Host "  Admin Dashboard: http://localhost:3000 or 3001"
} else {
    Write-Host "Skipping service startup." -ForegroundColor Yellow
}
