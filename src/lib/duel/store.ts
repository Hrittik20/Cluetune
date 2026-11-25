import { env } from "cloudflare:workers";
import type { MatchEndReason, RoomKind, Seat } from "./protocol";

/**
 * Server-only D1 access for Duel results. Every function degrades to a no-op /
 * empty result when `env.DB` is missing or D1 errors, so a database hiccup
 * never breaks a live match.
 */

export interface DuelMatchRecord {
  /** `${roomId}:${match}` — unique per played match. */
  id: string;
  roomId: string;
  kind: RoomKind;
  playerIds: [string, string];
  names: [string, string];
  scores: [number, number];
  winner: Seat | null;
  reason: MatchEndReason;
  trackIds: string[];
  startedAt: number;
  endedAt: number;
}

export interface HeadToHeadRecord {
  /** Wins for `playerIds[0]` / `[1]` as passed to `readHeadToHead`. */
  wins: [number, number];
  draws: number;
}

interface H2hRow {
  player_a: string;
  player_b: string;
  a_wins: number;
  b_wins: number;
  draws: number;
}

/** Inserts the match and updates the head-to-head row. Returns whether it was new. */
export async function recordDuelMatch(record: DuelMatchRecord): Promise<boolean> {
  if (!env.DB || record.reason === "cancelled") return false;

  try {
    const inserted = await env.DB.prepare(
      `INSERT OR IGNORE INTO duel_matches
        (id, room_id, kind, p1_id, p2_id, p1_name, p2_name, p1_score, p2_score, winner, reason, track_ids, started_at, ended_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        record.id,
        record.roomId,
        record.kind,
        record.playerIds[0],
        record.playerIds[1],
        record.names[0],
        record.names[1],
        record.scores[0],
        record.scores[1],
        record.winner,
        record.reason,
        record.trackIds.join(","),
        record.startedAt,
        record.endedAt,
      )
      .run();

    if (!inserted.meta.changes) return false;

    const [low, high] = orderedPair(record.playerIds[0], record.playerIds[1]);
    const aIsFirst = record.playerIds[0] === low;
    let aDelta = 0;
    let bDelta = 0;
    let drawDelta = 0;

    if (record.winner === null) {
      drawDelta = 1;
    } else if ((record.winner === 0) === aIsFirst) {
      aDelta = 1;
    } else {
      bDelta = 1;
    }

    await env.DB.prepare(
      `INSERT INTO duel_h2h (player_a, player_b, a_wins, b_wins, draws, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(player_a, player_b) DO UPDATE SET
         a_wins = a_wins + excluded.a_wins,
         b_wins = b_wins + excluded.b_wins,
         draws = draws + excluded.draws,
         updated_at = excluded.updated_at`,
    )
      .bind(low, high, aDelta, bDelta, drawDelta, record.endedAt)
      .run();

    return true;
  } catch {
    return false;
  }
}

export async function readHeadToHead(playerIds: [string, string]): Promise<HeadToHeadRecord | null> {
  if (!env.DB) return null;

  try {
    const [low, high] = orderedPair(playerIds[0], playerIds[1]);
    const row = await env.DB.prepare(
      "SELECT player_a, player_b, a_wins, b_wins, draws FROM duel_h2h WHERE player_a = ? AND player_b = ?",
    )
      .bind(low, high)
      .first<H2hRow>();

    if (!row) return { wins: [0, 0], draws: 0 };

    // Map sorted-pair wins back to the caller's seat order.
    if (playerIds[0] === low) {
      return { wins: [row.a_wins, row.b_wins], draws: row.draws };
    }
    return { wins: [row.b_wins, row.a_wins], draws: row.draws };
  } catch {
    return null;
  }
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
