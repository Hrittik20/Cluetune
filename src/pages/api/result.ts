import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getTrack } from "../../lib/catalog";
import { COUNTED_MODES } from "../../lib/difficulty";
import { MAX_ATTEMPTS } from "../../lib/game";
import { readOneSongStats, recordSongResult } from "../../lib/song-stats";
import type { GameMode } from "../../lib/types";

export const prerender = false;

const PLAYER_ID = /^[a-z0-9]{6,32}$/i;
/** Chart tracks are minted from provider ids at round time, so they are not in the catalogue. */
const CHART_TRACK_ID = /^(sp|it|dz)-[A-Za-z0-9]{1,40}$/;

/**
 * Records one finished round and returns the song's updated totals for the
 * reveal. Only finished rounds are sent; abandoned ones never reach here.
 *
 * Results cannot be verified (the answer is on the client), so this only
 * guards against accidents and casual abuse: one result per player per song,
 * plus a per-IP rate limit.
 */
export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as Partial<{
    trackId: string;
    playerId: string;
    mode: GameMode;
    attempt: number | null;
  }> | null;

  const trackId = body?.trackId ?? "";
  const playerId = body?.playerId ?? "";
  const mode = body?.mode;
  const attempt = body?.attempt ?? null;

  const validTrack = Boolean(getTrack(trackId)) || CHART_TRACK_ID.test(trackId);
  const validAttempt = attempt === null || (Number.isInteger(attempt) && attempt >= 1 && attempt <= MAX_ATTEMPTS);

  if (!validTrack || !PLAYER_ID.test(playerId) || !mode || !COUNTED_MODES.has(mode) || !validAttempt) {
    return json({ error: "Invalid result." }, 400);
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const limit = await env.RESULT_LIMITER?.limit({ key: ip }).catch(() => ({ success: true }));
  if (limit && !limit.success) return json({ error: "Too many results." }, 429);

  try {
    const counted = await recordSongResult({ trackId, playerId, mode, attempt });
    const stats = await readOneSongStats(trackId);
    return json({ counted, stats });
  } catch {
    return json({ error: "Could not record result." }, 503);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
