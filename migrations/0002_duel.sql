-- Duel match history and head-to-head records.
CREATE TABLE IF NOT EXISTS duel_matches (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  p1_id TEXT NOT NULL,
  p2_id TEXT NOT NULL,
  p1_name TEXT NOT NULL,
  p2_name TEXT NOT NULL,
  p1_score INTEGER NOT NULL,
  p2_score INTEGER NOT NULL,
  winner INTEGER,
  reason TEXT NOT NULL,
  track_ids TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS duel_matches_ended ON duel_matches (ended_at);

-- One row per unordered pair; player_a < player_b lexicographically.
CREATE TABLE IF NOT EXISTS duel_h2h (
  player_a TEXT NOT NULL,
  player_b TEXT NOT NULL,
  a_wins INTEGER NOT NULL DEFAULT 0,
  b_wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (player_a, player_b)
);
