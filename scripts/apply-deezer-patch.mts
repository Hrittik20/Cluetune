/**
 * Reads scripts/deezer-id-patch.json (produced by fetch-deezer-ids.mts) and
 * injects deezerId values into catalog.ts using a simple text replacement.
 *
 *   npx tsx scripts/apply-deezer-patch.mts
 *
 * The script only touches lines that call t() for tracks present in the patch.
 * After running, review the diff with `git diff src/lib/catalog.ts`.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(__dir, "../src/lib/catalog.ts");
const patchPath = resolve(__dir, "./deezer-id-patch.json");

const patch = JSON.parse(await readFile(patchPath, "utf8")) as Record<string, number>;
let catalog = await readFile(catalogPath, "utf8");

let applied = 0;
let skipped = 0;

for (const [trackId, deezerId] of Object.entries(patch)) {
  // Match the t() call that has this exact id as first argument.
  // e.g.  t("blinding-lights", "Blinding Lights", ..., 1),
  // We replace the closing ", <difficulty>)" with ", <difficulty>, <deezerId>)"
  const escaped = trackId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Match lines that already have this id AND do NOT yet have a deezerId
  // (the deezerId would be a bare integer after the difficulty integer).
  const withoutId = new RegExp(
    `(t\\("${escaped}",[^)]+,\\s*(1|2|3|4|5)\\))`,
    "g",
  );

  if (!withoutId.test(catalog)) {
    skipped++;
    continue;
  }

  // Reset lastIndex after test()
  withoutId.lastIndex = 0;

  catalog = catalog.replace(withoutId, (match, _full, _difficulty) => {
    // Already has a 8th arg? (would end with integer before closing paren)
    if (/,\s*\d+\s*\)$/.test(match.slice(match.lastIndexOf(",", match.length - 2)))) {
      return match; // already patched
    }
    return match.slice(0, -1) + `, ${deezerId})`;
  });

  applied++;
}

await writeFile(catalogPath, catalog, "utf8");
console.log(`Applied ${applied} Deezer IDs to catalog.ts (${skipped} already present / not matched).`);
