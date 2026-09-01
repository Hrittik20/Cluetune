import type { AudioSource, ResolvedTrack, Track } from "../types";
import { TtlCache } from "./cache";
import { findDeezerPreview, lookupDeezerById } from "./deezer";
import { findItunesPreview, lookupByIsrc } from "./itunes";
import { lookupSpotifyTrack } from "./spotify";
import { findYouTubeVideo, youtubeClipFallbackEnabled } from "./youtube";

/**
 * Turns a catalog entry into something playable.
 *
 * The chain is ordered by how reliably each provider yields a clip that is
 * actually the original recording:
 *
 *   1. Spotify   — metadata + ISRC + album art. Never audio (previews were
 *                  withdrawn from the Web API on 2024-11-27).
 *   2. iTunes    — ISRC lookup first, then artist-verified search. Primary
 *                  audio source.
 *   3. Deezer    — catalogue backstop, stronger on non-US repertoire.
 *   4. YouTube   — reveal-only embed by default; clip source only behind an
 *                  explicit opt-in flag.
 *
 * A track that reaches the end of the chain with no audio is reported as
 * unavailable so the caller can drop it from the pool rather than serve a
 * silent, unwinnable round.
 */

const cache = new TtlCache<ResolvedTrack>(6 * 60 * 60_000);

export async function resolveTrack(track: Track): Promise<ResolvedTrack> {
  const hit = cache.get(track.id);
  if (hit !== undefined) return hit;

  const resolved = await resolveUncached(track);
  // Don't pin a provider miss for six hours — Workers in particular see
  // intermittent Apple/Deezer failures that would otherwise poison the isolate.
  if (resolved.source) cache.set(track.id, resolved);
  return resolved;
}

async function resolveUncached(track: Track): Promise<ResolvedTrack> {
  // Metadata is best-effort; a Spotify outage must not block playback.
  const spotify = await lookupSpotifyTrack(track.title, track.artist).catch(() => null);
  const isrc = track.isrc ?? spotify?.isrc;
  const artworkUrl = spotify?.artworkUrl;

  // ISRC is an exact recording identifier, so it cannot land on a cover.
  if (isrc) {
    const byIsrc = await lookupByIsrc(isrc).catch(() => null);
    if (byIsrc?.previewUrl) {
      return {
        track,
        source: audioSource(byIsrc.previewUrl, "itunes", {
          artworkUrl: artworkUrl ?? byIsrc.artworkUrl,
          durationMs: byIsrc.durationMs,
          attribution: "Preview via Apple Music",
        }),
      };
    }
  }

  const itunes = await findItunesPreview(track.title, track.artist).catch(() => null);
  if (itunes?.previewUrl) {
    return {
      track,
      source: audioSource(itunes.previewUrl, "itunes", {
        artworkUrl: artworkUrl ?? itunes.artworkUrl,
        durationMs: itunes.durationMs,
        attribution: "Preview via Apple Music",
      }),
    };
  }

  // When the catalog carries a pre-stored Deezer ID, use direct lookup — it
  // bypasses the search rate-limit that Deezer applies to serverless IPs.
  const deezerDirect = track.deezerId
    ? await lookupDeezerById(track.deezerId).catch(() => null)
    : null;
  if (deezerDirect?.previewUrl) {
    return {
      track,
      source: audioSource(deezerDirect.previewUrl, "deezer", {
        artworkUrl: artworkUrl ?? deezerDirect.artworkUrl,
        durationMs: deezerDirect.durationMs,
        attribution: "Preview via Deezer",
      }),
    };
  }

  const deezer = await findDeezerPreview(track.title, track.artist).catch(() => null);
  if (deezer?.previewUrl) {
    return {
      track,
      source: audioSource(deezer.previewUrl, "deezer", {
        artworkUrl: artworkUrl ?? deezer.artworkUrl,
        durationMs: deezer.durationMs,
        attribution: "Preview via Deezer",
      }),
    };
  }

  if (youtubeClipFallbackEnabled()) {
    const video = await findYouTubeVideo(track.title, track.artist).catch(() => null);
    if (video) {
      return {
        track,
        source: {
          kind: "youtube",
          ref: video.videoId,
          provider: "youtube",
          offsetMs: 0,
          artworkUrl: artworkUrl ?? video.thumbnailUrl,
          attribution: `YouTube · ${video.channel}`,
        },
      };
    }
  }

  return {
    track,
    source: null,
    unavailableReason: "No licensed preview is available for this recording.",
  };
}

interface SourceExtras {
  artworkUrl?: string;
  durationMs?: number;
  attribution: string;
}

function audioSource(url: string, provider: AudioSource["provider"], extras: SourceExtras): AudioSource {
  return {
    kind: "audio",
    ref: url,
    provider,
    // Preview clips are already cut from the most recognisable section, so the
    // game treats the clip itself as the timeline origin.
    offsetMs: 0,
    ...extras,
  };
}

/**
 * Resolves a shortlist and returns only playable entries.
 *
 * `maxAttempts` caps the number of tracks tried regardless of how many are
 * in the pool. On Cloudflare Workers the wall-clock limit is ~30 s; when
 * audio providers are rate-limited each attempt can take 3–4 s, so we keep
 * the cap tight (want + 3) to ensure a quick failure rather than a hang.
 * The caller can pass a larger cap for offline / local environments where
 * latency isn't a concern.
 */
export async function resolvePlayable(
  tracks: Track[],
  want: number,
  maxAttempts = Math.min(tracks.length, want + 3),
): Promise<ResolvedTrack[]> {
  const playable: ResolvedTrack[] = [];
  const limit = Math.min(tracks.length, maxAttempts);

  // One at a time so a miss does not fan out past Workers' 6 outbound sockets.
  for (let i = 0; i < limit && playable.length < want; i++) {
    const resolved = await resolveTrack(tracks[i]!).catch(() => null);
    if (resolved?.source) playable.push(resolved);
  }

  return playable;
}
