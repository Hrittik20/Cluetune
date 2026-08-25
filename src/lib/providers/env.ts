/**
 * Reads server-only configuration. Checks `process.env` first because Vercel
 * injects runtime environment variables there, then falls back to Vite's
 * build-time `import.meta.env` for local `astro dev`.
 *
 * Never import this from a client component — none of these values are
 * prefixed `PUBLIC_`, so referencing them in browser code would fail the build
 * rather than leak, but the boundary is worth keeping explicit.
 */
export function serverEnv(key: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  if (fromProcess) return fromProcess;

  const fromVite = (import.meta.env as Record<string, string | undefined>)[key];
  return fromVite || undefined;
}

export function hasSpotifyCredentials(): boolean {
  return Boolean(serverEnv("SPOTIFY_CLIENT_ID") && serverEnv("SPOTIFY_CLIENT_SECRET"));
}

export function hasYouTubeKey(): boolean {
  return Boolean(serverEnv("YOUTUBE_API_KEY"));
}
