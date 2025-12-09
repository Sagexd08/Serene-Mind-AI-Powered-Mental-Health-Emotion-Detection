# Known Issues & Production Readiness Gaps

This document outlines critical issues identified in the codebase that must be addressed before deploying to a production environment.

## 1. 🔴 Critical Configuration Issues

### Hardcoded "localhost" URLs
The Student App is currently configured to connect to `localhost`, which will fail on physical devices or in production environments.
- **File**: `Student_app/.env.local`
- **Issue**: `EXPO_PUBLIC_BACKEND_URL` and `EXPO_PUBLIC_LIVEKIT_API_URL` point to `localhost`.
- **Fix**: Update these to point to your computer's local IP address (e.g., `192.168.1.x`) for testing, or your production domain for deployment.

### Missing API Keys
Several configuration files contain placeholder text instead of actual API keys. Features relying on these (like Gemini AI) will fail.
- **File**: `Student_app/.env.local` (`EXPO_PUBLIC_GOOGLE_API_KEY`)
- **File**: `Emotion_Engine/.env` (`GOOGLE_API_KEY`)
- **Fix**: Replace placeholders with valid API keys.

### Missing Environment Files
Web portals are missing their environment configuration files.
- **Counsellor Portal**: Missing `.env` (needs `DATABASE_URL`).
- **Admin Portal**: Missing `.env`.
- **Fix**: Create these files based on example templates or project requirements.

## 2. ⚠️ Build & Deployment Issues

### Windows-Specific Build Scripts
The backend build script uses Windows-specific commands (`copy`, `mkdir ... 2>nul`).
- **File**: `backend/package.json`
- **Issue**: The `build` script will fail on Linux-based CI/CD pipelines or production servers (AWS, Heroku, Vercel).
- **Fix**: Use cross-platform tools like `shx` or standard Linux commands.

### Database Mismatch
There is a discrepancy in database configuration across services.
- **Backend**: Configured for **SQLite**.
- **Counsellor Portal**: Configured for **PostgreSQL**.
- **Impact**: Data sharing between services will be impossible without a unified database.
- **Fix**: Standardize on PostgreSQL for all services in production.

### Insecure CORS Configuration
The backend allows requests from any origin.
- **File**: `backend/src/app.ts`
- **Issue**: `app.use(cors())` is too permissive for production.
- **Fix**: Restrict CORS to specific frontend domains.

## 3. 🔄 LiveKit Integration Status
- **Backend**: Route implemented and tested.
- **Student App**: Dependencies added, UI implemented.
- **Python Agent**: Updated to use LiveKit Agents SDK v1.2+.
- **Action Required**: Ensure `livekit-agents` and `python-dotenv` are installed in the `Emotion_Engine` environment.
