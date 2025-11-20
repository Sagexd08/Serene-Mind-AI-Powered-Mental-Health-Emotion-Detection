create table RefreshToken(
    token TEXT PRIMARY KEY,
    user_uuid UUID REFERENCES user(uuid) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL
);