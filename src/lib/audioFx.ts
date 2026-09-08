import type { RoundState } from "./game";

/** Session intoxication meter for Drunk mode. Higher = more wrecked next clip. */
export type DrunkLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const DRUNK_LEVEL_LABELS: Record<DrunkLevel, string> = {
  0: "Sober",
  1: "Tipsy",
  2: "Buzzed",
  3: "Drunk",
  4: "Wasted",
  5: "Blackout",
};

export const DRUNK_START_LEVEL: DrunkLevel = 1;
export const DRUNK_MAX_LEVEL = 5;

/**
 * Declarative Web Audio + element playback params for one Drunk clip.
 * Wet FX need CORS; rate always applies via HTMLMediaElement.
 */
export interface AudioFxPreset {
  rate: number;
  lowpassHz: number | null;
  delayTime: number;
  delayFeedback: number;
  delayWet: number;
  reverbWet: number;
  /** 0–1. Modulates filter and playbackRate for a drunk sway. */
  wobbleDepth: number;
  /** Short label for UI / debugging (dominant character). */
  character: string;
}

type Character = "slow-slurry" | "chipmunk-echo" | "bathroom" | "underwater" | "tape-wobble";

const CHARACTERS: Character[] = [
  "slow-slurry",
  "chipmunk-echo",
  "bathroom",
  "underwater",
  "tape-wobble",
];

/** Mulberry32 — tiny deterministic PRNG from a 32-bit seed. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clampLevel(value: number): DrunkLevel {
  return Math.max(0, Math.min(DRUNK_MAX_LEVEL, Math.round(value))) as DrunkLevel;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * How much intoxication moves after a finished round.
 * Early wins sober you up; late wins and losses deepen the hangover.
 */
export function buzzDeltaForRound(state: RoundState): number {
  if (state.status === "lost") return 2;
  if (state.status !== "won") return 0;

  const attempt = state.guesses.length;
  if (attempt <= 1) return -2;
  if (attempt === 2) return -1;
  if (attempt === 3) return 0;
  if (attempt <= 5) return 1;
  return 2;
}

export function nextBuzzLevel(current: DrunkLevel, state: RoundState): DrunkLevel {
  return clampLevel(current + buzzDeltaForRound(state));
}

export function buzzFlavor(previous: DrunkLevel, next: DrunkLevel): string | null {
  if (next < previous) return "Sobering up…";
  if (next > previous) return "Getting drunker…";
  return null;
}

/** Short cue after an in-round miss/skip — the next listen will be clearer. */
export function skipSoberingFlavor(attemptIndex: number): string | null {
  if (attemptIndex <= 0 || attemptIndex > DRUNK_MAX_LEVEL) return null;
  return "Clearing up…";
}

const CLEAN: AudioFxPreset = {
  rate: 1,
  lowpassHz: null,
  delayTime: 0,
  delayFeedback: 0,
  delayWet: 0,
  reverbWet: 0,
  wobbleDepth: 0,
  character: "clean",
};

/**
 * Build a stable FX preset for this track.
 *
 * Within a round the mix starts drunk and sobers as the player skips/misses
 * (`attemptIndex` 0 → hardest, 5 → clearest). Session `level` only scales how
 * hard that first listen is. Character is seeded from the track so skips keep
 * the same drunk “flavor” while the intensity drops.
 */
export function buildDrunkFx(level: DrunkLevel, seed: string, attemptIndex = 0): AudioFxPreset {
  const attempt = Math.max(0, Math.min(DRUNK_MAX_LEVEL, attemptIndex));
  const sobering = attempt / DRUNK_MAX_LEVEL; // 0 first try → 1 on the last rung
  const sessionBoost = level / DRUNK_MAX_LEVEL;

  // First listens are messy; each skip clears the haze. Session buzz only
  // raises the starting ceiling — it never keeps attempt six underwater.
  const t = (1 - sobering) * lerp(0.55, 1, Math.max(sessionBoost, 0.2));

  if (t < 0.12) {
    return { ...CLEAN, character: "sobering" };
  }

  const rand = mulberry32(hashSeed(seed));
  const character = CHARACTERS[Math.floor(rand() * CHARACTERS.length)]!;
  const base = characterPreset(character, t, rand);

  // A little extra wet/wobble only while still early in the round.
  if (t > 0.55) {
    base.reverbWet = Math.max(base.reverbWet, lerp(0.08, 0.22, t));
    base.delayWet = Math.max(base.delayWet, lerp(0.06, 0.2, t));
  }
  if (t > 0.75) {
    base.wobbleDepth = Math.max(base.wobbleDepth, lerp(0.15, 0.4, t));
  }

  return base;
}

function characterPreset(character: Character, t: number, rand: () => number): AudioFxPreset {
  switch (character) {
    case "slow-slurry":
      return {
        rate: lerp(0.9, 0.72, t) - rand() * 0.03,
        lowpassHz: lerp(8000, 2800, t),
        delayTime: lerp(0.16, 0.32, t),
        delayFeedback: lerp(0.2, 0.42, t),
        delayWet: lerp(0.12, 0.32, t),
        reverbWet: lerp(0.1, 0.3, t),
        wobbleDepth: lerp(0.1, 0.35, t),
        character,
      };
    case "chipmunk-echo":
      return {
        rate: lerp(1.15, 1.35, t) + rand() * 0.04,
        lowpassHz: null,
        delayTime: lerp(0.14, 0.28, t),
        delayFeedback: lerp(0.22, 0.45, t),
        delayWet: lerp(0.15, 0.35, t),
        reverbWet: lerp(0.05, 0.2, t),
        wobbleDepth: lerp(0.05, 0.25, t),
        character,
      };
    case "bathroom":
      return {
        rate: lerp(0.94, 0.82, t),
        lowpassHz: lerp(6500, 2800, t),
        delayTime: lerp(0.2, 0.38, t),
        delayFeedback: lerp(0.28, 0.5, t),
        delayWet: lerp(0.18, 0.38, t),
        reverbWet: lerp(0.2, 0.4, t),
        wobbleDepth: lerp(0.08, 0.28, t),
        character,
      };
    case "underwater":
      return {
        rate: lerp(0.9, 0.75, t),
        lowpassHz: lerp(4000, 1600, t),
        delayTime: lerp(0.1, 0.22, t),
        delayFeedback: lerp(0.15, 0.35, t),
        delayWet: lerp(0.1, 0.25, t),
        reverbWet: lerp(0.15, 0.35, t),
        wobbleDepth: lerp(0.15, 0.4, t),
        character,
      };
    case "tape-wobble":
      return {
        rate: lerp(0.94, 1.1, t) + (rand() - 0.5) * lerp(0.04, 0.1, t),
        lowpassHz: lerp(10_000, 3500, t),
        delayTime: lerp(0.08, 0.18, t),
        delayFeedback: lerp(0.1, 0.28, t),
        delayWet: lerp(0.08, 0.22, t),
        reverbWet: lerp(0.08, 0.25, t),
        wobbleDepth: lerp(0.25, 0.5, t),
        character,
      };
  }
}
