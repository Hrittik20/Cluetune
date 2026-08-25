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
 * Suggestions deliberately span the whole music catalogue rather than only the
 * answerable pool — restricting the list to answerable tracks would turn the
 * dropdown into a cheat sheet.
 *
 * Local catalog hits are merged in first so the box stays responsive (and
 * useful) even when every upstream provider is down or unconfigured.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return json({ suggestions: [] });
  }

  const local = CATALOG.map((track) => ({ track, score: scoreSuggestion(query, track) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(
      ({ track }): SearchSuggestion => ({
        id: `catalog:${track.id}`,
        title: track.title,
        artist: track.artist,
        year: track.year,
      }),
    );

  const remote = await fetchRemote(query).catch(() => []);

  return json({ suggestions: dedupe([...local, ...remote]).slice(0, 10) });
};

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

  // iTunes needs no credentials, so the box still works on a bare checkout.
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
      // Short shared cache: query space is huge but repeats are bursty.
      "cache-control": "public, max-age=30, s-maxage=300",
    },
  });
}
