CREATE TABLE IF NOT EXISTS mirrors (
    id TEXT PRIMARY KEY,
    ipAddress TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    createdAt INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mirrorId TEXT NOT NULL,
    cpuUsage REAL NOT NULL,
    memoryUsage REAL NOT NULL,
    timestamp INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY(mirrorId) REFERENCES mirrors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emotion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mirrorId TEXT NOT NULL,
    emotion TEXT NOT NULL,
    count INTEGER NOT NULL,
    timestamp INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY(mirrorId) REFERENCES mirrors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mirrorId TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY(mirrorId) REFERENCES mirrors(id) ON DELETE CASCADE
);
