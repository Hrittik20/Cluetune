import type { APIRoute } from "astro";
import { hasSpotifyCredentials, hasYouTubeKey, serverEnv } from "../../lib/providers/env";
import { searchItunes, lookupByIsrc } from "../../lib/providers/itunes";
import { searchDeezer } from "../../lib/providers/deezer";
import { fetchWithTimeout } from "../../lib/providers/cache";

// Direct Deezer track ID lookup — bypasses the search endpoint rate-limit.
async function lookupDeezerById(id: number): Promise<{ title?: string; preview?: string } | null> {
  try {
    const r = await fetchWithTimeout(`https://api.deezer.com/track/${id}`);
    if (!r.ok) return null;
    const data = (await r.json()) as { error?: unknown; title?: string; preview?: string };
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}
import { CATALOG } from "../../lib/catalog";

export const prerender = false;

/**
 * Provider health-check. Useful for diagnosing "No clip to play" on a fresh
 * Cloudflare deployment — visit /api/health to see which providers are
 * reachable and whether the catalog is loaded.
 */
export const GET: APIRoute = async () => {
  const probe = "Blinding Lights The Weeknd";
  // ISRC for "Blinding Lights" – tests the /lookup?isrc= path which is separate
  // from the /search path and may work even when search is IP-blocked.
  const probeIsrc = "CAUM72000778";

  // Deezer track 3135556 = "Harder, Better, Faster, Stronger" by Daft Punk
  // Deezer ISRC for "Blinding Lights" = CAUM72000778
  const [itunes, deezer, itunesIsrc, deezerDirect, deezerIsrc] = await Promise.allSettled([
    searchItunes(probe, 1),
    searchDeezer(probe, 1),
    lookupByIsrc(probeIsrc),
    lookupDeezerById(3135556),
    fetchWithTimeout("https://api.deezer.com/track/isrc:CAUM72000778").then(async (r) => {
      const d = (await r.json()) as { error?: unknown; id?: number; title?: string; preview?: string };
      return d.error ? null : d;
    }),
  ]);

  let spotifyToken: "ok" | "no-credentials" | "error" = "no-credentials";
  if (hasSpotifyCredentials()) {
    try {
      const id = serverEnv("SPOTIFY_CLIENT_ID")!;
      const secret = serverEnv("SPOTIFY_CLIENT_SECRET")!;
      const credentials =
        typeof btoa === "function"
          ? btoa(`${id}:${secret}`)
          : Buffer.from(`${id}:${secret}`).toString("base64");
      const res = await fetchWithTimeout("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      spotifyToken = res.ok ? "ok" : "error";
    } catch {
      spotifyToken = "error";
    }
  }

  const itunesResult = itunes.status === "fulfilled" ? itunes.value : [];
  const deezerResult = deezer.status === "fulfilled" ? deezer.value : [];
  const itunesIsrcResult = itunesIsrc.status === "fulfilled" ? itunesIsrc.value : null;
  const deezerDirectResult = deezerDirect.status === "fulfilled" ? deezerDirect.value : null;
  const deezerIsrcResult = deezerIsrc.status === "fulfilled" ? deezerIsrc.value : null;

  const body = {
    catalog: { tracks: CATALOG.length },
    providers: {
      itunes: {
        search: itunesResult.length > 0 ? "ok" : itunes.status === "rejected" ? "error" : "no-results",
        isrcLookup: itunesIsrcResult?.previewUrl ? "ok" : itunesIsrc.status === "rejected" ? "error" : "no-results",
        hasPreview: itunesResult.some((r) => r.previewUrl) || Boolean(itunesIsrcResult?.previewUrl),
      },
      deezer: {
        search: deezerResult.length > 0 ? "ok" : deezer.status === "rejected" ? "error" : "no-results",
        directLookup: deezerDirectResult?.preview
          ? "ok"
          : deezerDirect.status === "rejected"
            ? "error"
            : "no-results",
        isrcLookup: deezerIsrcResult?.preview
          ? "ok"
          : deezerIsrc.status === "rejected"
            ? "error"
            : "no-results",
        hasPreview:
          deezerResult.some((r) => r.previewUrl) ||
          Boolean(deezerDirectResult?.preview) ||
          Boolean(deezerIsrcResult?.preview),
      },
      spotify: {
        credentialsConfigured: hasSpotifyCredentials(),
        tokenStatus: spotifyToken,
      },
      youtube: {
        keyConfigured: hasYouTubeKey(),
      },
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
};
