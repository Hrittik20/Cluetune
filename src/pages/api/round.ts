import type { APIRoute } from "astro";
import {
  CATALOG,
  dailyGuessablePool,
  filterCatalog,
  getPack,
  getTrack as getCatalogTrack,
  shuffleByPopularity,
} from "../../lib/catalog";
import { dailyTrack, isValidDateKey, localDateKey, puzzleNumber, shuffleDeterministic } from "../../lib/daily";
import { fetchChartCatalog, lookupChartTrack } from "../../lib/providers/charts";
import { fetchLyricSnippet } from "../../lib/providers/lyrics";
import { resolvePlayable, resolveTrack } from "../../lib/providers/resolver";
import type { Decade, Difficulty, GameMode, Genre, ModeFilters, ResolvedTrack, Track } from "../../lib/types";

export const prerender = false;

/**
 * Serves the track(s) for a round, already resolved to a playable source.
 *
 * The answer is included in the payload because guess matching runs on the
 * client — that is what makes typing feel instant and keeps the game playable
 * with no account. The trade is that a determined player can read the answer
 * out of the network tab. That is the same bargain every game in this genre
 * makes, and moving matching server-side would cost a round-trip per keystroke
 * for a guarantee that only matters to someone cheating themselves.
 */
export const GET: APIRoute = async ({ url }) => {
  const mode = (url.searchParams.get("mode") ?? "unlimited") as GameMode;

  try {
    if (mode === "daily") return await dailyRound(url);
    if (mode === "gauntlet") return await gauntletRound(url);
    return await poolRound(url, mode);
  } catch {
    return json({ error: "Could not build a round. Try again." }, 500);
  }
};

async function dailyRound(url: URL): Promise<Response> {
  const requested = url.searchParams.get("date") ?? "";
  const dateKey = isValidDateKey(requested) ? requested : localDateKey();

  // Walk forward through the deterministic order until something is playable,
  // so a provider gap never leaves the day with no puzzle at all.
  const ordered = rotate(
    shuffleDeterministic(dailyGuessablePool(CATALOG), "cluetune-daily-fallback"),
    puzzleNumber(dateKey),
  );
  const primary = dailyTrack(dateKey);
  const [resolved] = await resolvePlayable([primary, ...ordered.filter((t) => t.id !== primary.id)], 1);

  if (!resolved) return json({ error: "No playable track for today." }, 503);

  return json(
    {
      mode: "daily",
      dateKey,
      puzzle: puzzleNumber(dateKey),
      rounds: [resolved],
    },
    200,
    // Everyone on a given local date shares a puzzle, so it caches well.
    "public, max-age=300, s-maxage=3600",
  );
}

async function gauntletRound(url: URL): Promise<Response> {
  const pack = getPack(url.searchParams.get("pack") ?? "");
  if (!pack) return json({ error: "Unknown genre pack." }, 400);

  const pool = filterCatalog({ genres: pack.genres, decades: [], difficulty: [1, 5] });
  const seed = url.searchParams.get("seed") ?? `${pack.slug}-${Date.now()}`;
  const rounds = await resolvePlayable(shuffleDeterministic(pool, seed), 5);

  if (rounds.length < 2) return json({ error: "Not enough playable tracks in this pack." }, 503);

  return json({ mode: "gauntlet", pack: pack.slug, seed, rounds });
}

