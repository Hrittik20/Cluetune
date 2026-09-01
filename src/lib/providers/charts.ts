import type { Genre, Track } from "../types";
import { TtlCache, fetchWithTimeout } from "./cache";
import { hasSpotifyCredentials } from "./env";
import {
  fetchPlaylistTracks,
  lookupSpotifyById,
  type SpotifyTrackMeta,
} from "./spotify";
import { deezerSearchDisabled } from "./deezer";

/**
 * Extra pool for Unlimited / Sped-Up / Lyrics Guess.
 *
 * Daily and Gauntlet stay on the handwritten catalogue. These modes can
 * afford a rotating chart because nobody is sharing a single daily answer.
 *
 * Spotify editorial playlists are tried first when credentials exist, but
 * many new Web API apps now 403 those endpoints unless the app owner has
 * Premium. iTunes RSS and Deezer charts are keyless and are the reliable
 * path — they also happen to be the same services that already supply
 * preview audio.
 */

const SPOTIFY_PLAYLISTS: { id: string; genres: Genre[] }[] = [
  { id: "37i9dQZF1DXcBWIGoYBM5M", genres: ["pop"] },
  { id: "37i9dQZF1DX0XUsixWAsgE", genres: ["hip-hop"] },
  { id: "37i9dQZF1DX4SBhb3fqCJd", genres: ["rnb"] },
  { id: "37i9dQZF1DX9tPFwDMOaN1", genres: ["kpop"] },
  { id: "37i9dQZF1DX10zKzsJ2jva", genres: ["latin"] },
];

const ITUNES_CHARTS = [
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/50/songs.json",
  "https://rss.applemarketingtools.com/api/v2/gb/music/most-played/50/songs.json",
];

// Three endpoints instead of six so chart fetching stays within Cloudflare
// Workers' 50-subrequest-per-invocation budget (2 iTunes + 3 here = 5 upfront).
const DEEZER_CHARTS: { url: string; genres: Genre[] }[] = [
  { url: "https://api.deezer.com/chart/0/tracks?limit=50", genres: ["pop"] },
  { url: "https://api.deezer.com/chart/116/tracks?limit=40", genres: ["hip-hop"] },
  { url: "https://api.deezer.com/chart/165/tracks?limit=30", genres: ["rnb"] },
];

const chartCache = new TtlCache<Track[]>(6 * 60 * 60_000, 8);
const extrasById = new Map<string, Track>();

function remember(tracks: Track[]) {
  for (const track of tracks) extrasById.set(track.id, track);
}

export function getExtraTrack(id: string): Track | undefined {
  return extrasById.get(id);
}

export async function fetchChartCatalog(): Promise<Track[]> {
  const tracks = await chartCache.wrapIf(
    "charts",
    async () => {
      // Serial groups stay inside Workers' 6 simultaneous outbound connections.
      const itunes = await fetchItunesCharts().catch(() => [] as Track[]);
      // Deezer's public search API returns data:[] when the requesting IP is
      // rate-limited. Skip chart fetching if the breaker is already tripped so
      // we don't burn 3+ seconds × 3 chart calls on an already-blocked endpoint.
      const deezer = deezerSearchDisabled() ? [] : await fetchDeezerCharts().catch(() => [] as Track[]);
      const spotify = await fetchSpotifyCharts().catch(() => [] as Track[]);

      return dedupe([...spotify, ...itunes, ...deezer]);
    },
    (list) => list.length > 0,
  );

  remember(tracks);
  return tracks;
}

export async function lookupChartTrack(id: string): Promise<Track | undefined> {
  const cached = extrasById.get(id);
  if (cached) return cached;

  if (id.startsWith("sp-") && hasSpotifyCredentials()) {
    const meta = await lookupSpotifyById(id.slice(3)).catch(() => null);
    if (!meta) return undefined;
    const track = fromSpotify(meta, ["pop"]);
    if (track) remember([track]);
    return track ?? undefined;
  }

  if (id.startsWith("it-")) {
    const track = await lookupItunesTrack(id.slice(3)).catch(() => undefined);
    if (track) remember([track]);
    return track;
  }

  if (id.startsWith("dz-")) {
    const track = await lookupDeezerTrack(id.slice(3)).catch(() => undefined);
    if (track) remember([track]);
    return track;
  }

  return undefined;
}

async function fetchSpotifyCharts(): Promise<Track[]> {
  if (!hasSpotifyCredentials()) return [];

  const batches: Track[][] = [];
  for (const playlist of SPOTIFY_PLAYLISTS) {
    const items = await fetchPlaylistTracks(playlist.id, 50).catch(() => []);
    if (!items.length) break;
    batches.push(
      items.map((item) => fromSpotify(item, playlist.genres)).filter((track): track is Track => Boolean(track)),
    );
  }

  return batches.flat();
}

async function fetchItunesCharts(): Promise<Track[]> {
  const batches = await Promise.all(
    ITUNES_CHARTS.map(async (url) => {
      const response = await fetchWithTimeout(url);
      if (!response.ok) return [] as Track[];

      const data = (await response.json()) as {
        feed?: {
          results?: {
            id?: string;
            name?: string;
            artistName?: string;
            collectionName?: string;
            releaseDate?: string;
            genres?: { name?: string }[];
          }[];
        };
      };

      return (data.feed?.results ?? [])
        .map((item) => fromItunes(item))
        .filter((track): track is Track => Boolean(track));
    }),
  );

  return batches.flat();
}

