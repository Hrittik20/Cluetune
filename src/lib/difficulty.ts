import { MAX_ATTEMPTS } from "./game";
import type { Difficulty, GameMode } from "./types";

export type DifficultyTier = "easy" | "medium" | "hard" | "expert" | "impossible";

export const TIER_LABELS: Record<DifficultyTier, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
  impossible: "Impossible",
};

/**
 * Modes whose results feed the crowd difficulty. Drunk distorts the audio and
 * Lyrics is a different skill, so both would make songs look harder than they are.
 */
export const COUNTED_MODES: ReadonlySet<GameMode> = new Set(["daily", "unlimited", "gauntlet"]);

/** Finished rounds for one song across all players. Abandoned rounds are never sent. */
export interface SongStats {
  /** `solves[i]` is how many players solved it on attempt i + 1. */
  solves: number[];
  losses: number;
}

export function emptyStats(): SongStats {
  return { solves: Array.from({ length: MAX_ATTEMPTS }, () => 0), losses: 0 };
}

export function totalPlays(stats: SongStats): number {
  return stats.solves.reduce((sum, n) => sum + n, 0) + stats.losses;
}

/** A first-clip solve is worth 1, a last-clip solve 1/6, a loss 0. */
function resultScore(attempt: number | null): number {
  return attempt ? (MAX_ATTEMPTS + 1 - attempt) / MAX_ATTEMPTS : 0;
}

/**
 * Where each editorial rating starts on the score scale, before any plays.
 * Each sits inside the band of the tier it maps to.
 */
const PRIOR_SCORE: Record<Difficulty, number> = { 1: 0.8, 2: 0.6, 3: 0.42, 4: 0.25, 5: 0.1 };

/** How many plays the editorial rating is worth. Crowd data outweighs it past this. */
const PRIOR_WEIGHT = 10;

/** Lowest blended score that still earns each tier, easiest first. */
const TIER_CUTOFFS: [DifficultyTier, number][] = [
  ["easy", 0.7],
  ["medium", 0.5],
  ["hard", 0.33],
  ["expert", 0.15],
];

/** "Impossible" has to be earned by real players, never by the editorial prior alone. */
const IMPOSSIBLE_MIN_PLAYS = 30;

export function songTier(difficulty: Difficulty, stats?: SongStats | null): DifficultyTier {
  const plays = stats ? totalPlays(stats) : 0;
  const earned = stats ? stats.solves.reduce((sum, n, i) => sum + n * resultScore(i + 1), 0) : 0;
  const score = (earned + PRIOR_WEIGHT * PRIOR_SCORE[difficulty]) / (plays + PRIOR_WEIGHT);

  const tier = TIER_CUTOFFS.find(([, min]) => score >= min)?.[0] ?? "impossible";
  return tier === "impossible" && plays < IMPOSSIBLE_MIN_PLAYS ? "expert" : tier;
}

/**
 * Typical spread for each tier, as a share of players solving on attempts
 * 1–6 followed by losses. Each row sums to 100.
 */
const TIER_SHAPE: Record<DifficultyTier, number[]> = {
  easy: [34, 22, 14, 9, 5, 4, 12],
  medium: [18, 19, 16, 12, 8, 6, 21],
  hard: [9, 13, 15, 13, 10, 8, 32],
  expert: [4, 7, 10, 11, 10, 9, 49],
  impossible: [1, 3, 5, 6, 7, 8, 70],
};

/** Every song is presented as having at least this many players. */
const BASELINE_PLAYERS = 40;

/**
 * Tops a song's real results up with a made-up crowd shaped like its tier, so
 * a song nobody has played yet never reads as empty. The padding shrinks as
 * real players arrive and is gone once there are `BASELINE_PLAYERS` of them.
 * Seeded by track id so the same song always gets the same crowd.
 */
export function withBaseline(stats: SongStats | null, tier: DifficultyTier, trackId: string): SongStats {
  const real = stats ?? emptyStats();
  const missing = Math.max(0, BASELINE_PLAYERS - totalPlays(real));
  if (!missing) return real;

  const random = seededRandom(trackId);
  const shape = TIER_SHAPE[tier].map((share) => share * (0.75 + random() * 0.5));
  const sum = shape.reduce((total, share) => total + share, 0);
  const padding = shape.map((share) => (share / sum) * missing);

  return {
    solves: real.solves.map((count, index) => count + padding[index]!),
    losses: real.losses + padding[MAX_ATTEMPTS]!,
  };
}

function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) state = Math.imul(state ^ seed.charCodeAt(i), 16777619);
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822507);
    state = Math.imul(state ^ (state >>> 13), 3266489909);
    return ((state ^= state >>> 16) >>> 0) / 4294967296;
  };
}

export type Standing =
  /** Solved: share of other players with a worse result, ties counted as half. */
  | { kind: "beat"; percent: number }
  /** Lost: share of other players who solved it. */
  | { kind: "solve-rate"; percent: number };

/**
 * Compares one result against everyone else's. `stats` is assumed to already
 * contain this player's result (it was recorded before the reveal), so one is
 * taken back out of their bucket.
 */
export function standing(stats: SongStats, attempt: number | null): Standing {
  const solves = [...stats.solves];
  let losses = stats.losses;

  if (attempt) solves[attempt - 1] = Math.max(0, (solves[attempt - 1] ?? 0) - 1);
  else losses = Math.max(0, losses - 1);

  const others = Math.max(1, solves.reduce((sum, n) => sum + n, 0) + losses);

  if (!attempt) {
    return { kind: "solve-rate", percent: Math.round((100 * (others - losses)) / others) };
  }

  const worse = losses + solves.slice(attempt).reduce((sum, n) => sum + n, 0);
  const ties = solves[attempt - 1] ?? 0;
  return { kind: "beat", percent: Math.round((100 * (worse + ties / 2)) / others) };
}
