// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://cluetune.com',
  // Emit `about.html` instead of `about/index.html` so Cloudflare serves `/about`
  // directly and matches the slash-less URLs used in the sitemap, canonicals and hreflang.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  redirects: {
    '/daily': { status: 301, destination: '/' },
    '/faded': { status: 301, destination: '/drunk' },
    '/sped-up': { status: 301, destination: '/drunk' },
    '/lyric-flip': { status: 301, destination: '/lyrics' },
    ...Object.fromEntries(
      ['es', 'ja', 'fr', 'de', 'pt', 'ko', 'it', 'ru'].flatMap((lang) => [
        [`/${lang}/faded`, { status: 301, destination: `/${lang}/drunk` }],
        [`/${lang}/sped-up`, { status: 301, destination: `/${lang}/drunk` }],
      ]),
    ),
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  adapter: cloudflare({
    // Album art is remote URLs; don't require the Cloudflare Images product.
    imageService: "passthrough",
  }),
  // Game state lives in the browser. Don't provision Workers KV for unused sessions.
  session: false,
});
