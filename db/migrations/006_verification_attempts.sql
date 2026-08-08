-- Track failed sign-in code attempts so brute-force guessing gets locked out.
CREATE TABLE IF NOT EXISTS verification_attempts (
  email TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_updated ON verification_attempts(updated_at);
