import { EMPTY_SESSION, type SessionStats } from "./game";
import type { GameMode, Guess, ModeFilters } from "./types";

/**
 * Everything a player earns is stored locally first. No account is required to
 * play, keep a streak, or share a result — auth (when added) should sync this
 * blob rather than become a precondition for it.
 */

const STORAGE_KEY = "cluetune:v1";

export interface DailyRecord {
  dateKey: string;
  won: boolean;
  /** 1-indexed winning attempt, null on a loss. */
  attempt: number | null;
  pattern: string;
  trackId: string;
  /** Kept so revisiting the day can rebuild the full reveal, not just a score. */
  guesses: Guess[];
  elapsedMs: number;
}

export interface PersistedState {
  version: 1;
  /** Anonymous, client-generated. Used to attribute challenge links only. */
  playerId: string;
  daily: {
    streak: number;
    bestStreak: number;
    lastPlayedDateKey: string | null;
    history: Record<string, DailyRecord>;
  };
  sessions: Partial<Record<GameMode, SessionStats>>;
  prefs: {
    theme: "dark" | "light";
    filters: ModeFilters;
    /** Opt-out for the glitch layer, independent of prefers-reduced-motion. */
    reducedGlitch: boolean;
    hasPlayed: boolean;
  };
}

export function emptyState(): PersistedState {
  return {
    version: 1,
    playerId: createId(),
    daily: { streak: 0, bestStreak: 0, lastPlayedDateKey: null, history: {} },
    sessions: {},
    prefs: {
      theme: "dark",
      filters: { genres: [], decades: [], difficulty: [1, 5] },
      reducedGlitch: false,
      hasPlayed: false,
    },
  };
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
}

export function loadState(): PersistedState {
  if (typeof localStorage === "undefined") return emptyState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version !== 1) return emptyState();

    // Merge against a fresh blob so fields added in later builds are present.
    const base = emptyState();
    return {
      ...base,
      ...parsed,
      playerId: parsed.playerId || base.playerId,
      daily: { ...base.daily, ...parsed.daily },
      sessions: { ...base.sessions, ...parsed.sessions },
      prefs: { ...base.prefs, ...parsed.prefs },
    };
  } catch {
    // Corrupt or quota-blocked storage should never break play.
    return emptyState();
  }
}

export function saveState(state: PersistedState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Private mode and full quotas are non-fatal. */
  }
}

export function updateState(mutate: (draft: PersistedState) => void): PersistedState {
  const state = loadState();
  mutate(state);
  saveState(state);
  return state;
}

/** Yesterday's key relative to a local date key, for streak continuity. */
function previousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

export function recordDaily(record: DailyRecord): PersistedState {
  return updateState((draft) => {
    if (draft.daily.history[record.dateKey]) return;

    draft.daily.history[record.dateKey] = record;

    if (record.won) {
      const continues = draft.daily.lastPlayedDateKey === previousDateKey(record.dateKey);
      draft.daily.streak = continues ? draft.daily.streak + 1 : 1;
      draft.daily.bestStreak = Math.max(draft.daily.bestStreak, draft.daily.streak);
    } else {
      draft.daily.streak = 0;
    }

    draft.daily.lastPlayedDateKey = record.dateKey;
    draft.prefs.hasPlayed = true;
  });
}

export function getDailyRecord(dateKey: string): DailyRecord | null {
  return loadState().daily.history[dateKey] ?? null;
}

export function getSession(mode: GameMode): SessionStats {
  return loadState().sessions[mode] ?? EMPTY_SESSION;
}

export function putSession(mode: GameMode, session: SessionStats): PersistedState {
  return updateState((draft) => {
    draft.sessions[mode] = session;
    draft.prefs.hasPlayed = true;
  });
}

/** Guess distribution across every recorded daily, for the stats page. */
export function dailyDistribution(state: PersistedState = loadState()): number[] {
  const buckets = [0, 0, 0, 0, 0, 0];
  for (const record of Object.values(state.daily.history)) {
    if (record.won && record.attempt) buckets[record.attempt - 1]! += 1;
  }
  return buckets;
}
