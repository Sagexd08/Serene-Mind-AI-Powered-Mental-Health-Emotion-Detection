# Emotion Recognition Student App - Complete Implementation

## Overview
A comprehensive mental wellness application for students featuring emotion recognition, wellness resources, AI chatbot support, screening questionnaires, and privacy controls.

## Project Structure

```
Student_app/
├── app/
│   ├── home.tsx                 # Main dashboard with all feature buttons
│   ├── login.tsx               # Authentication screen
│   ├── _layout.tsx             # Root navigation layout
│   └── screens/                # Feature screens (modals)
│       ├── OnboardingConsent.tsx      # Privacy consent & calibration
│       ├── Resources.tsx              # Wellness resources library
│       ├── Chatbot.tsx               # AI wellness assistant
│       ├── ScreeningModal.tsx         # PHQ-9 screening questionnaire
│       ├── SessionHistory.tsx         # Emotion history timeline
│       └── PrivacySettings.tsx        # Privacy controls & data management
├── components/
│   ├── face/
│   │   └── FaceScanner.tsx     # Camera & face detection
│   └── ui/
│       └── button.tsx          # Reusable button component
├── services/
│   └── api.ts                  # API service with all endpoints
├── config/
│   └── api.config.ts           # API configuration
└── hooks/
    └── use-color-scheme.ts     # Color scheme hook
```

## Screen Documentation

### 1. Home Screen (home.tsx)
**Purpose**: Main dashboard with quick access to all features

**Key Features**:
- Face scanning for attendance and emotion detection
- 6 quick-access feature buttons
- Security and speed information cards
- Instructions for use
- Logout functionality

**Components**:
- Face Scanner: Real-time camera with face detection
- Feature Grid: 6 buttons linking to other screens

**State Management**:
```typescript
- showScanner: boolean         // Face camera visibility
- uploading: boolean           // Upload progress
- showResources: boolean       // Resources modal
- showChatbot: boolean         // AI chat modal
- showScreening: boolean       // Screening modal
- showHistory: boolean         // Session history modal
- showSettings: boolean        // Privacy settings modal
- showOnboarding: boolean      // Onboarding modal
```

**Navigation Flow**:
- Login → Home → Feature Screens (modals)

---

### 2. Onboarding Consent (OnboardingConsent.tsx)
**Purpose**: Privacy preferences and consent management

**Key Features**:
- Privacy policy summary with 4 key points
- 3 configurable consent toggles:
  - Passive wellness checks (recommended, ON by default)
  - Save raw snapshots (OFF by default)
  - Help improve AI (OFF by default)
- Expandable detailed privacy policy
- Accept & Calibrate or Decline buttons

**Privacy Controls**:
```typescript
consentOptions {
  passiveMicroChecks: boolean;    // Enable background monitoring
  saveRawSnapshots: boolean;      // Keep photos for 7 days
  sendCorrections: boolean;       // Anonymous AI training data
}
```

**API Calls**:
- `storeConsent()` - Save locally
- `recordConsent()` - Send to backend
- Navigate to home on accept/decline

