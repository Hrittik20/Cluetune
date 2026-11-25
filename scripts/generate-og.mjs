/**
 * Renders public/og.png from an inline SVG that mirrors og-card.astro.
 * Run via `npm run og:generate` (also runs before production builds).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "..", "public", "og.png");

const SANS = "Geist, Inter, ui-sans-serif, system-ui, sans-serif";
const MONO = "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace";

const grooves = Array.from({ length: 14 }, (_, i) => 126 + i * 12)
  .map((r) => `<circle cx="1010" cy="315" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1.5"/>`)
  .join("\n    ");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#08080a"/>

  <g>
    <circle cx="1010" cy="315" r="300" fill="#121215"/>
    ${grooves}
    <circle cx="1010" cy="315" r="96" fill="#efe7d6"/>
    <circle cx="1010" cy="315" r="78" fill="none" stroke="#18181b" stroke-opacity="0.22" stroke-width="1.5"/>
    <circle cx="1010" cy="315" r="6" fill="#08080a"/>
  </g>

  <g transform="translate(784 92) rotate(7)">
    <rect width="176" height="84" rx="14" fill="#ffffff"/>
    <rect x="4" y="4" width="168" height="76" rx="11" fill="#e5484d"/>
    <text x="88" y="34" text-anchor="middle" fill="#ffffff" fill-opacity="0.8" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="1.3">DIFFICULTY</text>
    <text x="88" y="64" text-anchor="middle" fill="#ffffff" font-family="${SANS}" font-size="28" font-weight="700">EXPERT</text>
  </g>

  <g transform="translate(88 88)">
    <circle cx="18" cy="18" r="17" fill="#fafafa"/>
    <circle cx="18" cy="18" r="12.5" fill="none" stroke="#08080a" stroke-opacity="0.35"/>
    <circle cx="18" cy="18" r="7" fill="#08080a"/>
    <circle cx="18" cy="18" r="2" fill="#fafafa"/>
    <text x="50" y="27" fill="#fafafa" font-family="${SANS}" font-size="28" font-weight="500">Cluetune</text>

    <text x="0" y="156" fill="#fafafa" font-family="${SANS}" font-size="72" font-weight="500" letter-spacing="-2">Guess the song</text>
    <text x="0" y="236" fill="#fafafa" font-family="${SANS}" font-size="72" font-weight="500" letter-spacing="-2">from 1 second</text>
    <text x="0" y="300" fill="#a1a1ac" font-family="${SANS}" font-size="26">Daily puzzle, then unlimited rounds.</text>
    <text x="0" y="338" fill="#a1a1ac" font-family="${SANS}" font-size="26">Free, in the browser, no account.</text>
    <text x="0" y="460" fill="#85858f" font-family="${MONO}" font-size="18">cluetune.com</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(out, png);
console.log(`Wrote ${out}`);
