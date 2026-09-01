/**
 * Reads scripts/deezer-id-patch.json (produced by fetch-deezer-ids.mts) and
 * injects deezerId values into catalog.ts.
 *
 *   npx tsx scripts/apply-deezer-patch.mts
 *
 * After running, review the diff with `git diff src/lib/catalog.ts`.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(__dirname, "../src/lib/catalog.ts");
const patchPath = resolve(__dirname, "./deezer-id-patch.json");

const patch = JSON.parse(await readFile(patchPath, "utf8")) as Record<string, number>;
const lines = (await readFile(catalogPath, "utf8")).split("\n");

let applied = 0;
let skipped = 0;

for (const [trackId, deezerId] of Object.entries(patch)) {
  const needle = `t("${trackId}",`;
  const idx = lines.findIndex((line) => line.includes(needle));

  if (idx === -1) {
    skipped++;
    continue;
  }

  const line = lines[idx]!;

  // Skip if this deezerId is already on the line.
  if (line.includes(String(deezerId))) {
    skipped++;
    continue;
  }

  // Insert `, deezerId` immediately before the last `)` on the line.
  // Using lastIndexOf handles track names that contain their own parentheses
  // (e.g. "Running Up That Hill (A Deal with God)").
  const lastParen = line.lastIndexOf(")");
  if (lastParen === -1) {
    skipped++;
    continue;
  }

  lines[idx] = line.slice(0, lastParen) + `, ${deezerId}` + line.slice(lastParen);
  applied++;
}

await writeFile(catalogPath, lines.join("\n"), "utf8");
console.log(
  `Applied ${applied} Deezer IDs to catalog.ts (${skipped} already present / not matched).`,
);
