import { CATALOG } from "./catalog";
import type { Track } from "./types";

/**
 * The daily puzzle resets at the player's local midnight, so the puzzle key is
 * a local calendar date rather than a UTC timestamp. Two players in different
 * timezones can therefore be on different puzzles at the same instant, which is
 * the intended trade for "it resets when your day does".
 *
 * Selection is a pure function of the date key, so the server, the client and
 * a shared result card all derive the same track with no coordination.
 */

/** Epoch for puzzle numbering. Puzzle #1 is 2024-01-01. */
const EPOCH = Date.UTC(2024, 0, 1);

export function localDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(Date.parse(`${key}T00:00:00Z`));
}

export function puzzleNumber(dateKey: string): number {
  const parsed = Date.parse(`${dateKey}T00:00:00Z`);
  return Math.floor((parsed - EPOCH) / 86_400_000) + 1;
}

/** FNV-1a. Small, dependency-free, and stable across runtimes. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Walks the catalog in a fixed pseudo-random permutation rather than indexing
 * by hash directly, which would repeat tracks long before the pool is
 * exhausted. Every track is used once per cycle.
 */
export function dailyTrack(dateKey: string, pool: Track[] = CATALOG): Track {
  if (!pool.length) throw new Error("Cannot pick a daily track from an empty pool.");

  const index = puzzleNumber(dateKey) - 1;
  const cycle = Math.floor(index / pool.length);
  const offset = ((index % pool.length) + pool.length) % pool.length;

  return shuffleDeterministic(pool, `cluetune-daily-cycle-${cycle}`)[offset]!;
}

/** Fisher-Yates driven by a seeded LCG so the order is reproducible. */
export function shuffleDeterministic<T>(items: T[], seed: string): T[] {
  const out = [...items];
  let state = hashString(seed) || 1;

  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }

  return out;
}

/** Milliseconds until the next local midnight, for the countdown. */
export function msUntilLocalMidnight(now: Date = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((n) => `${n}`.padStart(2, "0")).join(":");
}
