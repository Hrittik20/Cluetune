/**
 * Fetch iTunes track IDs for every catalog entry and write them to
 * src/lib/itunes-ids.json, which catalog.ts merges in at load time.
 *
 * Run from a normal residential/office network — the iTunes Search API is
 * unreliable from Cloudflare IPs, which is the whole reason the IDs are baked
 * in. The runtime only ever calls `/lookup?id=`, which is not search-gated.
 *
 *   npx tsx scripts/fetch-itunes-ids.mts
 *
 * Existing IDs are kept, so re-running only fills gaps for new tracks.
 */

import { readFile, writeFile } from "node:fs/promises";
import { CATALOG } from "../src/lib/catalog.ts";
import { searchItunes, type ItunesResult } from "../src/lib/providers/itunes.ts";

const outputUrl = new URL("../src/lib/itunes-ids.json", import.meta.url);
// Apple allows roughly 20 requests/minute/IP.
const RATE_LIMIT_MS = 3100;

const existing = JSON.parse(await readFile(outputUrl, "utf8").catch(() => "{}")) as Record<string, number>;
const ids: Record<string, number> = { ...existing };
let found = 0;
let missing = 0;

for (const track of CATALOG) {
  if (ids[track.id]) continue;

  const hit = await findPinnable(track.title, track.artist);
  if (hit) {
    ids[track.id] = hit.trackId;
    found++;
    console.log(`✓ ${track.artist} – ${track.title}  →  ${hit.trackId} (${hit.artist} – ${hit.title})`);
  } else {
    missing++;
    console.log(`✗ ${track.artist} – ${track.title}`);
  }

  // Write as we go so an interrupted run keeps its progress.
  await writeFile(outputUrl, JSON.stringify(sortKeys(ids), null, 2) + "\n");
  await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
}

console.log(`\nDone. ${found} new, ${missing} missing, ${Object.keys(ids).length} total.`);

/**
 * Stricter than the runtime matcher: an ID is pinned permanently, so it must
 * match the title, not just the artist — otherwise a miss pins another song.
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
      (result) => result.previewUrl && titleMatches(result) && simplify(result.artist).includes(wantArtist),
    );
    if (hit) return hit;
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
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

function sortKeys(record: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}
