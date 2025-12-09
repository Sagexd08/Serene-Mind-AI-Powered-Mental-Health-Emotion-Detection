CREATE TABLE IF NOT EXISTS handoffs (
    handoff_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    preferred_mode TEXT,
    schedule_time TEXT,
    include_transcript BOOLEAN DEFAULT FALSE,
    livekit_room TEXT,
    transcript TEXT,
    emotion_metrics TEXT,
    consent_flags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
