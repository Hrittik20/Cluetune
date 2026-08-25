import { hashString, shuffleDeterministic } from "./daily";
import type { Track } from "./types";

/**
 * Lyric-Flip clue generation.
 *
 * The clue is derived from the track title rather than from song lyrics.
 * That is a licensing decision, not a shortcut: reproducing even a single line
 * of a lyric requires a publishing licence, and shipping lyric text in the
 * repository would create a liability with no way to audit it per-territory.
 *
 * Titles are short-phrase factual metadata, are already surfaced by every
 * music API, and — because titles are usually drawn from the hook — carry
 * almost the same "oh, THAT song" recognition payload.
 *
 * To use real lyric lines, implement a provider against a licensed source
 * (Musixmatch and LyricFind both offer a first-line/hook endpoint suitable for
 * this) and pass the returned line in as `sourceLine`. The masking below is
 * source-agnostic and needs no changes.
 */

export interface ClueToken {
  /** Characters with their reveal state, in display order. */
  chars: { char: string; revealed: boolean }[];
}

export interface LyricClue {
  tokens: ClueToken[];
  /** True while the word order is still shuffled. */
  scrambled: boolean;
  hint: string;
}

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * Reveals progressively across the six attempts: scrambled blocks, then true
 * word order, then vowels, then initials, then most of the phrase.
 */
export function buildClue(track: Track, attempt: number, sourceLine?: string): LyricClue {
  const line = (sourceLine ?? track.title).trim();
  const words = line.split(/\s+/).filter(Boolean);
  const stage = Math.max(0, Math.min(attempt, 5));

  const ordered = stage === 0 ? shuffleDeterministic(words, `flip-${track.id}`) : words;

  const tokens = ordered.map((word, wordIndex) => ({
    chars: [...word].map((char, charIndex) => ({
      char,
      revealed: isRevealed(char, stage, hashString(`${track.id}:${wordIndex}:${charIndex}`)),
    })),
  }));

  return { tokens, scrambled: stage === 0, hint: HINTS[stage]! };
}

const HINTS = [
  "Word order is scrambled. Letters are hidden.",
  "Word order is now correct.",
  "Vowels revealed.",
  "First letters revealed.",
  "Half the phrase revealed.",
  "Almost all of it revealed.",
] as const;

function isRevealed(char: string, stage: number, noise: number): boolean {
  // Punctuation and spacing never carry information worth hiding.
  if (!/[a-z0-9]/i.test(char)) return true;

  const lower = char.toLowerCase();

  if (stage >= 5) return noise % 100 < 85;
  if (stage >= 4) return noise % 100 < 50;
  if (stage >= 3 && VOWELS.has(lower)) return true;
  if (stage >= 2 && VOWELS.has(lower)) return true;

  return false;
}

/** Initial-letter reveal needs word position, which `isRevealed` cannot see. */
export function applyInitials(clue: LyricClue, stage: number): LyricClue {
  if (stage < 3) return clue;

  return {
    ...clue,
    tokens: clue.tokens.map((token) => ({
      chars: token.chars.map((entry, index) => (index === 0 ? { ...entry, revealed: true } : entry)),
    })),
  };
}
