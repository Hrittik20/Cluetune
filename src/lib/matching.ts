import type { GuessVerdict, Track } from "./types";

/**
 * Guess matching is the single biggest fairness lever in this genre. Players
 * churn when a game rejects an answer they clearly knew, so the rules here are
 * deliberately generous in the player's favour:
 *
 *  - Release-metadata noise is stripped ("- 2011 Remaster", "(Deluxe)").
 *  - Featured-artist credits never have to be typed.
 *  - Diacritics, curly punctuation and "&" vs "and" are all equivalent.
 *  - A short edit distance is tolerated so typos still count.
 *
 * A guess for the right artist but the wrong song returns `close` rather than
 * `wrong`, which is the signal that makes the tile grid worth reading.
 */

/** Producer/version noise that should never affect whether a guess counts. */
const NOISE_SEGMENT =
  /\s*[-–—]\s*(\d{4}\s+)?(remaster(ed)?|remix|mono|stereo|live|radio edit|single version|album version|extended|instrumental|acoustic|demo|deluxe|bonus track|anniversary edition|re-?recorded).*$/i;

const NOISE_PARENTHETICAL =
  /\s*[([{]\s*(feat\.?|ft\.?|featuring|with|prod\.?( by)?|remaster(ed)?|remix|live|mono|stereo|radio edit|single version|album version|extended|instrumental|acoustic|demo|deluxe|bonus|from .*|explicit|clean)\b[^)\]}]*[)\]}]/gi;

const FEATURE_CREDIT = /\s*(feat\.?|ft\.?|featuring|with|,|&|\bx\b|\band\b)\s+.*$/i;

export function normalize(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining diacritical marks so "Tití" matches "Titi".
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(NOISE_PARENTHETICAL, " ")
    .replace(NOISE_SEGMENT, " ")
    .replace(/\band\b/g, "&")
    .replace(/[^a-z0-9&']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Drops everything after a feature credit, e.g. "Wizkid feat. Tems" → "wizkid". */
export function primaryArtist(artist: string): string {
  return normalize(artist.replace(FEATURE_CREDIT, ""));
}

/** Levenshtein with early exit once the budget is blown. */
export function editDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowBest = current[0];

    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
      if (current[j] < rowBest) rowBest = current[j];
    }

    if (rowBest > max) return max + 1;
    [previous, current] = [current, previous];
  }

  return previous[b.length];
}

/** Longer strings earn a larger typo budget; very short titles get none. */
function typoBudget(length: number): number {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  if (length <= 16) return 2;
  return 3;
}

export function looseEquals(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  if (left === right) return true;

  const budget = typoBudget(Math.max(left.length, right.length));
  return budget > 0 && editDistance(left, right, budget) <= budget;
}

/** The canonical "Artist — Title" string a suggestion commits as. */
export function trackLabel(track: Track): string {
  return `${track.artist} — ${track.title}`;
}

const SUGGESTION_STOP = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "to",
  "in",
  "on",
  "it",
  "is",
  "my",
  "me",
  "you",
  "i",
  "we",
  "oh",
  "do",
  "does",
  "how",
  "what",
  "who",
  "can",
  "this",
  "that",
  "for",
  "with",
  "your",
  "im",
  "just",
]);

/**
 * Autocomplete ranking. Only titles and artist names that actually resemble
 * the typed text score above zero — lyric fragments must not surface unrelated
 * chart hits from a fuzzy remote search.
 */
export function scoreSuggestion(query: string, track: { title: string; artist: string }): number {
  const q = normalize(query);
  if (!q) return 0;

  const title = normalize(track.title);
  const artist = normalize(track.artist);
  const combined = `${artist} ${title}`;
  const hayWords = combined.split(" ").filter(Boolean);

  if (title === q || artist === q) return 1000;
  if (title.startsWith(q)) return 900 - Math.min(200, title.length);
  if (artist.startsWith(q)) return 800 - Math.min(200, artist.length);
  if (q.length >= 3 && title.includes(q)) return 750;
  if (q.length >= 3 && artist.includes(q)) return 700;

  const tokens = q.split(" ").filter(Boolean);
  const significant = tokens.filter((token) => token.length >= 2 && !SUGGESTION_STOP.has(token));
  const required = significant.length ? significant : tokens;

  const hits = required.filter((token) => tokenMatchesHaystack(token, combined, hayWords));

  // Short title-like queries: every significant token must appear in the name.
  if (required.length <= 4) {
    if (hits.length === required.length) return 600;
    return 0;
  }

  // Longer strings are almost always lyrics, not a title. Demand a real
  // overlap so "how does it feel to treat me" cannot propose an unrelated hit.
  if (hits.length >= Math.min(required.length, Math.max(2, Math.ceil(required.length * 0.6)))) {
    return 200 + hits.length * 20;
  }

  return 0;
}

function tokenMatchesHaystack(token: string, combined: string, hayWords: string[]): boolean {
  if (combined.includes(token)) return true;
  if (token.length < 4) return false;

  for (const word of hayWords) {
    if (Math.abs(word.length - token.length) > 1) continue;
    if (editDistance(token, word, 1) <= 1) return true;
  }
  return false;
}

export function judgeGuess(raw: string, answer: Track): GuessVerdict {
  const guess = raw.trim();
  if (!guess) return "wrong";

  const answerTitle = normalize(answer.title);
  const answerArtist = primaryArtist(answer.artist);

  const parts = splitArtistTitle(guess);

  // A title match alone wins. Requiring the artist half too would punish
  // players who know the song but not who released it.
  if (parts.titleCandidates.some((candidate) => looseEquals(candidate, answerTitle))) {
    return "correct";
  }

  const mentionsArtist = [...parts.artistCandidates, ...parts.titleCandidates].some((candidate) =>
    looseEquals(primaryArtist(candidate), answerArtist),
  );

  return mentionsArtist ? "close" : "wrong";
}

/**
 * Players type "Artist - Title" and "Title - Artist" in roughly equal measure,
 * so both halves are offered as both candidates rather than guessing intent.
 */
function splitArtistTitle(input: string): {
  artistCandidates: string[];
  titleCandidates: string[];
} {
  const separator = /\s+[—–-]\s+|\s+[–—]\s*|\s*[—–]\s*/;
  const segments = input.split(separator).map((s) => s.trim()).filter(Boolean);

  if (segments.length < 2) {
    return { artistCandidates: [], titleCandidates: [input] };
  }

  const [first, ...rest] = segments;
  const second = rest.join(" - ");

  return {
    artistCandidates: [first, second],
    titleCandidates: [second, first, input],
  };
}
