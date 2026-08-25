import { TtlCache, fetchWithTimeout } from "./cache";
import { hasSpotifyCredentials, serverEnv } from "./env";

/**
 * Spotify is Cluetune's metadata and catalogue authority: canonical titles,
 * artist credits, release years and album art all come from here.
 *
 * It is NOT the audio source, and cannot be. Spotify withdrew `preview_url`
 * from the Web API on 2024-11-27 for every application registered after that
 * date, and the field now returns null across search, single-track and
 * multi-get responses alike. A new app for cluetune.com therefore has no
 * supported path to a 30-second clip.
 *
 * Playable audio is resolved separately — see `./resolver`. The only compliant
 * Spotify playback route would be the Web Playback SDK, which requires every
 * listener to hold a Premium account and log in, and that is incompatible with
 * the product's no-login-instant-play promise.
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

interface CachedToken {
  token: string;
  expiresAt: number;
}

let tokenPromise: Promise<CachedToken | null> | null = null;

async function requestToken(): Promise<CachedToken | null> {
  const id = serverEnv("SPOTIFY_CLIENT_ID");
  const secret = serverEnv("SPOTIFY_CLIENT_SECRET");
  if (!id || !secret) return null;

  const credentials =
    typeof btoa === "function"
      ? btoa(`${id}:${secret}`)
      : Buffer.from(`${id}:${secret}`).toString("base64");

  const response = await fetchWithTimeout(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  return {
    token: data.access_token,
    // Retire the token a minute early to avoid racing its expiry mid-request.
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
  };
}

async function getToken(): Promise<string | null> {
  if (!hasSpotifyCredentials()) return null;

  const cached = await tokenPromise;
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  // Single in-flight refresh, shared by concurrent callers.
  tokenPromise = requestToken();
  return (await tokenPromise)?.token ?? null;
}

export interface SpotifyTrackMeta {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  artworkUrl?: string;
  isrc?: string;
  durationMs?: number;
  externalUrl?: string;
}

interface SpotifyApiTrack {
  id: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; release_date?: string; images?: { url: string; width: number }[] };
  external_ids?: { isrc?: string };
  external_urls?: { spotify?: string };
}

function mapTrack(track: SpotifyApiTrack): SpotifyTrackMeta {
  // Images come back widest-first; the second entry is the 300px variant.
  const artwork = track.album.images?.[1]?.url ?? track.album.images?.[0]?.url;

  return {
    spotifyId: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    year: Number.parseInt(track.album.release_date?.slice(0, 4) ?? "0", 10) || 0,
    artworkUrl: artwork,
    isrc: track.external_ids?.isrc,
    durationMs: track.duration_ms,
    externalUrl: track.external_urls?.spotify,
  };
}

const searchCache = new TtlCache<SpotifyTrackMeta[]>(10 * 60_000);

export async function searchSpotify(query: string, limit = 8): Promise<SpotifyTrackMeta[]> {
  const token = await getToken();
  if (!token || !query.trim()) return [];

  return searchCache.wrap(`${limit}:${query.toLowerCase()}`, async () => {
    const url = `${API_BASE}/search?type=track&limit=${limit}&q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return [];

    const data = (await response.json()) as { tracks?: { items?: SpotifyApiTrack[] } };
    return (data.tracks?.items ?? []).map(mapTrack);
  });
}

const trackCache = new TtlCache<SpotifyTrackMeta | null>(60 * 60_000);

/** Resolves catalog metadata for one "artist title" pair. */
export async function lookupSpotifyTrack(
  title: string,
  artist: string,
): Promise<SpotifyTrackMeta | null> {
  const key = `${artist}::${title}`.toLowerCase();

  return trackCache.wrap(key, async () => {
    const query = `track:${title} artist:${artist}`;
    const [best] = await searchSpotify(query, 1);
    if (best) return best;

    // Field-scoped search misses on punctuation-heavy titles; retry loosely.
    const [loose] = await searchSpotify(`${artist} ${title}`, 1);
    return loose ?? null;
  });
}
