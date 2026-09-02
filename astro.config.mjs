// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://cluetune.com',
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
