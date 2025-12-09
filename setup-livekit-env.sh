#!/bin/bash
# setup-livekit-env.sh - Setup LiveKit environment variables

echo "═════════════════════════════════════════════════════════════"
echo "  LiveKit Emotion Recognition Model - Environment Setup"
echo "═════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# LiveKit Configuration
LIVEKIT_URL="wss://emotech-38dj94si.livekit.cloud"
LIVEKIT_API_KEY="APISsXCJFjf8JW4"
LIVEKIT_API_SECRET="a4p9grtgakKGIqJqeMDGcSocsVVHeifYh53QMqzG00RA"

echo -e "${GREEN}✓ LiveKit Credentials${NC}"
echo "  URL: $LIVEKIT_URL"
echo "  API Key: $LIVEKIT_API_KEY"
echo "  API Secret: [CONFIGURED]"
echo ""

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}Creating backend/.env${NC}"
  cat > backend/.env << EOF
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
EOF
  echo -e "${GREEN}✓ Created backend/.env${NC}"
else
  echo -e "${YELLOW}⚠ backend/.env already exists${NC}"
fi

echo ""

# Create Emotion Engine .env if it doesn't exist
if [ ! -f "Emotion_Engine/.env" ]; then
  echo -e "${YELLOW}Creating Emotion_Engine/.env${NC}"
  cat > Emotion_Engine/.env << EOF
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
EOF
  echo -e "${GREEN}✓ Created Emotion_Engine/.env${NC}"
else
  echo -e "${YELLOW}⚠ Emotion_Engine/.env already exists${NC}"
fi

echo ""

# Create Student App .env if it doesn't exist
if [ ! -f "Student_app/.env.local" ]; then
  echo -e "${YELLOW}Creating Student_app/.env.local${NC}"
  cat > Student_app/.env.local << EOF
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
EOF
  echo -e "${GREEN}✓ Created Student_app/.env.local${NC}"
else
  echo -e "${YELLOW}⚠ Student_app/.env.local already exists${NC}"
fi

echo ""
echo "═════════════════════════════════════════════════════════════"
echo -e "${GREEN}Environment Setup Complete!${NC}"
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Update GOOGLE_API_KEY in all .env files"
echo "2. Start services:"
echo "   - Backend:  cd backend && npm run dev"
echo "   - Agent:    cd Emotion_Engine && python -m livekit.agents"
echo "   - App:      cd Student_app && npx expo start"
echo ""
echo "Configuration Summary:"
echo "  LiveKit Server: $LIVEKIT_URL"
echo "  API Key: $LIVEKIT_API_KEY"
echo "  Backend Port: 3000"
echo "  Student App: Expo dev server"
echo ""
