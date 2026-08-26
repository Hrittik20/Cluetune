export type Genre =
  | "pop"
  | "hip-hop"
  | "rnb"
  | "rock"
  | "indie"
  | "electronic"
  | "kpop"
  | "afrobeats"
  | "hyperpop"
  | "drill"
  | "latin"
  | "country"
  | "metal"
  | "jazz";

export type Decade = "1960s" | "1970s" | "1980s" | "1990s" | "2000s" | "2010s" | "2020s";

/** 1 = chart-inescapable, 5 = deep cut. Drives the obscurity filter. */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Track {
  /** Stable Cluetune-owned id. Never a provider id, so providers stay swappable. */
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  genres: Genre[];
  difficulty: Difficulty;
  /** Optional provider hints that let the resolver skip a search round-trip. */
  isrc?: string;
  spotifyId?: string;
}

export type GameMode = "daily" | "unlimited" | "sped-up" | "lyric-flip" | "gauntlet";

export type GuessVerdict = "correct" | "close" | "wrong" | "skip";

export interface Guess {
  /** Raw label the player committed, kept verbatim for the reveal list. */
  label: string;
  verdict: GuessVerdict;
  /** Milliseconds of audio the player had heard when they committed. */
  unlockedMs: number;
}

export interface RoundResult {
  trackId: string;
  mode: GameMode;
  won: boolean;
  /** 1-indexed attempt that won, or null on a loss. */
  attempt: number | null;
  guesses: Guess[];
  /** Wall-clock milliseconds from first play to resolution. */
  elapsedMs: number;
}

export interface AudioSource {
  kind: "audio" | "youtube";
  /** Direct preview stream for `audio`, or a video id for `youtube`. */
  ref: string;
  provider: "itunes" | "deezer" | "spotify" | "youtube";
  /** Where in the full track the preview window begins, if known. */
  offsetMs: number;
  artworkUrl?: string;
  /** Present when the provider disclosed a canonical duration. */
  durationMs?: number;
  attribution: string;
}

export interface LyricSnippet {
  /** Redacted lines shown progressively across attempts. */
  lines: string[];
  linesPerReveal: number;
  attribution: string;
}

export interface ResolvedTrack {
  track: Track;
  source: AudioSource | null;
  /** Present in Lyrics Guess when a snippet could be built. */
  lyrics?: LyricSnippet | null;
  /** Populated when every provider in the chain declined. */
  unavailableReason?: string;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  artist: string;
  year?: number;
}

export interface ModeFilters {
  genres: Genre[];
  decades: Decade[];
  /** Inclusive difficulty window. */
  difficulty: [Difficulty, Difficulty];
}
