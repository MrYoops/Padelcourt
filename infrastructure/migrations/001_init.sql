-- Initial schema: users, matches, match_events, highlights
-- Run manually or via backend init_db (SQLAlchemy create_all)

-- Users (id UUID, telegram_id, name, phone, photo_url, is_pro, created_at)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    photo_url VARCHAR(512),
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id VARCHAR(64) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status VARCHAR(32) DEFAULT 'active',
    team_a_player_ids UUID[] NOT NULL,
    team_b_player_ids UUID[] NOT NULL,
    score JSONB NOT NULL DEFAULT '{}'
);

-- Match events
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    kind VARCHAR(32) NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Highlights
CREATE TABLE IF NOT EXISTS highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    timestamp_sec DOUBLE PRECISION NOT NULL,
    url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_highlights_match_id ON highlights(match_id);
