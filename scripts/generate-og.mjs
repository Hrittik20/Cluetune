/**
 * Renders public/og.png from an inline SVG that mirrors og-card.astro.
 * Run via `npm run og:generate` (also runs before production builds).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "og.png");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="blob-a" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#007cf0"/>
      <stop offset="68%" stop-color="#007cf0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob-b" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00dfd8"/>
      <stop offset="66%" stop-color="#00dfd8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob-c" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7928ca"/>
      <stop offset="68%" stop-color="#7928ca" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob-d" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff0080"/>
      <stop offset="66%" stop-color="#ff0080" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="disc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007cf0"/>
      <stop offset="30%" stop-color="#00dfd8"/>
      <stop offset="60%" stop-color="#7928ca"/>
      <stop offset="82%" stop-color="#ff0080"/>
      <stop offset="100%" stop-color="#f9cb28"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#08080a"/>
  <ellipse cx="180" cy="120" rx="260" ry="260" fill="url(#blob-a)" opacity="0.55"/>
  <ellipse cx="1020" cy="80" rx="240" ry="240" fill="url(#blob-b)" opacity="0.55"/>
  <ellipse cx="480" cy="560" rx="280" ry="280" fill="url(#blob-c)" opacity="0.55"/>
  <ellipse cx="1080" cy="520" rx="210" ry="210" fill="url(#blob-d)" opacity="0.55"/>
  <g transform="translate(88, 72)">
    <circle cx="18" cy="18" r="18" fill="url(#disc)"/>
    <circle cx="18" cy="18" r="7" fill="#08080a"/>
    <text x="50" y="26" fill="#fafafa" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="-0.04em">Cluetune</text>
    <text x="0" y="120" fill="#fafafa" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="72" font-weight="600" letter-spacing="-0.055em">Guess the song</text>
    <text x="0" y="200" fill="#fafafa" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="72" font-weight="600" letter-spacing="-0.055em">from 1 second.</text>
    <text x="0" y="270" fill="#a1a1ac" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="26">A free guess song game. Daily puzzle, then unlimited rounds.</text>
    <text x="0" y="310" fill="#a1a1ac" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="26">No account.</text>
    <text x="0" y="480" fill="#6e6e7a" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="16" letter-spacing="0.16em">CLUETUNE.COM</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(out, png);
console.log(`Wrote ${out}`);
