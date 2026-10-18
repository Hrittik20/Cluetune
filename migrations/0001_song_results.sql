-- One row per player per song. The primary key is what stops replays and
-- challenge links from counting the same player twice.
CREATE TABLE IF NOT EXISTS song_results (
  track_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  -- 1-indexed winning attempt, NULL on a loss.
  attempt INTEGER,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (track_id, player_id)
);

-- Running totals per song, so reads never scan song_results.
CREATE TABLE IF NOT EXISTS song_stats (
  track_id TEXT PRIMARY KEY,
  a1 INTEGER NOT NULL DEFAULT 0,
  a2 INTEGER NOT NULL DEFAULT 0,
  a3 INTEGER NOT NULL DEFAULT 0,
  a4 INTEGER NOT NULL DEFAULT 0,
  a5 INTEGER NOT NULL DEFAULT 0,
  a6 INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
