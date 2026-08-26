import type { LyricSnippet, Track } from "../types";
import { TtlCache, fetchWithTimeout } from "./cache";

/**
 * Progressive lyric snippets for Lyrics Guess.
 *
 * Lines are fetched from LRCLIB (community lyrics, no key) and trimmed to a
 * short window so the round is a recognition puzzle, not a full-lyric dump.
 * Title and artist tokens are redacted so the page cannot spoiler itself.
 *
 * A miss or skip reveals the next pair of lines — same economy as the audio
 * ladder, different sense.
 */

export const LYRICS_PER_REVEAL = 2;
export const LYRIC_WINDOW = 12;

const API = "https://lrclib.net/api";
const USER_AGENT = "Cluetune/1.0 (https://cluetune.com)";
const cache = new TtlCache<LyricSnippet | null>(24 * 60 * 60_000, 400);

const STOP = new Set([
  "a",
  "an",
  "and",
  "da",
  "i",
  "in",
  "is",
  "it",
  "la",
  "me",
  "my",
  "na",
  "o",
  "of",
  "oh",
  "on",
  "or",
  "the",
  "to",
  "uh",
  "we",
  "ya",
  "yeah",
  "yo",
  "you",
]);

interface LrcLibTrack {
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

export async function fetchLyricSnippet(track: Track): Promise<LyricSnippet | null> {
  const key = `${track.artist}::${track.title}`.toLowerCase();

  return cache.wrap(key, async () => {
    const raw = await lookupLyrics(track);
    if (!raw) return null;

    const lines = buildWindow(raw, track);
    if (lines.length < 2) return null;

    return {
      lines,
      linesPerReveal: LYRICS_PER_REVEAL,
      attribution: "Lyric snippets via LRCLIB",
    };
  });
}

async function lookupLyrics(track: Track): Promise<string | null> {
  const title = bareTitle(track.title);
  const artist = primaryArtist(track.artist);

  const direct = await getLyrics(title, artist, track.album);
  if (direct) return direct;

  if (artist !== track.artist) {
    const retry = await getLyrics(title, track.artist, track.album);
    if (retry) return retry;
  }

  return searchLyrics(title, artist);
}

async function getLyrics(title: string, artist: string, album?: string): Promise<string | null> {
  const params = new URLSearchParams({ track_name: title, artist_name: artist });
  if (album) params.set("album_name", album);

  const response = await fetchWithTimeout(`${API}/get?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (response.status === 404 || !response.ok) return null;

  const data = (await response.json()) as LrcLibTrack;
  return extractBody(data);
}

async function searchLyrics(title: string, artist: string): Promise<string | null> {
  const params = new URLSearchParams({ track_name: title, artist_name: artist });
  const response = await fetchWithTimeout(`${API}/search?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) return null;

  const results = (await response.json()) as LrcLibTrack[];
  for (const entry of results ?? []) {
    const body = extractBody(entry);
    if (body) return body;
  }
  return null;
}

function extractBody(data: LrcLibTrack | null | undefined): string | null {
  if (!data || data.instrumental) return null;
  if (data.plainLyrics?.trim()) return data.plainLyrics;
  if (data.syncedLyrics?.trim()) {
    return data.syncedLyrics
      .split(/\r?\n/)
      .map((line) => line.replace(/\[\d+:\d+[^\]]*]/g, "").trim())
      .filter(Boolean)
      .join("\n");
  }
  return null;
}

export function buildWindow(raw: string, track: Track): string[] {
  const tagged = raw.split(/\r?\n/).map((line) => line.trim());
  const chorusAt = tagged.findIndex((line) => /^\s*\[(chorus|hook)\b/i.test(line));
  const from = chorusAt >= 0 ? tagged.slice(chorusAt) : tagged;

  const cleaned = from
    .map((line) => line.replace(/^\s*\[[^\]]+]\s*/g, "").trim())
    .filter((line) => line.length > 0 && !/^[\d*♪]+$/.test(line));

  let start = 0;
  while (start < Math.max(0, cleaned.length - 4) && cleaned[start]!.length < 14) {
    start += 1;
  }

  const window = cleaned.slice(start, start + LYRIC_WINDOW).map((line) => redact(line, track));
  return window.filter((line) => line.replace(/[_.\s]/g, "").length > 0);
}

function redact(line: string, track: Track): string {
  let out = line;
  const phrases = [track.title, bareTitle(track.title), track.artist, primaryArtist(track.artist)];

  for (const phrase of phrases) {
    if (phrase.length < 4) continue;
    out = out.replace(new RegExp(escapeRegExp(phrase), "ig"), (match) => "_".repeat(Math.max(4, match.length)));
  }

  const tokens = [...bareTitle(track.title).split(/\s+/), ...primaryArtist(track.artist).split(/\s+/)];
  for (const token of tokens) {
    const word = token.replace(/[^\p{L}\p{N}]/gu, "");
    if (word.length < 4 || STOP.has(word.toLowerCase())) continue;
    out = out.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, "ig"), (match) => "_".repeat(match.length));
  }

  return out.replace(/_{3,}/g, "_____");
}

function primaryArtist(artist: string): string {
  return artist.split(/,|&| feat\.? | ft\.? | featuring | with /i)[0]?.trim() || artist;
}

function bareTitle(title: string): string {
  return title
    .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")
    .replace(/\s+-\s+(remaster|radio edit|single version|from .*).*$/i, "")
    .trim() || title;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
