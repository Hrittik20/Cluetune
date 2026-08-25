import { TtlCache, fetchWithTimeout } from "./cache";

/**
 * Apple's iTunes Search API. No key, no OAuth, and it still returns a hosted
 * 30-second `previewUrl` per track — which makes it the practical primary
 * audio source now that Spotify previews are gone.
 *
 * Clips are streamed directly from Apple's CDN and never proxied, cached or
 * re-hosted by Cluetune, which keeps us inside the terms that allow preview
 * playback in the first place.
 *
 * Rate limit is roughly 20 requests/minute/IP and is not contractual, so
 * everything here is cached aggressively and degrades to the next provider.
 */

const SEARCH_URL = "https://itunes.apple.com/search";
const LOOKUP_URL = "https://itunes.apple.com/lookup";

export interface ItunesResult {
  trackId: number;
  title: string;
  artist: string;
  album: string;
  year: number;
  previewUrl?: string;
  artworkUrl?: string;
  durationMs?: number;
}

interface ItunesApiTrack {
  trackId: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
}

function mapResult(item: ItunesApiTrack): ItunesResult {
  return {
    trackId: item.trackId,
    title: item.trackName ?? "",
    artist: item.artistName ?? "",
    album: item.collectionName ?? "",
    year: Number.parseInt(item.releaseDate?.slice(0, 4) ?? "0", 10) || 0,
    previewUrl: item.previewUrl,
    // The 100px artwork URL upscales by simple substitution.
    artworkUrl: item.artworkUrl100?.replace("100x100bb", "600x600bb"),
    durationMs: item.trackTimeMillis,
  };
}

const cache = new TtlCache<ItunesResult[]>(60 * 60_000);

export async function searchItunes(term: string, limit = 8): Promise<ItunesResult[]> {
  if (!term.trim()) return [];

  return cache.wrap(`search:${limit}:${term.toLowerCase()}`, async () => {
    const url = `${SEARCH_URL}?media=music&entity=song&limit=${limit}&term=${encodeURIComponent(term)}`;

    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) return [];

      const data = (await response.json()) as { results?: ItunesApiTrack[] };
      return (data.results ?? []).map(mapResult);
    } catch {
      return [];
    }
  });
}

export async function lookupByIsrc(isrc: string): Promise<ItunesResult | null> {
  const results = await cache.wrap(`isrc:${isrc}`, async () => {
    try {
      const response = await fetchWithTimeout(`${LOOKUP_URL}?isrc=${encodeURIComponent(isrc)}&entity=song`);
      if (!response.ok) return [];

      const data = (await response.json()) as { results?: ItunesApiTrack[] };
      return (data.results ?? []).map(mapResult);
    } catch {
      return [];
    }
  });

  return results.find((result) => result.previewUrl) ?? null;
}

/**
 * Finds the entry that actually matches the requested artist, not just the
 * first result — iTunes readily returns karaoke covers and tribute-band
 * re-recordings above the original, and a cover would make the round
 * unwinnable.
 */
export async function findItunesPreview(title: string, artist: string): Promise<ItunesResult | null> {
  const results = await searchItunes(`${artist} ${title}`, 12);
  const wantedArtist = simplify(artist);
  const wantedTitle = simplify(title);

  const playable = results.filter((result) => result.previewUrl && !isDerivative(result));

  const exact = playable.find(
    (result) => simplify(result.artist).includes(wantedArtist) && simplify(result.title) === wantedTitle,
  );
  if (exact) return exact;

  const sameArtist = playable.find((result) => simplify(result.artist).includes(wantedArtist));
  if (sameArtist) return sameArtist;

  const sameTitle = playable.find((result) => simplify(result.title) === wantedTitle);
  return sameTitle ?? null;
}

function simplify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const DERIVATIVE = /\b(karaoke|tribute|cover|made popular by|originally performed|in the style of|instrumental version)\b/i;

function isDerivative(result: ItunesResult): boolean {
  return DERIVATIVE.test(result.artist) || DERIVATIVE.test(result.album) || DERIVATIVE.test(result.title);
}
