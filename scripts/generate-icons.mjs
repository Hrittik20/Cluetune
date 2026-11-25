/**
 * Renders the favicon set from one record glyph: favicon.svg, the PNG sizes
 * referenced by Layout.astro and site.webmanifest, and a PNG-payload favicon.ico.
 * Run via `npm run icons:generate`.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/** The disc stays inside the 80% maskable safe zone. */
const glyph = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" fill="#08080a"/>
  <circle cx="32" cy="32" r="24" fill="#1c1c21"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1"/>
  <circle cx="32" cy="32" r="16" fill="none" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1"/>
  <circle cx="32" cy="32" r="10" fill="#efe7d6"/>
  <circle cx="32" cy="32" r="2.25" fill="#08080a"/>
</svg>`;

writeFileSync(join(publicDir, "favicon.svg"), glyph(14));

const square = Buffer.from(glyph(0));
const sizes = {
  "favicon-96x96.png": 96,
  "apple-touch-icon.png": 180,
  "web-app-manifest-192x192.png": 192,
  "web-app-manifest-512x512.png": 512,
};

for (const [name, size] of Object.entries(sizes)) {
  await sharp(square, { density: (72 * size) / 64 }).resize(size, size).png().toFile(join(publicDir, name));
}

const icoPng = await sharp(Buffer.from(glyph(14)), { density: (72 * 48) / 64 }).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6);
header.writeUInt8(48, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(icoPng.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync(join(publicDir, "favicon.ico"), Buffer.concat([header, icoPng]));

console.log("Wrote favicon set to", publicDir);
