import type { AudioSource, ResolvedTrack, Track } from "../types";
import { TtlCache } from "./cache";
import { findDeezerPreview } from "./deezer";
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
  return cache.wrap(track.id, () => resolveUncached(track));
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
 * Resolves a shortlist concurrently and returns only playable entries. Used to
 * pre-warm an Unlimited session so the next round never waits on a lookup.
 */
export async function resolvePlayable(tracks: Track[], want: number): Promise<ResolvedTrack[]> {
  const playable: ResolvedTrack[] = [];

  // Small batches keep us inside iTunes' informal per-minute rate limit.
  for (let i = 0; i < tracks.length && playable.length < want; i += 4) {
    const batch = tracks.slice(i, i + 4);
    const settled = await Promise.all(batch.map((track) => resolveTrack(track).catch(() => null)));

    for (const resolved of settled) {
      if (resolved?.source && playable.length < want) playable.push(resolved);
    }
  }

  return playable;
}
