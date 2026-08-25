/**
 * Prints catalogue coverage per genre, decade and Gauntlet pack.
 *
 * A pack that cannot comfortably outlast a 5-round run will repeat tracks
 * within a single session, so this is the check to run after editing
 * `src/lib/catalog.ts`. Reads the source with a regex rather than importing it,
 * which keeps the script runnable with plain `node`, no build step.
 */
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/catalog.ts", import.meta.url), "utf8");

const TRACK = /^\s*t\(\s*"([^"]+)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*"(?:[^"\\]|\\.)*",\s*(\d{4}),\s*\[([^\]]*)\],\s*(\d)\s*\)/gm;

const tracks = [...source.matchAll(TRACK)].map((m) => ({
  id: m[1],
  title: m[2],
  artist: m[3],
  year: Number(m[4]),
  genres: m[5].split(",").map((g) => g.trim().replace(/"/g, "")).filter(Boolean),
  difficulty: Number(m[6]),
}));

const PACKS = {
  hyperpop: ["hyperpop"],
  kpop: ["kpop"],
  afrobeats: ["afrobeats"],
  drill: ["drill"],
  throwback: ["pop", "rock", "rnb", "jazz", "country"],
  club: ["electronic"],
};

const tally = (items, key) =>
  items.reduce((acc, item) => {
    for (const value of [key(item)].flat()) acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

const table = (obj) =>
  Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${k.padEnd(14)} ${String(v).padStart(4)}`)
    .join("\n");

const ids = tracks.map((t) => t.id);
const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];

console.log(`Tracks parsed: ${tracks.length}`);
console.log(duplicates.length ? `DUPLICATE IDS: ${duplicates.join(", ")}` : "Duplicate ids: none");

console.log("\nBy genre:");
console.log(table(tally(tracks, (t) => t.genres)));

console.log("\nBy decade:");
console.log(table(tally(tracks, (t) => `${Math.max(1960, Math.floor(t.year / 10) * 10)}s`)));

console.log("\nBy difficulty:");
console.log(table(tally(tracks, (t) => `level ${t.difficulty}`)));

console.log("\nBy Gauntlet pack (5 rounds per run):");
const thin = [];
for (const [slug, genres] of Object.entries(PACKS)) {
  const size = tracks.filter((t) => t.genres.some((g) => genres.includes(g))).length;
  const flag = size < 10 ? "  <- thin, will repeat" : "";
  if (size < 10) thin.push(slug);
  console.log(`  ${slug.padEnd(14)} ${String(size).padStart(4)}${flag}`);
}

if (duplicates.length || thin.length) process.exitCode = 1;
