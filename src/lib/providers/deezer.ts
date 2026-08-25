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
  if (!query.trim()) return [];

  return cache.wrap(`${limit}:${query.toLowerCase()}`, async () => {
    const url = `${SEARCH_URL}?limit=${limit}&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) return [];

      const data = (await response.json()) as { data?: DeezerApiTrack[] };
      return (data.data ?? []).map((item) => ({
        id: item.id,
        title: item.title_short ?? item.title,
        artist: item.artist?.name ?? "",
        album: item.album?.title ?? "",
        previewUrl: item.preview || undefined,
        artworkUrl: item.album?.cover_big ?? item.album?.cover_medium,
        durationMs: item.duration ? item.duration * 1000 : undefined,
      }));
    } catch {
      return [];
    }
  });
}

export async function findDeezerPreview(title: string, artist: string): Promise<DeezerResult | null> {
  // Deezer supports field-scoped queries, which cuts out most cover versions.
  const scoped = await searchDeezer(`artist:"${artist}" track:"${title}"`, 5);
  const scopedHit = scoped.find((result) => result.previewUrl);
  if (scopedHit) return scopedHit;

  const loose = await searchDeezer(`${artist} ${title}`, 10);
  return loose.find((result) => result.previewUrl) ?? null;
}