async function fetchDeezerCharts(): Promise<Track[]> {
  const out: Track[] = [];

  for (const chart of DEEZER_CHARTS) {
    const response = await fetchWithTimeout(chart.url);
    if (!response.ok) continue;

    const data = (await response.json()) as {
      data?: {
        id?: number;
        title?: string;
        artist?: { name?: string };
        album?: { title?: string };
        release_date?: string;
      }[];
    };

    out.push(
      ...(data.data ?? [])
        .map((item) => fromDeezer(item, chart.genres))
        .filter((track): track is Track => Boolean(track)),
    );
  }

  return out;
}

function fromSpotify(meta: SpotifyTrackMeta, genres: Genre[]): Track | null {
  const popularity = meta.popularity ?? 0;
  if (popularity && popularity < 50) return null;

  return {
    id: `sp-${meta.spotifyId}`,
    title: meta.title,
    artist: meta.artist,
    album: meta.album,
    year: meta.year,
    genres,
    difficulty: popularity >= 75 ? 1 : 2,
    isrc: meta.isrc,
    spotifyId: meta.spotifyId,
  };
}

function fromItunes(item: {
  id?: string;
  name?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  genres?: { name?: string }[];
}): Track | null {
  if (!item.id || !item.name || !item.artistName) return null;

  return {
    id: `it-${item.id}`,
    title: item.name,
    artist: item.artistName,
    album: item.collectionName || item.name,
    year: Number.parseInt(item.releaseDate?.slice(0, 4) ?? "0", 10) || 0,
    genres: mapItunesGenres(item.genres),
    difficulty: 1,
  };
}

function fromDeezer(
  item: {
    id?: number;
    title?: string;
    artist?: { name?: string };
    album?: { title?: string };
  },
  genres: Genre[],
): Track | null {
  if (!item.id || !item.title || !item.artist?.name) return null;

  return {
    id: `dz-${item.id}`,
    title: item.title,
    artist: item.artist.name,
    album: item.album?.title || item.title,
    year: 0,
    genres,
    difficulty: 1,
  };
}

async function lookupItunesTrack(id: string): Promise<Track | undefined> {
  const response = await fetchWithTimeout(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song`);
  if (!response.ok) return undefined;

  const data = (await response.json()) as {
    results?: {
      trackId?: number;
      trackName?: string;
      artistName?: string;
      collectionName?: string;
      releaseDate?: string;
      primaryGenreName?: string;
    }[];
  };
  const item = data.results?.[0];
  if (!item?.trackId || !item.trackName || !item.artistName) return undefined;

  return {
    id: `it-${item.trackId}`,
    title: item.trackName,
    artist: item.artistName,
    album: item.collectionName || item.trackName,
    year: Number.parseInt(item.releaseDate?.slice(0, 4) ?? "0", 10) || 0,
    genres: mapItunesGenres([{ name: item.primaryGenreName }]),
    difficulty: 1,
  };
}

async function lookupDeezerTrack(id: string): Promise<Track | undefined> {
  const response = await fetchWithTimeout(`https://api.deezer.com/track/${encodeURIComponent(id)}`);
  if (!response.ok) return undefined;

  const item = (await response.json()) as {
    id?: number;
    title?: string;
    artist?: { name?: string };
    album?: { title?: string };
  };
  return fromDeezer(item, ["pop"]) ?? undefined;
}

function mapItunesGenres(genres: { name?: string }[] | undefined): Genre[] {
  const mapped = new Set<Genre>();

  for (const entry of genres ?? []) {
    const name = (entry.name ?? "").toLowerCase();
    if (name.includes("hip") || name.includes("rap")) mapped.add("hip-hop");
    else if (name.includes("r&b") || name.includes("soul")) mapped.add("rnb");
    else if (name.includes("k-pop") || name.includes("kpop")) mapped.add("kpop");
    else if (name.includes("afro")) mapped.add("afrobeats");
    else if (name.includes("latin") || name.includes("reggaeton")) mapped.add("latin");
    else if (name.includes("country")) mapped.add("country");
    else if (name.includes("metal")) mapped.add("metal");
    else if (name.includes("jazz")) mapped.add("jazz");
    else if (name.includes("electronic") || name.includes("dance") || name.includes("house")) mapped.add("electronic");
    else if (name.includes("rock") || name.includes("alternative") || name.includes("indie")) mapped.add("rock");
    else if (name.includes("pop")) mapped.add("pop");
  }

  if (!mapped.size) mapped.add("pop");
  return [...mapped];
}

function dedupe(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  const merged: Track[] = [];

  for (const track of tracks) {
    const key = `${track.artist}::${track.title}`.toLowerCase().replace(/[^a-z0-9:]/g, "");
    if (seen.has(key) || seen.has(track.id)) continue;
    seen.add(key);
    seen.add(track.id);
    merged.push(track);
  }

  return merged;
}
