/**
 * Fetch Deezer track IDs for every catalog entry and write a patch JSON.
 *
 * Run this script from a network where Deezer search is accessible (e.g. a
 * US/EU VPN or a cloud shell). From India and Cloudflare IPs the search
 * endpoint silently returns data:[] due to rate-limiting.
 *
 *   npx tsx scripts/fetch-deezer-ids.mts
 *
 * The script outputs scripts/deezer-id-patch.json which maps each catalog
 * track id → Deezer track id. Apply the patch by passing it to
 * scripts/apply-deezer-patch.mts, or copy the values manually into catalog.ts.
 */

import { CATALOG } from "../src/lib/catalog.ts";

const DEEZER_SEARCH = "https://api.deezer.com/search";
const RATE_LIMIT_MS = 250; // stay under Deezer's ~20 req/5s limit

interface DeezerSearchResult {
  data?: { id: number; title: string; artist: { name: string }; preview: string }[];
}

async function findDeezerIdFor(title: string, artist: string): Promise<number | null> {
  const queries = [
    `artist:"${artist}" track:"${title}"`,
    `${artist} ${title}`,
  ];

  for (const q of queries) {
    const url = `${DEEZER_SEARCH}?limit=5&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Cluetune/1.0)" },
    });

    if (!res.ok) {
      console.warn(`Deezer HTTP ${res.status} for "${artist} - ${title}"`);
      continue;
    }

    const json = (await res.json()) as DeezerSearchResult;
    const results = json.data ?? [];

    // Prefer an exact artist match with a preview URL
    const normalise = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]/g, "");

    const wantArtist = normalise(artist);
    const wantTitle = normalise(title);

    const hit =
      results.find(
        (r) =>
          r.preview &&
          normalise(r.artist.name).includes(wantArtist) &&
          normalise(r.title) === wantTitle,
      ) ??
      results.find(
        (r) => r.preview && normalise(r.artist.name).includes(wantArtist),
      ) ??
      results.find((r) => r.preview);

    if (hit) return hit.id;
  }

  return null;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const patch: Record<string, number> = {};
let found = 0;
let missing = 0;

for (const track of CATALOG) {
  // Skip tracks that already have a Deezer ID in the catalog
  if (track.deezerId) {
    patch[track.id] = track.deezerId;
    found++;
    continue;
  }

  const id = await findDeezerIdFor(track.title, track.artist);

  if (id) {
    patch[track.id] = id;
    found++;
    console.log(`✓ ${track.artist} – ${track.title}  →  ${id}`);
  } else {
    missing++;
    console.log(`✗ ${track.artist} – ${track.title}  (not found)`);
  }

  await sleep(RATE_LIMIT_MS);
}

// Node v20+ accepts a URL object directly — no path manipulation needed.
const outputUrl = new URL("./deezer-id-patch.json", import.meta.url);
const fs = await import("node:fs/promises");
await fs.writeFile(outputUrl, JSON.stringify(patch, null, 2) + "\n");

console.log(
  `\nDone. ${found} found, ${missing} missing.\nPatch written to scripts/deezer-id-patch.json\n`,
);
console.log(`Next step: copy the deezerId values from the patch into catalog.ts,`);
console.log(`or run:  npx tsx scripts/apply-deezer-patch.mts`);
