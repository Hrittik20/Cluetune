import type { APIRoute } from "astro";
import { readEdge, writeEdge } from "../../lib/providers/edge-cache";
import { readOneSongStats } from "../../lib/song-stats";

export const prerender = false;

/** Totals for one song, for reveals that were not just submitted (e.g. revisiting a finished daily). */
export const GET: APIRoute = async ({ url }) => {
  const trackId = url.searchParams.get("track") ?? "";
  if (!trackId || trackId.length > 64) return json({ error: "Missing track." }, 400);

  const cacheKey = `song-stats/${encodeURIComponent(trackId)}`;
  const cached = await readEdge(cacheKey);
  if (cached) return cached;

  const stats = await readOneSongStats(trackId);
  return writeEdge(cacheKey, json({ stats }, 200, "public, max-age=60"), 60);
};

function json(body: unknown, status = 200, cacheControl = "no-store"): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": cacheControl },
  });
}