async function poolRound(url: URL, mode: GameMode): Promise<Response> {
  const trackId = url.searchParams.get("track");

  // Challenge links pin an exact track so both players hear the same clip.
  if (trackId) {
    const track = (await resolveKnownTrack(trackId)) ?? undefined;
    if (!track) return json({ error: "Unknown track." }, 404);

    const resolved = await resolveTrack(track);
    if (!resolved.source) return json({ error: resolved.unavailableReason ?? "Unavailable." }, 503);

    if (mode === "lyric-flip") {
      const lyrics = await fetchLyricSnippet(track).catch(() => null);
      if (!lyrics) return json({ error: "No lyrics for this track." }, 503);
      return json({ mode, rounds: [{ ...resolved, lyrics }] });
    }

    return json({ mode, rounds: [resolved] });
  }

  const filters = parseFilters(url);
  const exclude = new Set((url.searchParams.get("exclude") ?? "").split(",").filter(Boolean));
  const want = clamp(Number.parseInt(url.searchParams.get("count") ?? "3", 10) || 3, 1, 5);

  const source = await playablePool(mode);
  let pool = filterCatalog(filters, source).filter((track) => !exclude.has(track.id));

  // Rather than fail a narrow filter set, recycle the unfiltered pool once the
  // player has exhausted it. Repeats beat a dead end mid-session.
  if (pool.length < want) {
    pool = filterCatalog(filters, source);
  }
  if (!pool.length) return json({ error: "No tracks match those filters." }, 404);

  const rounds = await resolvePlayable(shuffleByPopularity(pool), want);
  if (!rounds.length) return json({ error: "No playable tracks right now." }, 503);

  if (mode === "lyric-flip") {
    const withLyrics = await attachLyrics(rounds, shuffleByPopularity(pool), want);
    if (!withLyrics.length) return json({ error: "No tracks with lyrics matched those filters." }, 503);
    return json({ mode, rounds: withLyrics });
  }

  return json({ mode, rounds });
}

function parseFilters(url: URL): ModeFilters {
  const genres = split<Genre>(url.searchParams.get("genres"));
  const decades = split<Decade>(url.searchParams.get("decades"));

  const min = clamp(Number.parseInt(url.searchParams.get("dmin") ?? "1", 10) || 1, 1, 5) as Difficulty;
  const max = clamp(Number.parseInt(url.searchParams.get("dmax") ?? "3", 10) || 3, 1, 5) as Difficulty;

  return {
    genres,
    decades,
    difficulty: min <= max ? [min, max] : [max, min],
  };
}

function split<T extends string>(value: string | null): T[] {
  return (value ?? "").split(",").filter(Boolean) as T[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function rotate<T>(items: T[], by: number): T[] {
  if (!items.length) return items;
  const offset = ((by % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

async function playablePool(mode: GameMode): Promise<Track[]> {
  // Daily and gauntlet stay on the editorial list so a rotating Spotify
  // playlist cannot change a shared puzzle or a named pack mid-week.
  if (mode === "daily" || mode === "gauntlet") return CATALOG;

  const charts = await fetchChartCatalog().catch(() => []);
  if (!charts.length) return CATALOG;

  const seen = new Set(CATALOG.map((track) => identityKey(track)));
  return [...CATALOG, ...charts.filter((track) => !seen.has(identityKey(track)))];
}

function identityKey(track: Track): string {
  return `${track.artist}::${track.title}`.toLowerCase().replace(/[^a-z0-9:]/g, "");
}

async function resolveKnownTrack(id: string): Promise<Track | undefined> {
  return getCatalogTrack(id) ?? (await lookupChartTrack(id));
}

async function attachLyrics(
  seed: ResolvedTrack[],
  fallbackPool: Track[],
  want: number,
): Promise<ResolvedTrack[]> {
  const found: ResolvedTrack[] = [];
  const seen = new Set<string>();

  const tryList = async (tracks: ResolvedTrack[] | Track[]) => {
    for (let i = 0; i < tracks.length && found.length < want; i += 4) {
      const batch = tracks.slice(i, i + 4);
      const settled = await Promise.all(
        batch.map(async (entry) => {
          const resolved = "source" in entry ? (entry as ResolvedTrack) : await resolveTrack(entry as Track);
          if (!resolved.source || seen.has(resolved.track.id)) return null;
          const lyrics = await fetchLyricSnippet(resolved.track).catch(() => null);
          if (!lyrics) return null;
          seen.add(resolved.track.id);
          return { ...resolved, lyrics };
        }),
      );

      for (const item of settled) {
        if (item && found.length < want) found.push(item);
      }
    }
  };

  await tryList(seed);

  if (found.length < want) {
    const extras = fallbackPool.filter((track) => !seen.has(track.id));
    await tryList(extras);
  }

  return found;
}

function json(body: unknown, status = 200, cacheControl = "no-store"): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl,
    },
  });
}
