import { env } from "cloudflare:workers";
import { emptyStats, type SongStats } from "./difficulty";
import { MAX_ATTEMPTS } from "./game";
import type { GameMode } from "./types";

/**
 * Server-only. Reads and writes crowd results in D1. Every function degrades to
 * "no data" when the binding is missing or D1 errors, so difficulty falls back
 * to the editorial rating instead of breaking a round.
 */

interface StatsRow {
  track_id: string;
  a1: number;
  a2: number;
  a3: number;
  a4: number;
  a5: number;
  a6: number;
  losses: number;
}

function toStats(row: StatsRow): SongStats {
  return { solves: [row.a1, row.a2, row.a3, row.a4, row.a5, row.a6], losses: row.losses };
}

export async function readSongStats(trackIds: string[]): Promise<Map<string, SongStats>> {
  const found = new Map<string, SongStats>();
  const ids = [...new Set(trackIds)];
  if (!env.DB || !ids.length) return found;

  try {
    const { results } = await env.DB.prepare(
      `SELECT track_id, a1, a2, a3, a4, a5, a6, losses FROM song_stats WHERE track_id IN (${ids.map(() => "?").join(",")})`,
    )
      .bind(...ids)
      .all<StatsRow>();
    for (const row of results) found.set(row.track_id, toStats(row));
  } catch {
    /* Treated as no data. */
  }
  return found;
}

export async function readOneSongStats(trackId: string): Promise<SongStats> {
  return (await readSongStats([trackId])).get(trackId) ?? emptyStats();
}

export interface SongResult {
  trackId: string;
  playerId: string;
  mode: GameMode;
  attempt: number | null;
}

/** Returns whether the result was new. A repeat from the same player is ignored. */
export async function recordSongResult(result: SongResult): Promise<boolean> {
  if (!env.DB) return false;
  const now = Date.now();

  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO song_results (track_id, player_id, mode, attempt, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(result.trackId, result.playerId, result.mode, result.attempt, now)
    .run();
  if (!inserted.meta.changes) return false;

  // Safe to interpolate: the column comes from a validated 1..MAX_ATTEMPTS integer.
  const column = result.attempt && result.attempt <= MAX_ATTEMPTS ? `a${result.attempt}` : "losses";
  await env.DB.prepare(
    `INSERT INTO song_stats (track_id, ${column}, updated_at) VALUES (?, 1, ?)
     ON CONFLICT(track_id) DO UPDATE SET ${column} = ${column} + 1, updated_at = excluded.updated_at`,
  )
    .bind(result.trackId, now)
    .run();
  return true;
}
