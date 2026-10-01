/**
 * Pins an iTunes preview for every catalog entry in
 * src/lib/providers/itunes-pins.json, which the resolver serves without any
 * provider round-trip.
 *
 * Apple 403s uncached iTunes API requests from Cloudflare Worker IPs, and
 * Deezer withholds previews from some Worker egress regions (India), so the
 * Worker cannot be trusted to find a clip at request time. Preview URLs are
 * unsigned CDN links that browsers fetch directly, so pinning them is safe.
 *
 * Run from a normal residential/office network:
 *
 *   npx tsx scripts/fetch-itunes-ids.mts
 *
 * Existing track IDs are kept; every run re-fetches their preview URLs in
 * batches, so re-running also repairs any URL Apple has rotated.
 */

import { readFile, writeFile } from "node:fs/promises";
import { CATALOG } from "../src/lib/catalog.ts";
import { searchItunes, type ItunesResult } from "../src/lib/providers/itunes.ts";
import type { ItunesPin } from "../src/lib/providers/itunes-pins.ts";

const outputUrl = new URL("../src/lib/providers/itunes-pins.json", import.meta.url);
// Apple allows roughly 20 requests/minute/IP.
const RATE_LIMIT_MS = 3100;
const LOOKUP_BATCH = 150;
const ALTERNATE_VERSION = /\b(live|remix|acoustic|instrumental|karaoke|sped up|slowed|demo)\b/i;

const pins = JSON.parse(await readFile(outputUrl, "utf8").catch(() => "{}")) as Record<string, ItunesPin>;
let found = 0;
let missing = 0;

for (const track of CATALOG) {
  if (pins[track.id]) continue;

  const hit = await findPinnable(track.title, track.artist);
  if (hit?.previewUrl) {
    pins[track.id] = toPin(hit);
    found++;
    console.log(`✓ ${track.artist} – ${track.title}  →  ${hit.trackId} (${hit.artist} – ${hit.title})`);
  } else {
    missing++;
    console.log(`✗ ${track.artist} – ${track.title}`);
  }

  // Write as we go so an interrupted run keeps its progress.
  await save();
  await sleep(RATE_LIMIT_MS);
}

const entries = Object.entries(pins);
let refreshed = 0;
for (let i = 0; i < entries.length; i += LOOKUP_BATCH) {
  const batch = entries.slice(i, i + LOOKUP_BATCH);
  const ids = batch.map(([, pin]) => pin.itunesId).join(",");
  const response = await fetch(`https://itunes.apple.com/lookup?id=${ids}&entity=song`);
  if (!response.ok) {
    console.warn(`Lookup HTTP ${response.status}; keeping existing URLs for this batch.`);
    continue;
  }

  const data = (await response.json()) as { results?: ItunesApiTrack[] };
  const byId = new Map((data.results ?? []).map((item) => [item.trackId, item]));
  for (const [trackId, pin] of batch) {
    const item = byId.get(pin.itunesId);
    if (!item?.previewUrl) {
      console.warn(`! ${trackId}: iTunes ${pin.itunesId} no longer has a preview`);
      continue;
    }
    pins[trackId] = {
      itunesId: pin.itunesId,
      previewUrl: item.previewUrl,
      artworkUrl: item.artworkUrl100?.replace("100x100bb", "600x600bb"),
      durationMs: item.trackTimeMillis,
    };
    refreshed++;
  }
  await sleep(RATE_LIMIT_MS);
}

await save();
console.log(`\nDone. ${found} new, ${missing} missing, ${refreshed} refreshed, ${entries.length} total.`);

interface ItunesApiTrack {
  trackId: number;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
}

function toPin(result: ItunesResult): ItunesPin {
  return {
    itunesId: result.trackId,
    previewUrl: result.previewUrl!,
    artworkUrl: result.artworkUrl,
    durationMs: result.durationMs,
  };
}

/**
 * Stricter than the runtime matcher: a pin is permanent, so it must match the
 * title, not just the artist — otherwise a miss pins another song.
 */
async function findPinnable(title: string, artist: string): Promise<ItunesResult | null> {
  const wantTitle = simplify(title);
  const wantArtist = simplify(artist);
  const titleMatches = (result: ItunesResult) => {
    const got = simplify(result.title);
    return got.startsWith(wantTitle) || wantTitle.startsWith(got);
  };

  for (const term of [`${artist} ${title}`, title]) {
    const results = await searchItunes(term, 25).catch(() => []);
    const hit = results.find(
      (result) =>
        result.previewUrl &&
        titleMatches(result) &&
        (!ALTERNATE_VERSION.test(result.title) || ALTERNATE_VERSION.test(title)) &&
        simplify(result.artist).includes(wantArtist),
    );
    if (hit) return hit;
    await sleep(RATE_LIMIT_MS);
  }
  return null;
}

function simplify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

async function save(): Promise<void> {
  const sorted = Object.fromEntries(Object.entries(pins).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(outputUrl, JSON.stringify(sorted, null, 2) + "\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
