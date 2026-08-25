import type { GameMode, Guess, Track } from "./types";

/**
 * Clip ladder in milliseconds. Index N is how much audio is unlocked on
 * attempt N+1, so a player who never guesses still hears 16s by attempt six.
 * The first rung is deliberately punishing (1s) because the reveal-by-degrees
 * curve is the whole game.
 */
export const CLIP_LADDER_MS = [1000, 2000, 4000, 7000, 11_000, 16_000] as const;

export const MAX_ATTEMPTS = CLIP_LADDER_MS.length;

/** Sped-Up compresses the ladder because pitch-shifted audio reveals faster. */
export const SPED_UP_LADDER_MS = [800, 1600, 3000, 5000, 8000, 12_000] as const;

/** Playback rate for Sped-Up. Pitch rises with tempo, which is the point. */
export const SPED_UP_RATE = 1.35;

export function ladderFor(mode: GameMode): readonly number[] {
  return mode === "sped-up" ? SPED_UP_LADDER_MS : CLIP_LADDER_MS;
}

export function playbackRateFor(mode: GameMode): number {
  return mode === "sped-up" ? SPED_UP_RATE : 1;
}

export interface RoundState {
  mode: GameMode;
  track: Track;
  guesses: Guess[];
  status: "playing" | "won" | "lost";
  /** Timestamp of the first play, used for time-to-guess. */
  startedAt: number | null;
  endedAt: number | null;
}

export function createRound(mode: GameMode, track: Track): RoundState {
  return { mode, track, guesses: [], status: "playing", startedAt: null, endedAt: null };
}

export function attemptIndex(state: RoundState): number {
  return Math.min(state.guesses.length, MAX_ATTEMPTS - 1);
}

/** How much audio the player is currently entitled to hear. */
export function unlockedMs(state: RoundState): number {
  const ladder = ladderFor(state.mode);
  if (state.status !== "playing") return ladder[ladder.length - 1]!;
  return ladder[attemptIndex(state)]!;
}

/** The extra audio the next wrong guess or skip would buy. */
export function nextUnlockMs(state: RoundState): number | null {
  const ladder = ladderFor(state.mode);
  const next = state.guesses.length + 1;
  return next < ladder.length ? ladder[next]! : null;
}

export function applyGuess(state: RoundState, guess: Guess, now = Date.now()): RoundState {
  if (state.status !== "playing") return state;

  const guesses = [...state.guesses, guess];
  const won = guess.verdict === "correct";
  const lost = !won && guesses.length >= MAX_ATTEMPTS;

  return {
    ...state,
    guesses,
    status: won ? "won" : lost ? "lost" : "playing",
    startedAt: state.startedAt ?? now,
    endedAt: won || lost ? now : null,
  };
}

export function elapsedMs(state: RoundState): number {
  if (state.startedAt == null) return 0;
  return (state.endedAt ?? Date.now()) - state.startedAt;
}

/** 1-indexed winning attempt, or null if the round was lost. */
export function winningAttempt(state: RoundState): number | null {
  if (state.status !== "won") return null;
  return state.guesses.length;
}

/**
 * Score rewards guessing early far more than guessing at all, so an unlimited
 * session cannot be farmed by brute-forcing six attempts every round.
 */
export function scoreRound(state: RoundState): number {
  if (state.status !== "won") return 0;

  const attempt = state.guesses.length;
  const base = [1000, 700, 500, 340, 220, 120][attempt - 1] ?? 100;

  // Speed bonus decays over 30s and is capped so it never outweighs accuracy.
  const seconds = elapsedMs(state) / 1000;
  const speedBonus = Math.round(Math.max(0, 200 - seconds * 6));

  return base + speedBonus;
}

export const TILE_GLYPHS: Record<Guess["verdict"], string> = {
  correct: "🟩",
  close: "🟨",
  wrong: "🟥",
  skip: "⬛",
};

/** Wordle-style pattern, padded with empty rungs the player never reached. */
export function tilePattern(state: RoundState): string {
  const filled = state.guesses.map((g) => TILE_GLYPHS[g.verdict]).join("");
  const remaining = "⬜".repeat(Math.max(0, MAX_ATTEMPTS - state.guesses.length));
  return filled + remaining;
}

export interface SessionStats {
  rounds: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  /** Sum of winning-attempt numbers, for the average-guesses metric. */
  attemptsOnWins: number;
  /** Sum of elapsed ms on wins, for average time-to-guess. */
  timeOnWinsMs: number;
}

export const EMPTY_SESSION: SessionStats = {
  rounds: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalScore: 0,
  attemptsOnWins: 0,
  timeOnWinsMs: 0,
};

export function recordRound(session: SessionStats, state: RoundState): SessionStats {
  const won = state.status === "won";
  const currentStreak = won ? session.currentStreak + 1 : 0;

  return {
    rounds: session.rounds + 1,
    wins: session.wins + (won ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(session.bestStreak, currentStreak),
    totalScore: session.totalScore + scoreRound(state),
    attemptsOnWins: session.attemptsOnWins + (won ? state.guesses.length : 0),
    timeOnWinsMs: session.timeOnWinsMs + (won ? elapsedMs(state) : 0),
  };
}

export function accuracy(session: SessionStats): number {
  return session.rounds ? session.wins / session.rounds : 0;
}

export function averageAttempts(session: SessionStats): number | null {
  return session.wins ? session.attemptsOnWins / session.wins : null;
}

export function averageSeconds(session: SessionStats): number | null {
  return session.wins ? session.timeOnWinsMs / session.wins / 1000 : null;
}
