import type { APIRoute } from "astro";
import { CATALOG } from "../../lib/catalog";
import { scoreSuggestion } from "../../lib/matching";
import { searchItunes } from "../../lib/providers/itunes";
import { hasSpotifyCredentials } from "../../lib/providers/env";
import { searchSpotify } from "../../lib/providers/spotify";
import type { SearchSuggestion } from "../../lib/types";
import { EXTRA_SUGGESTIONS } from "../../lib/extra-suggestions";

export const prerender = false;

/**
 * Autocomplete for the guess box.
 *
 * Suggestions must resemble the typed title or artist. Remote catalogues
 * happily return popular tracks for lyric-shaped queries; those are dropped
 * unless the words actually appear in the name.
 *
 * Priority order: catalog tracks (playable) → extra suggestions (popular songs
 * not in the catalog, for user guidance) → remote API results.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return json({ suggestions: [] });
  }

  const catalogSuggestions: SearchSuggestion[] = CATALOG.map((track) => ({
    id: `catalog:${track.id}`,
    title: track.title,
    artist: track.artist,
    year: track.year,
  }));

  const local = rank([...catalogSuggestions, ...EXTRA_SUGGESTIONS], query).slice(0, 8);

  const tokenCount = query.split(/\s+/).filter(Boolean).length;
  const remote = tokenCount >= 6 ? [] : await withDeadline(fetchRemote(query), REMOTE_BUDGET_MS);
  const suggestions = dedupe([...local, ...rank(remote ?? [], query)]).slice(0, 10);

  // A timed-out lookup keeps running and fills the provider cache, so the
  // partial answer must not be cached in front of it.
  return json({ suggestions }, 200, remote !== null);
};

/**
 * Upper bound on remote lookups. Local matches are instant; without this a
 * slow or stalled provider (token exchange, Spotify → iTunes fallback, a body
 * that never finishes streaming) holds them hostage and the box spins forever.
 */
const REMOTE_BUDGET_MS = 2000;

/** Resolves to null on timeout, and to an empty list on provider failure. */
function withDeadline<T>(promise: Promise<T[]>, ms: number): Promise<T[] | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });

  return Promise.race([promise.catch(() => [] as T[]), deadline]).finally(() => clearTimeout(timer));
}

function rank(suggestions: SearchSuggestion[], query: string): SearchSuggestion[] {
  return suggestions
    .map((suggestion) => ({ suggestion, score: scoreSuggestion(query, suggestion) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.suggestion);
}

async function fetchRemote(query: string): Promise<SearchSuggestion[]> {
  if (hasSpotifyCredentials()) {
    const results = await searchSpotify(query, 10);
    if (results.length) {
      return results.map((track) => ({
        id: `spotify:${track.spotifyId}`,
        title: track.title,
        artist: track.artist,
        year: track.year || undefined,
      }));
    }
  }

  const results = await searchItunes(query, 10);
  return results.map((track) => ({
    id: `itunes:${track.trackId}`,
    title: track.title,
    artist: track.artist,
    year: track.year || undefined,
  }));
}

function dedupe(suggestions: SearchSuggestion[]): SearchSuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.artist}::${suggestion.title}`.toLowerCase().replace(/[^a-z0-9:]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function json(body: unknown, status = 200, cacheable = true): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheable ? "public, max-age=30, s-maxage=300" : "no-store",
    },
  });
}
