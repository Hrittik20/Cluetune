import { TtlCache, fetchWithTimeout } from "./cache";

/**
 * Deezer's public search endpoint. Keyless, and still exposes a 30-second MP3
 * preview per track, so it backstops iTunes for catalogue gaps — Deezer tends
 * to have better coverage of Afrobeats, drill and European dance releases.
 *
 * Browser requests are blocked by CORS, which is fine: every call here runs
 * server-side inside an Astro endpoint. As with iTunes, the preview URL is
 * handed to the client and streamed from Deezer's CDN, never re-served by us.
 */

const SEARCH_URL = "https://api.deezer.com/search";

// Circuit breaker: Deezer's public search endpoint silently returns data:[]
// when the requesting IP is rate-limited (Cloudflare edge IPs in particular).
// After one empty response, we skip all search calls for 10 minutes so the
// Worker doesn't burn 3+ seconds per attempt before resolving the track.
let searchDisabledUntil = 0;

export function deezerSearchDisabled(): boolean {
  return Date.now() < searchDisabledUntil;
}

function tripDeezerSearch(): void {
  searchDisabledUntil = Date.now() + 10 * 60_000;
}

export interface DeezerResult {
  id: number;
  title: string;
  artist: string;
  album: string;
  previewUrl?: string;
  artworkUrl?: string;
  durationMs?: number;
}

interface DeezerApiTrack {
  id: number;
  title: string;
  title_short?: string;
  duration?: number;
  preview?: string;
  artist?: { name?: string };
  album?: { title?: string; cover_big?: string; cover_medium?: string };
}

const cache = new TtlCache<DeezerResult[]>(60 * 60_000);

export async function searchDeezer(query: string, limit = 10): Promise<DeezerResult[]> {
  if (!query.trim() || deezerSearchDisabled()) return [];

  return cache.wrapIf(
    `${limit}:${query.toLowerCase()}`,
    async () => {
      const url = `${SEARCH_URL}?limit=${limit}&q=${encodeURIComponent(query)}`;

      try {
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          tripDeezerSearch();
          return [];
        }

        const data = (await response.json()) as { data?: DeezerApiTrack[] };
        const results = (data.data ?? []).map((item) => ({
          id: item.id,
          title: item.title_short ?? item.title,
          artist: item.artist?.name ?? "",
          album: item.album?.title ?? "",
          previewUrl: item.preview || undefined,
          artworkUrl: item.album?.cover_big ?? item.album?.cover_medium,
          durationMs: item.duration ? item.duration * 1000 : undefined,
        }));

        // Empty data array on a 200 means the IP is silently rate-limited.
        // Trip the breaker so subsequent calls return immediately.
        if (!results.length) tripDeezerSearch();

        return results;
      } catch {
        tripDeezerSearch();
        return [];
      }
    },
    (results) => results.length > 0,
  );
}

/**
 * Direct lookup by a known Deezer track ID.
 *
 * The search endpoint is IP-blocked by Deezer from Cloudflare Workers and
 * some regions. The `/track/{id}` endpoint is NOT subject to the same
 * restriction and reliably returns a preview URL when the track has one.
 * Use this when the catalog entry carries a pre-stored `deezerId`.
 */
export async function lookupDeezerById(id: number): Promise<DeezerResult | null> {
  const cacheKey = `id:${id}`;
  const hit = cache.get(cacheKey);
  if (hit !== undefined) return hit.length ? hit[0]! : null;

  try {
    const response = await fetchWithTimeout(`https://api.deezer.com/track/${id}`);
    if (!response.ok) return null;

    const item = (await response.json()) as DeezerApiTrack & { error?: unknown };
    if (item.error || !item.id) return null;

    const result: DeezerResult = {
      id: item.id,
      title: item.title_short ?? item.title,
      artist: item.artist?.name ?? "",
      album: item.album?.title ?? "",
      previewUrl: item.preview || undefined,
      artworkUrl: item.album?.cover_big ?? item.album?.cover_medium,
      durationMs: item.duration ? item.duration * 1000 : undefined,
    };

    cache.set(cacheKey, result.previewUrl ? [result] : []);
    return result.previewUrl ? result : null;
  } catch {
    return null;
  }
}

export async function findDeezerPreview(title: string, artist: string): Promise<DeezerResult | null> {
  // Deezer supports field-scoped queries, which cuts out most cover versions.
  const scoped = await searchDeezer(`artist:"${artist}" track:"${title}"`, 5);
  const scopedHit = scoped.find((result) => result.previewUrl);
  if (scopedHit) return scopedHit;

  const loose = await searchDeezer(`${artist} ${title}`, 10);
  return loose.find((result) => result.previewUrl) ?? null;
}
