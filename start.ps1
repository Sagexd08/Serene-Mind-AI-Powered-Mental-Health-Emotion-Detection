# Start Emotion Engine first
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Emotion_Engine; python worker/service.py"

# Wait a moment to ensure it initializes (optional but good practice)
Start-Sleep -Seconds 10

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; pnpm run dev"

# Start Student App
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Student_app; npx expo start"
