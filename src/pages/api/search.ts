import type { APIRoute } from "astro";
import { CATALOG } from "../../lib/catalog";
import { scoreSuggestion } from "../../lib/matching";
import { searchItunes } from "../../lib/providers/itunes";
import { hasSpotifyCredentials } from "../../lib/providers/env";
import { searchSpotify } from "../../lib/providers/spotify";
import type { SearchSuggestion } from "../../lib/types";

export const prerender = false;

/**
 * Autocomplete for the guess box.
 *
 * Suggestions must resemble the typed title or artist. Remote catalogues
 * happily return popular tracks for lyric-shaped queries; those are dropped
 * unless the words actually appear in the name.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return json({ suggestions: [] });
  }

  const local = rank(
    CATALOG.map((track) => ({
      id: `catalog:${track.id}`,
      title: track.title,
      artist: track.artist,
      year: track.year,
    })),
    query,
  ).slice(0, 6);

  const tokenCount = query.split(/\s+/).filter(Boolean).length;
  const remote = tokenCount >= 6 ? [] : rank(await fetchRemote(query).catch(() => []), query);

  return json({ suggestions: dedupe([...local, ...remote]).slice(0, 8) });
};

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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=30, s-maxage=300",
    },
  });
}
