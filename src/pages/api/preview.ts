import type { APIRoute } from "astro";
import { getTrack as getCatalogTrack } from "../../lib/catalog";
import { lookupChartTrack } from "../../lib/providers/charts";
import { readEdge, writeEdge } from "../../lib/providers/edge-cache";
import { lookupDeezerById } from "../../lib/providers/deezer";
import { lookupByIsrc } from "../../lib/providers/itunes";
import { itunesPin } from "../../lib/providers/itunes-pins";
import { lookupSpotifyTrack } from "../../lib/providers/spotify";

export const prerender = false;

/**
 * Streams a 30-second preview through Cluetune's origin.
 *
 * Deezer's preview CDN (cdnt-preview.dzcdn.net) is geo-restricted in India
 * and several other markets. Browsers in those regions cannot load the clip
 * even when /api/round returns a valid URL. Proxying through the Worker —
 * which can reach Deezer from a non-blocked edge — fixes playback without
 * changing the resolver chain for everyone else.
 */
export const GET: APIRoute = async ({ url }) => {
  const trackId = url.searchParams.get("track");
  if (!trackId) return new Response("Missing track id.", { status: 400 });

  const cacheKey = `preview/${encodeURIComponent(trackId)}`;
  const cached = await readEdge(cacheKey);
  if (cached) return cached;

  const track = getCatalogTrack(trackId) ?? (await lookupChartTrack(trackId));
  if (!track) return new Response("Unknown track.", { status: 404 });

  let previewUrl: string | undefined;

  if (track.deezerId) {
    const deezer = await lookupDeezerById(track.deezerId).catch(() => null);
    previewUrl = deezer?.previewUrl;
  }

  previewUrl ??= itunesPin(track.id)?.previewUrl;

  if (!previewUrl) {
    const spotify = await lookupSpotifyTrack(track.title, track.artist).catch(() => null);
    const isrc = track.isrc ?? spotify?.isrc;
    if (isrc) {
      const itunes = await lookupByIsrc(isrc).catch(() => null);
      previewUrl = itunes?.previewUrl;
    }
  }

  if (!previewUrl) return new Response("No preview available.", { status: 503 });

  const upstream = await fetch(previewUrl);
  if (!upstream.ok) return new Response("Preview upstream error.", { status: 502 });

  const response = new Response(upstream.body, {
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "audio/mpeg",
      "cache-control": "public, max-age=300",
      "access-control-allow-origin": "*",
    },
  });
  // The clip bytes never change for a track, unlike the signed upstream URL.
  return writeEdge(cacheKey, response, 7 * 24 * 60 * 60);
};