**Styling**:
- Blue (#007AFF) primary buttons
- Green (#34C759) recommended badges
- Elevation shadows (3-6)

---

### 3. Wellness Resources (Resources.tsx)
**Purpose**: Library of mental health resources and wellness tools

**Key Features**:
- Search bar with real-time filtering
- Category filter chips (All, Calm, Focus, Sleep)
- Resource cards with metadata
- Detailed resource view with playback
- Progress tracking for sessions

**Resource Types**:
```typescript
interface Resource {
  id: string;
  title: string;
  category: 'Calm' | 'Focus' | 'Sleep';
  duration: string;            // e.g., "5 min"
  type: 'audio' | 'video' | 'article' | 'neuromodulation';
  tags: string[];              // e.g., ['anxiety', 'stress']
}
```

**Sample Resources**:
1. 5-Minute Breathing Exercise (Calm, audio)
2. Progressive Muscle Relaxation (Calm, audio)
3. Focus Enhancement Session (Focus, neuromodulation)
4. Sleep Preparation Routine (Sleep, audio)

**Modal Features**:
- Play/Stop buttons with progress bar
- Resource details (duration, category, tags)
- "What to Expect" description
- Safety notices for neuromodulation

**Styling**:
- Category colors: Calm (#34C759), Focus (#007AFF), Sleep (#5856D6)
- Elevation 2-3 for cards
- Icon-based resource identification

---

### 4. AI Wellness Chatbot (Chatbot.tsx)
**Purpose**: Conversational AI for mental health support and escalation

**Key Features**:
- 4 quick-prompt chips for common issues
- Message history with bot responses
- Typing indicator animation
- Action buttons for contextual responses
- Smart keyword matching for responses

**Quick Prompts**:
```
"Feeling anxious"      → Anxiety support
"Can't sleep"          → Sleep resources
"Stressed about exams" → Stress management
"Talk to counselor"    → Escalation
```

**Bot Response Types**:
```typescript
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];    // Action buttons
}
```

**Response Keywords**:
- **Anxious/Anxiety** → Breathing exercise + Escalate
- **Sleep/Insomnia** → Sleep resources + Screening
- **Counselor/Therapist** → Escalation option
- **Stressed/Stress** → Quick relief + Resources
- **Default** → Screening + Resources

**Action Handlers**:
- `breathing` → Launch breathing exercise
- `screening` → Open PHQ-9 screening
- `resources` → Open resources library
- `escalate` → Connect with counselor (24-hour response)

**Styling**:
- Bot messages: White (#fff) with elevation
- User messages: Blue (#007AFF) right-aligned
- Quick chips: Light blue background (#E3F2FD)
- Typing dots animation

---

### 5. Screening Questionnaire (ScreeningModal.tsx)
**Purpose**: Mental health assessment using validated questionnaires

**Current Implementation**:
- PHQ-9 (Patient Health Questionnaire-9) for depression screening
- Ready for GAD-7 (Generalized Anxiety Disorder-7)

**PHQ-9 Questions** (9 total):
1. Little interest or pleasure in doing things
2. Feeling down, depressed, or hopeless
3. Trouble falling or staying asleep
4. Feeling tired or having little energy
5. Poor appetite or overeating
6. Feeling bad about yourself
7. Trouble concentrating on things
8. Moving or speaking too slowly or too fast
9. Thoughts that you would be better off dead

**Scoring & Risk Levels**:
```typescript
PHQ-9 Score:
  0-4    → Minimal symptoms (Green ✓)
  5-9    → Mild symptoms
  10-14  → Moderate symptoms (Orange ⚠)
  15-19  → Moderately severe (Orange ⚠)
  20+    → Severe symptoms (Red 🚨)
```

**Answer Scale** (for each question):
```
0 = Not at all
1 = Several days
2 = More than half the days
3 = Nearly every day
```

**UI Flow**:
1. Intro card (first question only)
2. One question per screen
3. Radio button selections
4. Progress bar showing completion
5. Back/Next navigation
6. Results screen with recommendations

**Results Display**:
- Score display
- Risk level interpretation
- Personalized recommendations (3-5 items)
- Emergency card for high/severe risk
- Counselor escalation for high risk

**Risk Level Recommendations**:
```
Minimal   → Continue wellness practices
Mild      → Try relaxation, maintain habits
Moderate  → Schedule counselor appointment
Moderately-Severe → Speak with counselor soon
Severe    → Immediate counselor contact
```

**Styling**:
- Progress bar: Blue (#007AFF)
- Options: Gray (#f5f5f5) → Blue (#E3F2FD) when selected
- Radio buttons: Custom styling with dot fill
- Result colors: Green/Orange/Red based on risk

---

### 6. Session History (SessionHistory.tsx)
**Purpose**: View, manage, and analyze emotion check-in history

**Key Features**:
- Time range selector (Day, Week, Month)
- 3 stat cards (Total Sessions, Avg Confidence, Trend)
- Grouped timeline by date (Today, Yesterday, specific dates)
- Session cards with emotion, confidence, time
- Session detail modal with notes editing
- Emotion color coding

**Emotion Colors**:
```typescript
Euthymic  → Green (#34C759)    // Positive mood
Neutral   → Green (#34C759)
Dysphoric → Orange (#FF9500)   // Low mood
Anxious   → Red (#FF3B30)       // Anxiety
Irritable → Orange (#FF9500)
```

**Session Data**:
```typescript
interface Session {
  id: string;
  timestamp: Date;
  emotion: string;              // Detected emotion
  confidence: number;           // 0-1 scale
  source: 'face' | 'voice' | 'manual';
  context?: { course?: string };
  note?: string;                // User notes
}
```

**Session Detail Features**:
- Large emotion icon with color
- Confidence percentage display
- Info card with Date, Time, Source
- Notes section (editable)
- Delete button

**Stats Calculation**:
- Avg Confidence: Mean of all session confidences
- Trend: "Stable" (>70% avg) or "Attention" (<70%)
- Total Sessions: Count of sessions in time range

**Data Loading**:
- Mock data for demo:
  - Various emotions: Euthymic, Dysphoric, Anxious, Irritable
  - Confidence ranging 0.65-0.95
  - Real timestamps
  - Course context (Biology 101, etc.)

**Styling**:
- Time range buttons: Rounded chips with active state
- Session cards: White with colored left border
- Stat cards: Compact 3-column layout
- Elevation: 2-3 for cards

---

### 7. Privacy Settings (PrivacySettings.tsx)
**Purpose**: Comprehensive privacy controls and data management

**Key Features**:
- Privacy status card (Monitoring Active/Manual Mode)
- 3 privacy control toggles
- Data management section (Export, Policy)
- Danger zone (Withdraw, Delete Account)
- Confirmation modals for destructive actions

**Privacy Settings**:
```typescript
interface ConsentSettings {
  passiveChecks: boolean;       // Passive monitoring
  saveRawSnapshots: boolean;    // Photo retention
  sendCorrections: boolean;     // AI training data
  autoDeleteDays: number;       // Auto-deletion timing
}
```

**Privacy Toggles**:
1. **Passive Wellness Checks** (highlighted)
   - Recommended toggle
   - Disable warning dialog
   
2. **Save Snapshots**
   - Photos retained temporarily
   - Improves accuracy
   
3. **Share Corrections**
   - Anonymous feedback
   - Helps improve AI model

**Data Management**:
- Export My Data (Anonymized/Full)
- Privacy Policy (link)
- Data Usage & Rights (link)

**Danger Zone Actions**:
- **Withdraw Consent** → Switches to manual mode
  - Confirmation modal
  - 24-hour processing notice
  
- **Delete Account** → Permanent deletion
  - Double confirmation
  - Password verification (in production)
  - All data deleted
  - Automatic logout

**Styling**:
- Status card: Blue primary color
- Active toggles: Green track (#34C759)
- Danger buttons: Red (#FF3B30)
- Highlighted settings: Blue border (#007AFF)

**Confirmation Modals**:
- Withdraw: Orange/warning color
- Delete: Red/destructive
- Custom confirmButton styling

---

## API Integration (services/api.ts)

### New Methods Added

```typescript
// Consent Management
storeConsent(consentData: any): Promise<void>
getStoredConsent(): Promise<any>
recordConsent(consentFlags: any): Promise<any>
updateConsent(updates: any): Promise<void>
withdrawConsent(): Promise<void>
getConsentHistory(): Promise<ConsentHistory[]>

// Data Management
exportData(type: 'anonymized' | 'pii'): Promise<string>
requestDataExport(type: 'anonymized' | 'pii'): Promise<void>
deleteAccount(): Promise<void>

// Session Management
getSessions(timeRange: 'day' | 'week' | 'month'): Promise<Session[]>
deleteSession(sessionId: string): Promise<void>
updateSessionNote(sessionId: string, note: string): Promise<void>

// Screening
submitScreening(data: any): Promise<any>
createCase(data: any): Promise<void>
```

### Mock Implementations
All new methods include fallback mock implementations for development:
- Local storage via SecureStore for persistent data
- Mock responses that simulate backend behavior
- Console logging for debugging
- Error handling with graceful fallbacks

**Storage Keys**:
```typescript
'consentData'          // Stored consent settings
'accessToken'          // JWT token
'refreshToken'         // Refresh token
'userId'               // User identifier
'userUuid'             // User UUID
'userEmail'            // User email
```

---

## Color Scheme

### Primary Colors
- **Primary Blue**: #007AFF (buttons, links, active states)
- **Secondary Green**: #34C759 (success, positive)
- **Tertiary Orange**: #FF9500 (warning, moderate)
- **Danger Red**: #FF3B30 (critical, severe)

### Neutral Colors
- **Text**: #1a1a1a (dark text)
- **Secondary Text**: #666 (muted text)
- **Light Background**: #f5f5f5 (screen background)
- **Card Background**: #fff (white cards)
- **Dividers**: #eee (light borders)

### Emotion Colors
- **Positive**: #34C759 (Euthymic, Neutral)
- **Warning**: #FF9500 (Dysphoric, Irritable)
- **Critical**: #FF3B30 (Anxious)

---

## Typography

- **Headlines**: 28px, Bold (#1a1a1a)
- **Titles**: 20-24px, Bold (#1a1a1a)
- **Subtitles**: 16-18px, SemiBold (#1a1a1a)
- **Body**: 15px, Regular (#333)
- **Small**: 13-14px, Regular (#666)
- **Labels**: 11-12px, SemiBold (#999)

---

## Component Accessibility

### Touch Targets
- Minimum 44px × 44px (WCAG AA)
- Buttons: 48px × 48px with 8px padding
- Icon buttons: 40px minimum width/height

### Screen Reader Support
- `accessibilityLabel` on all buttons
- `accessibilityRole` properly set
- `accessibilityHint` for complex interactions

### Visual Accessibility
- Adequate color contrast (4.5:1 for text)
- Text scaling support
- High-contrast mode support
- No color-only messaging

---

## Installation & Setup

### Prerequisites
```bash
node >= 16
expo-cli >= 6.0
npm or yarn
```

### Install Dependencies
```bash
cd Student_app
npm install
# or
yarn install
```

### Configuration
```bash
# Create config/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'http://your-api-url',
  TIMEOUT: 30000,
  ENDPOINTS: {
    FACE_UPLOAD: '/api/face/upload',
    // ... other endpoints
  }
};
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
```

### Test on Device
```bash
# Scan QR code with Expo Go app
# Or run on iOS/Android emulator
npm run ios
npm run android
```

---

## Features Summary

### ✅ Completed
- [x] 5 feature screens (Onboarding, Resources, Chatbot, Screening, History, Privacy)
- [x] Home dashboard with navigation
- [x] AI chatbot with smart responses
- [x] PHQ-9 screening questionnaire
- [x] Session history with analytics
- [x] Privacy controls and consent management
- [x] API service integration
- [x] Mock data for development
- [x] Professional UI with elevation shadows
- [x] Accessibility compliance (WCAG AA)
- [x] TypeScript strict mode
- [x] Responsive design

### 🔄 Ready for Integration
- Camera & face recognition (structure in place)
- Real backend API (mock endpoints ready)
- Data persistence (AsyncStorage hooks ready)
- ML emotion detection (service ready)

### 📋 Future Enhancements
- Admin/therapist dashboard
- Real-time notifications
- Biometric integration
- Advanced analytics
- Peer support groups
- Crisis hotline integration
- Prescription management

---

## File Sizes
- OnboardingConsent.tsx: ~9 KB
- Resources.tsx: ~11 KB
- Chatbot.tsx: ~10 KB
- ScreeningModal.tsx: ~14 KB
- SessionHistory.tsx: ~13 KB
- PrivacySettings.tsx: ~11 KB
- home.tsx (updated): ~12 KB
- api.ts (extended): ~8 KB

**Total**: ~88 KB of production code

---

## Testing Checklist

### Manual Testing
- [ ] Navigate between all screens
- [ ] Test all buttons and interactions
- [ ] Verify data persistence
- [ ] Test error handling
- [ ] Check responsiveness on different devices

### Feature Testing
- [ ] Onboarding: Accept/Decline flows
- [ ] Resources: Search and filtering
- [ ] Chatbot: Message sending and responses
- [ ] Screening: All questions and scoring
- [ ] History: Time range filtering and export
- [ ] Privacy: Settings changes and confirmations

### Integration Testing
- [ ] API calls with real backend
- [ ] Authentication flow
- [ ] Data sync across screens
- [ ] Error states and fallbacks

---

## Support

For questions or issues:
1. Check component documentation above
2. Review inline code comments
3. Check API error messages
4. Verify mock data structure
5. Contact: support@university.edu

---

## License

© 2025 Emotion Recognition Model - All Rights Reserved
