import type { ResolvedTrack } from "../types";

/** Markets where Deezer's preview CDN is known to block browser playback. */
const PROXY_COUNTRIES = new Set(["IN", "BD", "PK", "LK", "NP"]);

export function clientCountry(request: Request): string {
  return (request.headers.get("cf-ipcountry") ?? "").toUpperCase();
}

export function shouldProxyAudio(request: Request): boolean {
  return PROXY_COUNTRIES.has(clientCountry(request));
}

/** Rewrites Deezer CDN URLs to our same-origin preview proxy when needed. */
export function proxyAudioForClient(rounds: ResolvedTrack[], request: Request): ResolvedTrack[] {
  if (!shouldProxyAudio(request)) return rounds;

  return rounds.map((round) => {
    if (round.source?.kind !== "audio" || round.source.provider !== "deezer") return round;

    return {
      ...round,
      source: {
        ...round.source,
        ref: `/api/preview?track=${encodeURIComponent(round.track.id)}`,
      },
    };
  });
}
