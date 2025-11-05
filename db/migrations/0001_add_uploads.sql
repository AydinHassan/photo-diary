CREATE TABLE IF NOT EXISTS uploads (
    id           TEXT PRIMARY KEY,
    key          TEXT NOT NULL,
    user_id      TEXT,
    temporary    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL,
    committed_at TEXT,
    place_id     INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_uploads_key ON uploads (key);
CREATE INDEX IF NOT EXISTS idx_uploads_tmp_created ON uploads (temporary, created_at);
